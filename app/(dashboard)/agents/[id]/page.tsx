import PaneHeader from "@/components/PaneHeader";
import { getAgentById } from "@/lib/db/queries";

export default async function AgentPage({ params }: {
    params: Promise<{
        id: string;
    }>;
}) {
    const { id } = await params;
    const agent = await getAgentById({ id });
    return (
        <div className="flex flex-col flex-1">
            <PaneHeader>
                <h1 className="text-sm font-bold">{agent?.name || agent?.displayName || "Untitled Agent"}</h1>
            </PaneHeader>
            <div className="flex flex-1 justify-center items-center">
                <h1 className="text-2xl font-bold">Agent Page for {agent?.name || agent?.displayName || "Untitled Agent"}</h1>
            </div>
        </div>
    );
}