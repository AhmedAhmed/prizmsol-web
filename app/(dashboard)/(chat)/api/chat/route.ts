import { generateTitleFromUserMessage } from '@/app/(dashboard)/(chat)/actions';
import { buildChatResearchSystemPrompt } from '@/lib/ai/prompts';
import { createDocumentTool, webSearchTool } from '@/lib/ai/tools';
import { auth } from '@/lib/auth';
import { isProductionEnvironment } from '@/lib/constants';
import {
  getMessagesByChatId,
  getReadySourcesForUser,
  getTopKChunksByEmbedding,
  getUserAiCreditUsageTotal,
  incrementUserAiCreditUsage,
  saveChat,
  saveMessages,
} from '@/lib/db/queries';
import { embedQuery } from '@/lib/sources/embed-query';
import { getCreditLimitCents, getCurrentUsageWindow, reconcileUserPlanStatus } from '@/lib/stripe/billing';
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
import { headers } from 'next/headers';
import { v4 as uuid } from 'uuid';

export const maxDuration = 30;

// ---------------------------------------------------------------------------
// Helper — safely extracts text from a message part
// ---------------------------------------------------------------------------
const getPartText = (part: unknown): string | undefined => {
  if (!part || typeof part !== 'object') return undefined;
  const candidate = (part as { text?: unknown }).text;
  return typeof candidate === 'string' ? candidate : undefined;
};

export async function POST(req: Request) {
  try {
    // ------------------------------------------------------------------
    // 1. Auth
    // ------------------------------------------------------------------
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    // ------------------------------------------------------------------
    // 2. Billing guard
    // ------------------------------------------------------------------
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
    const currentLimitCents = getCreditLimitCents(
      (selectedUser.plan ?? 'free') as 'free' | 'pro' | 'max',
    );
    if (usedInWindowCents >= currentLimitCents) {
      return new Response('AI credit limit reached for your current plan', { status: 402 });
    }

    // ------------------------------------------------------------------
    // 3. Parse request body
    // ------------------------------------------------------------------
    const body = await req.json();
    const chatId = body.id ?? body.chatId;
    const incomingMessages = (body.messages ?? []).filter(Boolean) as UIMessage[];
    const message = body.message as UIMessage | undefined;

    // Backward compatibility — single message payload
    const effectiveMessages =
      incomingMessages.length > 0 ? incomingMessages : message ? [message] : [];

    if (!chatId || effectiveMessages.length === 0) {
      return new Response('Invalid chat payload', { status: 400 });
    }

    // ------------------------------------------------------------------
    // 4. Resolve latest user message + its plain text
    // ------------------------------------------------------------------
    const latestUserMessage = [...effectiveMessages].reverse().find((m) => m.role === 'user');

    const queryText =
      latestUserMessage?.parts?.map(getPartText).filter(Boolean).join(' ') ?? '';

    // ------------------------------------------------------------------
    // 5. DB history + first-message chat creation
    // ------------------------------------------------------------------
    const messagesFromDb = await getMessagesByChatId({ id: chatId });

    if (isEmpty(messagesFromDb) && latestUserMessage) {
      const title = await generateTitleFromUserMessage(queryText);
      await saveChat({ id: chatId, title, userId: session.user.id });
    }

    const serializeParts = (parts: unknown) => JSON.stringify(parts ?? []);
    const existingMessageSignatures = new Set(
      (messagesFromDb as Array<{ role: string; parts: unknown }>).map(
        (m) => `${m.role}:${serializeParts(m.parts)}`,
      ),
    );

    // Save incoming user message (deduplicated by role+parts signature)
    if (
      latestUserMessage?.role === 'user' &&
      !existingMessageSignatures.has(`user:${serializeParts(latestUserMessage.parts)}`)
    ) {
      await saveMessages({
        messages: [
          {
            userId: session.user.id,
            chatId,
            content: '',
            id: uuid(),
            role: 'user',
            parts: latestUserMessage.parts,
            attachments: (latestUserMessage as any).attachments ?? [],
            createdAt: new Date(),
          },
        ],
      });
    }

    // ------------------------------------------------------------------
    // 6. Convert messages for the model
    // ------------------------------------------------------------------
    const uiMessages: UIMessage[] = [...effectiveMessages];
    const modelMessages = await convertToModelMessages(uiMessages);

    // ------------------------------------------------------------------
    // 7. RAG — embed query → retrieve top-K chunks
    // ------------------------------------------------------------------
    const sourceRows = await getReadySourcesForUser({ userId: session.user.id });

    let retrievedChunks: { content: string; title: string }[] = [];

    if (sourceRows.length > 0 && queryText.trim().length > 0) {
      try {
        const queryEmbedding = await embedQuery(queryText);
        retrievedChunks = await getTopKChunksByEmbedding({
          userId: session.user.id,
          embedding: queryEmbedding,
          topK: 5,
        });
      } catch (e) {
        // Non-fatal — degrade gracefully to no retrieved context
        console.error('RAG embedding/retrieval failed, proceeding without chunks:', e);
      }
    }

    // ------------------------------------------------------------------
    // 8. Build system prompt (base + retrieved chunks + full sources)
    // ------------------------------------------------------------------
    const systemPrompt = buildChatResearchSystemPrompt(sourceRows, retrievedChunks);

    // ------------------------------------------------------------------
    // 9. Stream
    // ------------------------------------------------------------------
    const stream = createUIMessageStream({
      execute: async ({ writer: dataStream }) => {
        const result = streamText({
          model: gateway('moonshotai/kimi-k2.5'),
          system: systemPrompt,
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
                content: '',
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
    return new Response('An error occurred while processing your request!', { status: 500 });
  }
}