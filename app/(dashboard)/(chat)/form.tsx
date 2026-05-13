"use client";
import PromptInput from "@/components/chat/prompt-input";
import { useRouter } from "next/navigation";
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

    const handleSubmit = async (formData: FormData) => {
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
            action={handleSubmit}
            messagesCount={count}
            defaultValue={defaultPrompt}
        />
    );
}
