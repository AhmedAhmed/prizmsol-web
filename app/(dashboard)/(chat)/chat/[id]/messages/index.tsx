import { ArtifactData } from "@/components/artifact";
import { UIMessage } from "ai";
import Message from "./message";

function PureMessages({
    artifactData,
    messages,
    status,
    isToolbarOpen = false,
    isLoading,
}: {
    artifactData: Array<ArtifactData>;
    messages: Array<UIMessage>;
    status: "streaming" | "ready" | "error" | "submitted";
    isToolbarOpen: boolean;
    isLoading: boolean;
}) {
    
    return (
        <>
            <div
                className="flex flex-col justify-start items-center mx-auto px-5 w-full h-full overflow-hidden overflow-y-auto" 
            >
                <div className="flex flex-col relative mx-auto gap-10 mt-5 w-full max-w-3xl h-full">
                    {messages.map((message, index) => (
                        <Message
                            key={message.id ?? index}
                            artifactData={artifactData}
                            message={message}
                            isLoading={isLoading}
                            status={status}
                        />
                    ))}
                    {status === "submitted" && messages.length > 0 && messages[messages.length - 1].role === "user" && <ThinkingMessages />}
                    <div className="flex flex-1 min-h-2.5" />
                </div>
            </div>
        </>
    );
}

export function ThinkingMessages() {
    return (
        <div className="flex gap-3 flex-col h-7 relative mt-1.5 overflow-hidden">
            <div className="absolute left-0 top-0 z-10 h-full w-full -translate-x-full bg-linear-to-r from-transparent via-neutral-50/80 dark:via-neutral-950 to-transparent animate-[shimmer_1.5s_infinite]"></div>
            <span className="text-sm text-neutral-500 dark:text-neutral-400 min-h-[calc(100vh-18px)]">Thinking...</span>
        </div>
    );
}

export default PureMessages;
