import { ArtifactData, ArtifactKind, UIArtifact } from "@/components/artifact";
import type { DataStreamDelta } from "@/components/data-stream-handler";
import {
  Artifact,
  type ArtifactActionContext,
  type ArtifactToolbarContext,
} from "@/lib/ai/artifacts/creact-artifact";
import {
  ChevronsRightIcon,
  CopyIcon,
  LineChartIcon,
  RedoIcon,
  SparklesIcon,
  UndoIcon,
} from "lucide-react";
import { SpreadsheetEditor } from "@/components/chat/sheet-editor";
import { parse, unparse } from "papaparse";
import type { Dispatch, SetStateAction } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { VersionSelect } from "@/components/artifact/version-select";

export const sheetArtifact = new Artifact<ArtifactKind>({
  kind: "sheet",
  description: "Useful for working with spreadsheets",
  onStreamPart: ({
    setArtifact,
    streamPart,
  }: {
    setArtifact: Dispatch<SetStateAction<UIArtifact>>;
    streamPart: DataStreamDelta;
  }) => {
    if (streamPart.type === "sheet-delta") {
      setArtifact((draftArtifact: UIArtifact) => {
        return {
          ...draftArtifact,
          content: draftArtifact.content + (streamPart.content as string),
          isVisible: true,
          status: "streaming",
        };
      });
    }
  },
  content: ({
    artifact,
    artifactData,
    content,
    currentVersionIndex,
    onSaveContent,
    setArtifact,
}: {
    artifact: UIArtifact;
    content: string;
    currentVersionIndex: number;
    onSaveContent: (content: string, isCurrentVersion: boolean) => void;
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
      <div className="flex flex-col h-full">
        <div className='flex sticky top-0 z-20 items-center justify-between gap-2 p-1.5 bg-neutral-50/80 backdrop-blur-md dark:bg-neutral-900/80 border-b-[0.5px] border-neutral-200 dark:border-neutral-800'>
          <div className="flex items-center gap-2">
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
                {artifactData && artifactData.length > 1 && <VersionSelect artifacts={artifactData} onSelect={handleSelect} />}
            </div>
        </div>
        <SpreadsheetEditor
          content={content}
          currentVersionIndex={currentVersionIndex}
          isCurrentVersion={true}
          saveContent={onSaveContent}
          status={status}
        />
      </div>
    );
  },
  actions: [
    {
      icon: <UndoIcon size={18} />,
      description: "View Previous version",
      onClick: ({ handleVersionChange }: ArtifactActionContext) => {
        handleVersionChange("prev");
      },
      isDisabled: ({ currentVersionIndex }: ArtifactActionContext) => {
        if (currentVersionIndex === 0) {
          return true;
        }

        return false;
      },
    },
    {
      icon: <RedoIcon size={18} />,
      description: "View Next version",
      onClick: ({ handleVersionChange }: ArtifactActionContext) => {
        handleVersionChange("next");
      },
      isDisabled: ({ isCurrentVersion }: ArtifactActionContext) => {
        if (isCurrentVersion) {
          return true;
        }

        return false;
      },
    },
    {
      icon: <CopyIcon />,
      description: "Copy as .csv",
      onClick: ({ content }: ArtifactActionContext) => {
        const parsed = parse<string[]>(content, { skipEmptyLines: true });

        const nonEmptyRows = parsed.data.filter((row) =>
          row.some((cell) => cell.trim() !== "")
        );

        const cleanedCsv = unparse(nonEmptyRows);

        navigator.clipboard.writeText(cleanedCsv);
        toast.success("Copied csv to clipboard!");
      },
    },
  ],
  toolbar: [
    {
      description: "Format and clean data",
      icon: <SparklesIcon />,
      onClick: ({ sendMessage }: ArtifactToolbarContext) => {
        sendMessage({
          text: "Can you please format and clean the data?",
        });
      },
    },
    {
      description: "Analyze and visualize data",
      icon: <LineChartIcon />,
      onClick: ({ sendMessage }: ArtifactToolbarContext) => {
        sendMessage({
          text: "Can you please analyze and visualize the data by creating a new code artifact in python?",
        });
      },
    },
  ],
});
