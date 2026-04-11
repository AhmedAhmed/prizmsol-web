"use client";
import { MessageCircleDashedIcon } from "lucide-react";
import ChatItem from "./chat-item";

export default function ChatList({
    chats,
}: {
    chats: Array<any>;
}) {

    const renderChats = () => {
        if (chats && chats?.length == 0) {
            return (
                <div className="hidden lg:flex flex-col flex-1 h-full mt-5 justify-center items-center gap-3 mx-2">
                    <div className="flex flex-col justify-center items-center">
                        <MessageCircleDashedIcon className="h-8 w-8 text-neutral-500" />
                    </div>
                    <span className="text-sm font-medium text-neutral-500 line-clamp-1">Try starting a new chat</span>
                </div>
            );
        }

        return (
            <div className="flex flex-col flex-1 gap-3">
                <span className="hidden lg:flex text-sm text-neutral-500">All Tasks</span>
                <div className="flex flex-col items-center w-full max-w-3xl mx-auto">
                    <ul className="flex flex-col gap-2.5 w-full">
                        {chats.map((item, index: number) => (
                            <li className='flex flex-1 w-full' key={index}>
                                <ChatItem item={item} key={index} />
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-1 flex-col gap-1">
            {renderChats()}
        </div>
    );
}
