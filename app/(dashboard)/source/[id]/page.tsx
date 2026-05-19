import PaneHeader from "@/components/PaneHeader";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/drizzle";
import { source as sourceTable } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";

export default async function SourceDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user?.id) {
        redirect("/login");
    }

    const [source] = await db
        .select()
        .from(sourceTable)
        .where(
            and(
                eq(sourceTable.id, id),
                eq(sourceTable.userId, session.user.id)
            )
        )
        .limit(1);

    if (!source) {
        notFound();
    }

    const metadata = source.metadata as Record<string, unknown> | null;
    const content =
        typeof metadata?.content === "string"
            ? metadata.content
            : "No content available.";

    return (
        <div className="flex flex-col flex-1">
            <PaneHeader>
                <div className="flex flex-1 items-center gap-2.5">
                    <Link
                        href="/sources"
                        className="text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
                    >
                        &larr; Back
                    </Link>
                    <span className="text-md font-bold">{source.name}</span>
                </div>
            </PaneHeader>
            <div className="flex flex-col flex-1">
                <pre className="flex flex-col border rounded-md m-5 p-5 text-sm whitespace-pre-wrap font-sans overflow-auto">
                    {content}
                </pre>
            </div>
        </div>
    );
}
