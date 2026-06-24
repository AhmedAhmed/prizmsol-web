import { ChatReasoning } from "@/components/chat/chat-reasoning";
import { Markdown } from "@/components/markdown";
import { cn } from "@/lib/utils";
import { UIMessage as Msg } from "ai";
import { GlobeIcon, Loader2Icon, LoaderIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Message({
    message,
    isLoading,
    status
}: {
    message: Msg;
    isLoading: boolean;
    status: "streaming" | "ready" | "error" | "submitted";
}) {
    const router = useRouter();

    useEffect(() => {
        if (status === "ready" && message.role === "assistant") {
            router.refresh();
        }
    }, [status]);

    const isToolPart = (part: any) =>
        part?.type === "tool-invocation" || (typeof part?.type === "string" && part.type.startsWith("tool-"));

    const getToolName = (part: any) => {
        if (part?.type === "tool-invocation") return part.toolInvocation?.toolName;
        if (typeof part?.type === "string" && part.type.startsWith("tool-")) return part.type.replace("tool-", "");
        return undefined;
    };

    const getToolState = (part: any) => {
        if (part?.type === "tool-invocation") return part.toolInvocation?.state;
        if (typeof part?.type === "string" && part.type.startsWith("tool-")) return part.state;
        return undefined;
    };

    const getToolArgs = (part: any) => {
        if (part?.type === "tool-invocation") return part.toolInvocation?.args;
        if (typeof part?.type === "string" && part.type.startsWith("tool-")) return part.input;
        return undefined;
    };

    const getToolResult = (part: any) => {
        if (part?.type === "tool-invocation") return part.toolInvocation?.result;
        if (typeof part?.type === "string" && part.type.startsWith("tool-")) return part.output;
        return undefined;
    };

    return (
        <div className={cn("flex flex-col", {
            "bg-neutral-200 dark:bg-neutral-800/80 p-3 rounded-lg shadow-xs self-end": message.role == "user",
            "w-full": message.role == "assistant",
        })}>
            <div className="flex gap-3 w-full">
                <div className="flex flex-col space-y-4 flex-wrap w-full">
                    {message.parts?.map((part, index) => {
                        const { type } = part;
                        if (type == "text") {
                            return (
                                <div key={index} className={"flex flex-col space-y-4"}>
                                    <Markdown>{part.text}</Markdown>
                                </div>
                            );
                        }

                        if (type == "reasoning") {
                            const isStreamingThought =
                                status === "streaming" &&
                                index === (message.parts?.length ?? 0) - 1;

                            return (
                                <div key={index} className={"flex flex-col space-y-4"}>
                                    <ChatReasoning
                                        reasoning={part.text}
                                        isStreaming={isStreamingThought}
                                    />
                                </div>
                            );
                        }

                        if (isToolPart(part)) {
                            const toolName = getToolName(part);
                            const args = getToolArgs(part);
                            const state = getToolState(part);

                            if (state == "call" || state == "input-available" || state == "input-streaming") {
                                if (toolName == "webSearchTool") {
                                    return (
                                        <div key={index} className="flex items-center gap-2.5">
                                            <div key={index} className="flex gap-2 w-fit relative items-center py-1.5 text-sm">
                                                <div className="absolute left-0 top-0 z-10 h-full w-full -translate-x-full bg-linear-to-r from-transparent via-neutral-50/80 dark:via-neutral-950 to-transparent animate-[shimmer_1.5s_infinite]"></div>
                                                <LoaderIcon className="h-4 w-4 text-neutral-500 animate-spin" />
                                                <span className="flex-1 tet-neutral-600 dark:text-neutral-400 text-sm line-clamp-1">Searching the web for "{args?.prompt}"</span>
                                            </div>
                                        </div>
                                    );
                                }

                                if (toolName == "imageTool") {
                                    return (
                                        <div key={index} className="flex items-center gap-2.5">
                                            <div className="flex items-center justify-center w-[25px] h-[25px]">
                                                <Loader2Icon className="w-4 h-4 animate-spin text-neutral-500" />
                                            </div>
                                            <div className="flex flex-col">
                                                <div className="flex flex-col h-7 relative mt-1 overflow-hidden">
                                                    <div className="absolute left-0 top-0 z-10 h-full w-full -translate-x-full bg-linear-to-r from-transparent via-neutral-50/80 dark:via-neutral-950 to-transparent animate-[shimmer_1.5s_infinite]"></div>
                                                    <span className="text-sm text-neutral-500 dark:text-neutral-400 min-h-[calc(100vh-18px)]">Generating Image...</span>
                                                </div>
                                                <div className="animate-pulse bg-neutral-200 dark:bg-neutral-800 w-[500px] h-[500px] rounded-lg p-2.5 mt-2"></div>
                                            </div>
                                        </div>
                                    );
                                }
                            }

                            if (state == "result" || state == "output-available") {
                                const result = getToolResult(part);

                                if (toolName == "imageTool") {
                                    return (
                                        <div key={index} className="flex flex-col relative w-[500px] h-[500px] rounded-lg overflow-hidden">
                                            <Image
                                                src={result.image}
                                                alt="Generated Image"
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    );
                                }

                                if (toolName === "webSearchTool") {
                                    return (
                                        <div key={index} className="flex gap-2 line-clamp-2 w-fit items-center py-1.5 text-sm">
                                            <GlobeIcon className="h-4 w-4 text-neutral-500" />
                                            <span className="flex-1 text-neutral-600 dark:text-neutral-400 text-sm line-clamp-1">Searched for "{result.query}"</span>
                                        </div>
                                    );
                                }
                            }
                        }
                    })}
                </div>
            </div>
        </div>
    );
}
