import { UIArtifact } from '@/components/artifact';
import { DataStreamDelta } from '@/components/data-stream-handler';
import { UseChatHelpers } from '@ai-sdk/react';
import { ComponentType, Dispatch, ReactNode, SetStateAction } from 'react';

export type ArtifactActionContext = {
    content: string;
    handleVersionChange: (type: 'next' | 'prev' | 'toggle' | 'latest') => void;
    currentVersionIndex: number;
    isCurrentVersion: boolean;
};

export type ArtifactToolbarContext = {
    sendMessage: UseChatHelpers<any>['sendMessage'];
};

export type ArtifactToolbarItem = {
    description: string;
    icon: ReactNode;
    onClick: (context: ArtifactToolbarContext) => void;
};

export type ArtifactActionItem = {
    icon: ReactNode;
    description: string;
    onClick: (context: ArtifactActionContext) => void;
    isDisabled?: (context: ArtifactActionContext) => boolean;
};

type ArtifactConfig<T extends string, M = any> = {
    kind: T;
    description: string;
    content: ComponentType<M>;
    onStreamPart: (args: {
        setArtifact: Dispatch<SetStateAction<UIArtifact>>;
        streamPart: DataStreamDelta;
    }) => void;
    actions?: ArtifactActionItem[];
    toolbar?: ArtifactToolbarItem[];
};

export class Artifact<T extends string, M = any> {
    readonly kind: T;
    readonly description: string;
    readonly content: ComponentType<M>;
    readonly onStreamPart: (args: {
        setArtifact: Dispatch<SetStateAction<UIArtifact>>;
        streamPart: DataStreamDelta;
    }) => void;
    readonly actions?: ArtifactActionItem[];
    readonly toolbar?: ArtifactToolbarItem[];

    constructor(config: ArtifactConfig<T, M>) {
        this.kind = config.kind;
        this.description = config.description;
        this.content = config.content;
        this.onStreamPart = config.onStreamPart;
        this.actions = config.actions;
        this.toolbar = config.toolbar;
    }
}
