"use client";
import { codeArtifact } from '@/artifact/code/client';
import { textArtifact } from '@/artifact/text/client';
import { sheetArtifact } from '@/artifact/sheet/client';
import { useArtifact } from '@/hooks/use-artifact';
import { Artifact as ArtifactType } from '@/lib/ai/artifacts/creact-artifact';
import { memo } from 'react';
import { ResizablePanel } from '../ui/resizable';

export const artifactDefinitions = [
    textArtifact,
    codeArtifact,
    sheetArtifact,
];

export type ArtifactKind = 'text' | 'image' | 'code' | 'sheet';

export interface UIArtifact {
    title: string;
    documentId: string;
    kind: ArtifactKind;
    content: string;
    images: Array<Object>;
    imageLoading: boolean;
    isVisible: boolean;
    status: 'streaming' | 'idle';
}

export interface ArtifactData {
    id: string;
    chatId: string;
    content: string;
    title: string;
    type: ArtifactKind;
    images: Array<Object>;
    media: string;
    credit_cost: number;
    createdAt: string;
}

function PureArtifact({ artifactData, status, isLoading }: {
    artifactData: Array<ArtifactData>;
    status: "submitted" | "streaming" | "ready" | "error";
    isLoading?: boolean;
}) {
    const { artifact, setArtifact } = useArtifact();

    if (isLoading) return null;

    const artifactDefinition = artifactDefinitions.find(
        (definition) => definition.kind === (artifact.kind || "text"),
    ) as ArtifactType<"text", any>;

    if (!artifactDefinition) {
        throw new Error(`No artifact definition found for kind: ${artifact.kind}`);
    }

    return artifact.isVisible && (
        <ResizablePanel
            defaultSize={70}
            maxSize={70}
            id="artifact"
            order={2}
            className='flex flex-col h-[calc(100vh-23px)] w-full border-l border-[0.5] border-neutral-200 dark:border-neutral-800'
        >
            <artifactDefinition.content
                status={status}
                artifactData={artifactData}
                artifact={artifact}
                setArtifact={setArtifact}
                content={artifact.content}
            />
        </ResizablePanel>
    );
}

const Artifact = memo(PureArtifact, (prevProps, nextProps) => {
    if (prevProps.artifactData.length !== nextProps.artifactData.length) {
        return false; // Re-render if the number of artifacts has changed
    }
    if (prevProps.status !== nextProps.status) {
        return false; // Re-render if the status has changed
    }
    return true;
});

export default Artifact;
