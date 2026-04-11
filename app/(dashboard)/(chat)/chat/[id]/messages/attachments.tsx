import { UIMessage } from "ai";
import FileAttachment from "./file-attachment";

export default function FileAttachments({
    toolInvocations
}: {
    toolInvocations: UIMessage["parts"];
}) {
    const getToolArgs = (part: any) => {
        if (part?.type === "tool-invocation") return part.toolInvocation?.args ?? {};
        if (typeof part?.type === "string" && part.type.startsWith("tool-")) return part.input ?? {};
        return {};
    };

    const getToolState = (part: any) => {
        if (part?.type === "tool-invocation") return part.toolInvocation?.state;
        if (typeof part?.type === "string" && part.type.startsWith("tool-")) return part.state;
        return undefined;
    };

    const renderList = () => {
        return toolInvocations.map((toolInvocation) => {
            const args = getToolArgs(toolInvocation as any);
            const state = getToolState(toolInvocation as any);
            if (args?.files?.length) {
                return args.files.map((file: any, index: number) => {
                    return (
                        <FileAttachment
                            key={index}
                            title={file.path}
                            isGenerating={state !== "result" && state !== "output-available"}
                        />
                    );
                });
            }
        });
    }
    return toolInvocations.length > 0 && (
        <div className="flex flex-col gap-2.5 mt-5">
            <span className="text-sm font-semibold">Generated Files:</span>
            <div className="flex flex-wrap gap-2.5 justify-start items-start">
                {renderList()}
            </div>
        </div>
    );
}