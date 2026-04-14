import PaneHeader from "@/components/PaneHeader";

export default function SourcesPage() {
    return (
        <div className="flex flex-col">
            <PaneHeader>
                <h1 className="text-sm font-bold">Sources</h1>
            </PaneHeader>
            <div className="flex flex-col flex-1">
                <span>Lising sources...</span>
            </div>
        </div>
    );
}
