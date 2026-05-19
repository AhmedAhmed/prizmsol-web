"use client";
import PromptInput from "@/components/chat/prompt-input";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";
import { submitMessage } from "./actions";

export default function ChatPrompt({
    count,
    defaultPrompt,
}: {
    count: number;
    defaultPrompt: string;
}) {
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const { success, chatId } = await submitMessage(formData);
        if (success) {
            toast.success("Chat created successfully. Taking you there...");
            router.push(`/chat/${chatId}`);
        } else {
            toast.error("Failed to send message");
        }
    }

    return (
        <PromptInput
            showPills
            onSubmit={handleSubmit}
            messagesCount={count}
            defaultValue={defaultPrompt}
        />
    );
}
