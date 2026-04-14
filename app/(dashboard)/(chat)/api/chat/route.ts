import { generateTitleFromUserMessage } from '@/app/(dashboard)/(chat)/actions';
import { chat_research_prompt } from '@/lib/ai/prompts';
import { createDocumentTool, webSearchTool } from '@/lib/ai/tools';
import { isProductionEnvironment } from '@/lib/constants';
import { getCreditLimitCents, getCurrentUsageWindow, reconcileUserPlanStatus } from '@/lib/stripe/billing';
import { getMessagesByChatId, getUserAiCreditUsageTotal, incrementUserAiCreditUsage, saveChat, saveMessages } from '@/lib/db/queries';
import { gateway } from '@ai-sdk/gateway';
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  smoothStream,
  stepCountIs,
  streamText,
  type UIMessage,
} from 'ai';
import { isEmpty } from 'lodash';
import { revalidatePath } from 'next/cache';
import { v4 as uuid } from 'uuid';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers() // you need to pass the headers object.
    })
    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    const selectedUser = await reconcileUserPlanStatus(session.user.id);
    if (!selectedUser) {
      return new Response('User not found', { status: 404 });
    }

    const usageWindow = getCurrentUsageWindow({
      billingPeriodStart: selectedUser.billingPeriodStart,
      billingPeriodEnd: selectedUser.billingPeriodEnd,
    });
    const usedInWindowCents = await getUserAiCreditUsageTotal({
      userId: session.user.id,
      from: usageWindow.from,
      to: usageWindow.to,
    });
    const currentLimitCents = getCreditLimitCents((selectedUser.plan ?? 'free') as 'free' | 'pro' | 'plus');
    if (usedInWindowCents >= currentLimitCents) {
      return new Response('AI credit limit reached for your current plan', { status: 402 });
    }

    const body = await req.json();
    const chatId = body.id ?? body.chatId;
    const incomingMessages = (body.messages ?? []).filter(Boolean) as UIMessage[];
    const message = body.message as UIMessage | undefined;

    // Backward compatibility in case a single message payload is sent.
    const effectiveMessages =
      incomingMessages.length > 0
        ? incomingMessages
        : message
          ? [message]
          : [];

    if (!chatId || effectiveMessages.length === 0) {
      return new Response('Invalid chat payload', { status: 400 });
    }

    const latestUserMessage = [...effectiveMessages].reverse().find((m) => m.role === 'user');

    const messagesFromDb = await getMessagesByChatId({ id: chatId });

    // Create chat + generate title on first message
    const getPartText = (part: unknown): string | undefined => {
      if (!part || typeof part !== 'object') return undefined;
      const candidate = (part as { text?: unknown }).text;
      return typeof candidate === 'string' ? candidate : undefined;
    };

    if (isEmpty(messagesFromDb) && latestUserMessage) {
      const textContent = latestUserMessage.parts?.map(getPartText).find(Boolean) ?? '';
      const title = await generateTitleFromUserMessage(textContent);
      await saveChat({ id: chatId, title });
    }

    const serializeParts = (parts: unknown) => JSON.stringify(parts ?? []);
    const existingMessageSignatures = new Set(
      (messagesFromDb as Array<{ role: string; parts: unknown }>).map(
        (m) => `${m.role}:${serializeParts(m.parts)}`
      )
    );

    // Save incoming user message using DB UUID ids (SDK ids are not guaranteed UUIDs).
    if (
      latestUserMessage?.role === 'user' &&
      !existingMessageSignatures.has(`user:${serializeParts(latestUserMessage.parts)}`)
    ) {
      await saveMessages({
        messages: [
          {
            userId: session.user.id,
            chatId,
            content: "",
            id: uuid(),
            role: 'user',
            parts: latestUserMessage.parts,
            attachments: (latestUserMessage as any).attachments ?? [],
            createdAt: new Date(),
          },
        ],
      });
    }

    // Build the full UIMessage array: DB history + new message
    const uiMessages: UIMessage[] = [
      ...effectiveMessages,
    ];

    const modelMessages = await convertToModelMessages(uiMessages);

    const stream = createUIMessageStream({
      execute: async ({ writer: dataStream }) => {
        const result = streamText({
          model: gateway('moonshotai/kimi-k2.5'),
          system: chat_research_prompt,
          messages: modelMessages,
          stopWhen: stepCountIs(5),
          experimental_transform: smoothStream({ chunking: 'word' }),
          tools: {
            webSearchTool,
            createDocumentTool: createDocumentTool({ dataStream, chatId }),
          },
          experimental_telemetry: {
            isEnabled: isProductionEnvironment,
            functionId: 'stream-text',
          },
          onFinish: async ({ usage }) => {
            // Approximate spend for gateway model using per-1M token pricing.
            const promptTokens = usage?.inputTokens ?? 0;
            const completionTokens = usage?.outputTokens ?? 0;
            const inputCentsPerMillion = 30;
            const outputCentsPerMillion = 120;
            const estimatedCostCents =
              (promptTokens / 1_000_000) * inputCentsPerMillion +
              (completionTokens / 1_000_000) * outputCentsPerMillion;

            await incrementUserAiCreditUsage({
              userId: session.user.id,
              amountCents: Math.ceil(estimatedCostCents),
            });
          },
        });

        dataStream.merge(result.toUIMessageStream({ sendSources: true }));
      },
      onFinish: async ({ messages: finishedMessages }) => {
        // Save only truly new messages by role+parts signature, using DB UUID ids.
        const newMessages = finishedMessages.filter((m) => {
          const signature = `${m.role}:${serializeParts(m.parts)}`;
          return !existingMessageSignatures.has(signature);
        });

        if (newMessages.length > 0) {
          await saveMessages({
            messages: newMessages.map((m) => {
              const signature = `${m.role}:${serializeParts(m.parts)}`;
              existingMessageSignatures.add(signature);
              return {
                userId: session.user.id,
                chatId,
                id: uuid(),
                content: "",
                role: m.role,
                parts: m.parts,
                attachments: (m as any).attachments ?? [],
                createdAt: new Date(),
              };
            }),
          });
        }

        revalidatePath('/', 'layout');
      },
      onError: (error: any) => {
        console.error(error);
        return 'Oops! Something went wrong.';
      },
    });

    return createUIMessageStreamResponse({ stream });
  } catch (error) {
    console.error(error);
    return new Response('An error occurred while processing your request!', {
      status: 500,
    });
  }
}
