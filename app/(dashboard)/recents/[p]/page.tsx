import ChatItem from "@/components/chat-item";
import { getChats } from "@/lib/db/queries";
import { redirect } from "next/navigation";
import Paging from "../paging";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export default async function RecentsPage({
    params
}: {
    params: Promise<{ p: string }>
}) {
    const session = await auth.api.getSession({
        headers: await headers() // you need to pass the headers object.
    })
    if (!session?.user?.id) {
        return new Response('Unauthorized', { status: 401 });
    }
    const page = (await params).p as string;
    const p = parseInt(page) || 1;
    const {
        chats,
        pagination
    } = await getChats({
        page: p,
        limit: 10,
        userId: session.user.id
    });

    if (chats.length == 0 && p > 1) {
        redirect(`/recents/1`);
    }

    return (
        <>
            <ul className="flex flex-col w-full gap-2">
                {chats.map((chat: any, index: number) => <ChatItem key={index} chat={chat} />)}
            </ul>
            <Paging
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                slug="/recents"
            />
        </>
    );
}
