import { getChats } from "@/lib/db/queries";
import { getAccountSnapshotAction } from "@/app/actions/billing";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/(auth)/auth";
import { cookies } from "next/headers";
import AppMenu from "./AppMenu";

export default async function Sidebar() {
    const expanded = (await cookies()).get("sidebar_state")?.value as string;

    const chats = await getChats({
        page: 1,
        limit: 25,
    });
    const session = await getServerSession(authOptions);
    const accountSnapshot = await getAccountSnapshotAction();

    return (
        <AppMenu
            isExpanded={parseInt(expanded)}
            chats={chats}
            user={{ sessionUser: session?.user, accountSnapshot }}
        />
    );
}
