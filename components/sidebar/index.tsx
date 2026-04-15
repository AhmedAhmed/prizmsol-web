import { getChats } from "@/lib/db/queries";
import { getAccountSnapshotAction } from "@/app/actions/billing";
import { cookies, headers } from "next/headers";
import AppMenu from "./AppMenu";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Sidebar() {
    const expanded = (await cookies()).get("sidebar_state")?.value as string;
    const session = await auth.api.getSession({
        headers: await headers() // you need to pass the headers object.
    })
    if (!session?.user?.id) {
        return redirect("/login");
    }
    const chats = await getChats({
        page: 1,
        limit: 25,
        userId: session.user.id
    });
    const accountSnapshot = await getAccountSnapshotAction();

    return (
        <AppMenu
            isExpanded={parseInt(expanded)}
            chats={chats}
            user={{ sessionUser: session?.user, accountSnapshot }}
        />
    );
}
