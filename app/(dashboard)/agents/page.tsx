import PaneHeader from "@/components/PaneHeader";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { getAgents } from "@/lib/db/queries";
import { Plus } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import AgentItem from "./agent-item";

export default async function AgentsPage() {
    const session = await auth.api.getSession({
        headers: await headers() // you need to pass the headers object.
    })
    if (!session?.user?.id) {
        return redirect("/login");
    }
    const agents = await getAgents({ userId: session.user.id });

    return (
        <div className="flex flex-col flex-1">
            <PaneHeader>
                <div className="flex items-center justify-between w-full">
                    <h1 className="text-sm font-bold">Agents</h1>
                    <Link href="/agents/new">
                        <Button size="sm" variant="outline">
                            <Plus className="w-4 h-4 mr-1" />
                            Create Agent
                        </Button>
                    </Link>
                </div>
            </PaneHeader>
            <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-5 px-5 w-full">
                {agents.map((agent) => (
                    <AgentItem
                        key={agent.id}
                        title={agent.name || agent.displayName || "Untitled Agent"}
                        description={agent.description || ""}
                        href={`/agents/${agent.id}`}
                        trained={false}
                    />
                ))}
                {agents.length === 0 && (
                    <div className="col-span-full text-center text-sm text-neutral-500 py-10">
                        No agents yet. Create your first agent to get started.
                    </div>
                )}
            </div>
        </div>
    );
}
