"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TextIcon, FileIcon, FileTextIcon, GlobeIcon, BrainIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Source } from "@/lib/db/schema";
import { toast } from "sonner";
import { trainSourcesAction } from "../actions";
import DeleteSourceDialog from "../forms/delete-source-dialog";
import PaneHeader from "@/components/PaneHeader";
import { useRouter } from "next/navigation";

export default function SourceSidebar({
    sources: initialSources,
}: {
    sources: Source[];
}) {
    const [sources, setSources] = useState<Source[]>(initialSources);
    const [isTraining, setIsTraining] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setSources(initialSources);
    }, [initialSources]);

    const handleTrain = async () => {
        setIsTraining(true);
        const formData = new FormData();
        const response = await trainSourcesAction(formData);
        setIsTraining(false);

        if (response.status === 200) {
            toast.success("Sources trained successfully");
            setSources(sources.map(s => s.status === "ready" ? s : { ...s, status: "processing" as const }));
            router.refresh();
        } else {
            toast.error(response.error ?? "Training failed");
        }
    };

    const readyCount = sources.filter(s => s.status === "ready").length;
    const totalCount = sources.length;
    const isTrained = totalCount > 0 && sources.every(s => s.status === "ready");

    const handleDeleteSuccess = (id: string) => {
        setSources(prev => prev.filter(s => s.id !== id));
    };

    return (
        <div className="flex flex-col h-full w-[300px] border-l border-neutral-200 dark:border-neutral-800">
            <PaneHeader>
                <div className="flex justify-between w-full">
                    <h3 className="text-sm font-semibold">Sources</h3>
                    <Badge variant={isTrained ? "default" : "secondary"} className="text-xs">
                        {readyCount}/{totalCount}
                    </Badge>
                </div>
            </PaneHeader>

            <div className="p-3 border-b-[0.5px] border-neutral-200 dark:border-neutral-800">
                <Button
                    onClick={handleTrain}
                    disabled={isTraining || sources.length === 0}
                    className="w-full cursor-pointer"
                    size="sm"
                >
                    <BrainIcon className="w-4 h-4 mr-2" />
                    {isTraining ? "Training…" : "Train Sources"}
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {sources.length === 0 && (
                    <div className="text-center py-8">
                        <FileTextIcon className="w-8 h-8 mx-auto text-neutral-300 mb-2" />
                        <p className="text-sm text-neutral-400">No sources yet</p>
                    </div>
                )}
                {sources.map((src) => {
                    const icon = src.type === "text" ? <TextIcon className="w-4 h-4" /> :
                        src.type === "file" ? <FileIcon className="w-4 h-4" /> :
                            <GlobeIcon className="w-4 h-4" />;
                    return (
                        <div
                            key={src.id}
                            className="group flex items-center gap-2 p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800/50 transition-colors"
                        >
                            <div className="flex items-center justify-center w-6 h-6 rounded bg-neutral-200 dark:bg-neutral-700 shrink-0">
                                {icon}
                            </div>
                            <Link href={`/source/${src.id}`} className="flex-1 min-w-0">
                                <p className="text-sm truncate">{src.name}</p>
                                <p className="text-xs text-neutral-400">
                                    {src.status === "ready" ? (
                                        <span className="text-green-600">Ready</span>
                                    ) : src.status === "failed" ? (
                                        <span className="text-red-500">Failed</span>
                                    ) : (
                                        <span className="text-yellow-600">Pending</span>
                                    )}
                                </p>
                            </Link>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <DeleteSourceDialog
                                    id={src.id}
                                    action={async (formData) => {
                                        const actions = await import("../actions");
                                        const result = await actions.deleteSourceAction(formData);
                                        if (result.status === 200) {
                                            handleDeleteSuccess(src.id);
                                        }
                                        return result;
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Stats */}
            <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500 space-y-1">
                <div className="flex justify-between">
                    <span>Total Sources:</span>
                    <span>{totalCount}</span>
                </div>
                <div className="flex justify-between">
                    <span>Ready:</span>
                    <span className="text-green-600">{readyCount}</span>
                </div>
                <div className="flex justify-between">
                    <span>Pending:</span>
                    <span className="text-yellow-600">{sources.filter(s => s.status === "pending" || s.status === "processing").length}</span>
                </div>
            </div>
        </div>
    );
}
