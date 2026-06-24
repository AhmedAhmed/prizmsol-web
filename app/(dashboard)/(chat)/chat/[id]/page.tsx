import NotFound from "@/app/not-found";
import { getChatById, getMessagesByChatId, getMessagesCountByUserId } from "@/lib/db/queries";
import { UIMessage } from "ai";
import Chat from "./chat";

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const chat = await getChatById({
        id
    });

    const count = await getMessagesCountByUserId();

    if (!chat) {
        return <NotFound />;
    }

    const messages = await getMessagesByChatId({
        id: chat.id,
    });

    return (
        <>
            <Chat
                messages={messages as UIMessage[]}
                project={chat}
                messagesCount={count}
            />
        </>
    );
}
