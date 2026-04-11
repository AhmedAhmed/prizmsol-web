import { ArtifactData, UIArtifact } from "@/components/artifact";
import { VersionSelect } from "@/components/artifact/version-select";
import { Markdown } from "@/components/markdown";
import { Button } from "@/components/ui/button";
import { Artifact } from "@/lib/ai/artifacts/creact-artifact";
import { ChevronsRightIcon, Loader2Icon } from "lucide-react";

export const codeArtifact = new Artifact({
    kind: 'code',
    description: 'Useful for code content, like drafting code snippets and explanations.',
    onStreamPart: ({ streamPart, setArtifact }) => {
        if (streamPart.type === 'text-delta') {
            setArtifact((draftArtifact: UIArtifact) => {
                return {
                    ...draftArtifact,
                    content: draftArtifact.content + (streamPart.content as string),
                    isVisible: true,
                    status: 'streaming',
                };
            });
        }
    },
    content: ({
        artifact,
        artifactData,
        content,
        setArtifact,
    }: {
        artifact: UIArtifact;
        content: string;
        artifactData: Array<any>;
        setArtifact: (artifact: UIArtifact) => void;
        status: 'streaming' | 'idle' | 'ready' | 'error';
    }) => {

        const handleCloseArtifact = () => {
            setArtifact({
                ...artifact,
                isVisible: false,
            });
        }

        const handleSelect = ({ id, content, type: kind, title, images }: ArtifactData) => {
            setArtifact({
                ...artifact,
                documentId: id,
                content,
                kind,
                images,
                title
            });
        }


        return (
            <div className="flex flex-col flex-1 overflow-hidden overflow-y-auto bg-neutral-100 dark:bg-neutral-900">
                <div className="flex sticky top-0 z-20 gap-2 w-full items-center justify-between p-1.5 bg-neutral-50/80 backdrop-blur-md dark:bg-neutral-900/80 border-b-[0.5px] border-neutral-200 dark:border-neutral-800">
                    <div className='flex items-center gap-2'>
                        {artifact.isVisible && (
                            <Button variant="ghost" className="p-1.5 h-auto w-auto" size="icon" onClick={handleCloseArtifact}>
                                <ChevronsRightIcon size={25} />
                            </Button>
                        )}
                        <h3 className="inline-flex text-sm font-semibold">
                            {artifact.title || "unknown title"}
                        </h3>
                    </div>
                    <div className="flex items-center gap-1">
                        {status === 'streaming' && (
                            <div className="flex items-center gap-1">
                                <Loader2Icon className="animate-spin text-neutral-500 dark:text-neutral-400" size={20} />
                                <span className="text-xs text-neutral-500 dark:text-neutral-400">Loading...</span>
                            </div>
                        )}
                        {artifactData && artifactData.length > 1 && <VersionSelect artifacts={artifactData} onSelect={handleSelect} />}
                    </div>
                </div>
                <div className="flex flex-col flex-1">
                    <div className="flex flex-col flex-1 bg-neutral-100 dark:bg-neutral-900">
                        <Markdown>{content}</Markdown>
                    </div>
                </div>
            </div>
        );
    },
})
