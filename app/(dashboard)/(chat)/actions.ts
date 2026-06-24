'use server';

import { title_prompt } from "@/lib/ai/prompts";
import { auth } from "@/lib/auth";
import { saveChat, saveMessages } from "@/lib/db/queries";
import { gateway } from "@ai-sdk/gateway";

import { generateText } from "ai";

import { headers } from "next/headers";
import { v4 as uuid } from "uuid";

export async function generateTitleFromUserMessage(message: string) {
    const { text: title } = await generateText({
        model: gateway("moonshotai/kimi-k2.5"),
        system: title_prompt,
        prompt: message,
    });

    return title;
}

export async function submitMessage(formData: FormData) {
    const session = await auth.api.getSession({
        headers: await headers() // you need to pass the headers object.
    })
    if (!session?.user?.id) {
        return { error: "Unauthorized" };
    }

    const content = formData.get("prompt") as string;
    const id = uuid();
    const mid = uuid();

    const title = await generateTitleFromUserMessage(content);

    const chat = await saveChat({
        id,
        title: title,
        userId: session.user.id
    });

    if (chat.count == 0) {
        return {
            error: "Chat not created",
        };
    }

    const message = await saveMessages({
        messages: [
            {
                userId: session.user.id,
                chatId: id,
                id: mid,
                content,
                role: "user",
                parts: [{
                    type: "text",
                    text: content,
                }],
                attachments: [],
                createdAt: new Date(),
            },
        ],
    });

    if (message.count == 0) {
        return {
            error: "Message not created",
        };
    }

    return {
        success: true,
        message: "Message created successfully",
        data: {
            id: mid,
            content,
            role: "user",
            parts: [{
                type: "text",
                text: content,
            }],
            attachments: [],
            createdAt: new Date(),
        },
        chatId: id,
    };
}
