'use client';

import { useArtifact } from '@/hooks/use-artifact';
import { initialArtifactState } from '@/providers/artifact-provider';
import { useChat } from '@ai-sdk/react';
import { useEffect, useRef } from 'react';
import { artifactDefinitions, ArtifactKind } from './artifact';

export type DataStreamDelta = {
    type:
    | 'text-delta'
    | 'sheet-delta'
    | 'image-delta'
    | 'images'
    | 'images-loading'
    | 'title'
    | 'id'
    | 'suggestion'
    | 'clear'
    | 'finish'
    | 'kind';
    content: string;
};

export function DataStreamHandler({ id }: { id: string }) {
    useChat({
        id,
        onData: (delta: any) => {
            const dataStream = [delta];
            dataStream.forEach((streamDelta: any) => {
                const typedDelta: DataStreamDelta = {
                    type: String(streamDelta?.type ?? '').replace(/^data-/, '') as DataStreamDelta['type'],
                    content: streamDelta?.data ?? streamDelta?.content ?? '',
                };

                const artifactDefinition = artifactDefinitions.find(
                    (artifactDefinition) => artifactDefinition.kind === artifact.kind,
                );

                if (artifactDefinition?.onStreamPart) {
                    artifactDefinition.onStreamPart({
                        streamPart: typedDelta,
                        setArtifact,
                    });
                }

                setArtifact((draftArtifact: any) => {
                    if (!draftArtifact) {
                        return { ...initialArtifactState, imageLoading: true, status: 'streaming' };
                    }

                    switch (typedDelta.type) {
                        case 'id':
                            return {
                                ...draftArtifact,
                                documentId: typedDelta.content as string,
                                status: 'streaming',
                            };

                        case 'title':
                            return {
                                ...draftArtifact,
                                title: typedDelta.content as string,
                                status: 'streaming',
                            };

                        case 'images-loading':
                            return {
                                ...draftArtifact,
                                imageLoading: true,
                                images: [],
                                status: 'streaming',
                            };

                        case 'images':
                            return {
                                ...draftArtifact,
                                images: typedDelta.content || draftArtifact.images || [],
                                imageLoading: false,
                                status: 'streaming',
                            };

                        case 'kind':
                            return {
                                ...draftArtifact,
                                kind: typedDelta.content as ArtifactKind,
                                status: 'streaming',
                            };

                        case 'clear':
                            return {
                                ...draftArtifact,
                                content: '',
                                status: 'streaming',
                            };

                        case 'finish':
                            return {
                                ...draftArtifact,
                                status: 'idle',
                            };

                        default:
                            return draftArtifact;
                    }
                });
            });
        },
    });
    const { artifact, setArtifact } = useArtifact();
    const lastProcessedIndex = useRef(-1);
    useEffect(() => {
        lastProcessedIndex.current = -1;
    }, [id]);

    return null;
}
