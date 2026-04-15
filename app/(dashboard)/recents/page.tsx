import ChatItem from "@/components/chat-item";
import { Button } from "@/components/ui/button";
import { getChats } from "@/lib/db/queries";
import { isEmpty } from "lodash";
import { MessageCircleDashedIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import Paging from "./paging";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function RecentsPage() {
    const session = await auth.api.getSession({
        headers: await headers() // you need to pass the headers object.
    })
    if (!session?.user?.id) {
        return redirect("/login");
    }
    const {
        chats,
        pagination
    } = await getChats({
        page: 1,
        limit: 10,
        userId: session.user.id
    });

    if (isEmpty(chats)) {
        return (
            <div className="flex flex-col flex-1 gap-5 justify-center items-center">
                <MessageCircleDashedIcon size={75} className="text-neutral-500" />
                <h1 className="text-2xl font-bold text-neutral-500">Looks like you haven't chatted yet</h1>
                <Link href="/">
                    <Button>
                        <PlusIcon size={20} />
                        <span>Start a New Chat</span>
                    </Button>
                </Link>
            </div>
        );
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
