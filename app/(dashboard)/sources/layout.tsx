import { auth } from "@/lib/auth";
import { getSourcesForUser } from "@/lib/db/queries";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import SourcesLayout from "./components/sources-layout";

export default async function SourcesLayoutPage({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user?.id) {
        redirect("/login");
    }

    const sources = await getSourcesForUser({ userId: session.user.id });
    console.log("Refreshing sources...");
    return (
        <SourcesLayout
            sources={sources}
        >
            {children}
        </SourcesLayout>
    );
}
