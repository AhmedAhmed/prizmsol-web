"use client";
import PromptInput from "@/components/chat/prompt-input";
import { useSidebar } from "@/hooks/use-sidebar";
import { cn } from "@/lib/utils";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, UIMessage } from "ai";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import Messages from "./messages";
import SidebarTitle from "./sidebar-title";

export default function Chat({
    messages: msgs,
    project,
    messagesCount
}: {
    messages: Array<UIMessage>;
    project: any;
    messagesCount: number;
}) {
    const router = useRouter();
    const [model, setModel] = useState("gemini");
    const [input, setInput] = useState("");
    const { isExpanded } = useSidebar();
    const didAutoRegenerateRef = useRef(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const isAtBottomRef = useRef(true);

    const {
        messages,
        sendMessage,
        regenerate,
        status,
    } = useChat({
        id: project.id,
        messages: msgs,
        experimental_throttle: 150,
        transport: new DefaultChatTransport({
            api: '/api/chat',
            prepareSendMessagesRequest: ({ id, messages }) => {
                return {
                    body: {
                        id,
                        messages,
                    },
                };
            },
        }),
    });

    useEffect(() => {
        if (didAutoRegenerateRef.current) return;
        if (status !== "ready") return;
        if (msgs.length === 0) return;

        const lastInitialMessage = msgs[msgs.length - 1];
        const hasAssistantResponse = msgs.some((message) => message.role === "assistant");

        if (lastInitialMessage?.role === "user" && !hasAssistantResponse) {
            didAutoRegenerateRef.current = true;
            regenerate();
        }
    }, [status, msgs, regenerate]);

    const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
        if (!chatContainerRef.current) return;
        chatContainerRef.current.scrollTo({
            top: chatContainerRef.current.scrollHeight,
            behavior,
        });
    }, []);

    const handleScroll = useCallback(() => {
        if (!chatContainerRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
        isAtBottomRef.current = scrollHeight - scrollTop - clientHeight < 80;
    }, []);

    // Jump to bottom instantly on first load
    useEffect(() => {
        scrollToBottom("instant");
    }, []);

    // Scroll to bottom on new messages if user is at bottom
    useEffect(() => {
        if (isAtBottomRef.current) {
            scrollToBottom("smooth");
        }
    }, [messages]);

    // During streaming, use MutationObserver to keep scrolling as content grows
    useEffect(() => {
        if (status !== "streaming") return;
        const el = chatContainerRef.current;
        if (!el) return;

        const observer = new MutationObserver(() => {
            if (isAtBottomRef.current) {
                scrollToBottom("instant");
            }
        });

        observer.observe(el, { childList: true, subtree: true, characterData: true });
        return () => observer.disconnect();
    }, [status, scrollToBottom]);

    const handleModelChange = (value: string) => {
        setModel(value);
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const message = input.trim();
        if (!message) return;

        sendMessage({ text: message });
        setInput("");
    };

    return (
        <div className={cn("flex flex-col flex-1 w-full max-w-[calc(100vw-70px)] h-[calc(100vh-25px)] lg:max-w-[calc(100vw-265px)] overflow-hidden", {
            "max-w-[calc(100vw-60px)] lg:max-w-[calc(100vw-265px)]": isExpanded,
            "max-w-[calc(100vw-60px)] lg:max-w-[calc(100vw-60px)]": !isExpanded,
        })}>
            <div className="flex flex-col h-full w-full relative">
                <div className="flex flex-col h-full w-full relative">
                    <div className="flex-none bg-background z-10">
                        <SidebarTitle
                            project={project}
                            numberOfMessages={messages.length}
                        />
                    </div>
                    {/* Messages area - Scrollable and takes up remaining space */}
                    <div
                        ref={chatContainerRef}
                        onScroll={handleScroll}
                        className="flex-1 overflow-y-auto min-h-0"
                    >
                        <div className="flex flex-col mx-auto w-full max-w-3xl py-4">
                            <Messages
                                messages={messages}
                                status={status}
                                isLoading={false}
                            />
                        </div>
                    </div>

                    {/* Prompt area - Anchored to bottom, expands upwards */}
                    <div className="flex-none p-4 bg-background">
                        <div className="flex flex-col mx-auto w-full max-w-3xl">
                            <PromptInput
                                showPills={false}
                                placeholder="Ask a follow up..."
                                className="max-h-[500px] w-full"
                                input={input}
                                handleInputChange={setInput}
                                onSubmit={handleSubmit}
                                onModelChange={handleModelChange}
                                clearOnSubmit={true}
                                projectId={project.id}
                                messagesCount={messagesCount}
                            />
                            <span className="text-xs text-neutral-500 text-center mt-2">
                                Prizmsol can make mistakes. Please double check responses.
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
