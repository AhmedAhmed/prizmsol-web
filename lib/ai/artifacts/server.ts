import { codeDocumentHandler } from "@/artifact/code/server";
import { textDocumentHandler } from "@/artifact/text/server";
import { sheetDocumentHandler } from "@/artifact/sheet/server";
import { ArtifactKind } from "@/components/artifact";
import { saveDocument } from "@/lib/db/queries";
import { UIMessageStreamWriter } from "ai";

export interface SaveDocumentProps {
    id: string;
    title: string;
    kind: ArtifactKind;
    content: string;
    userId: string;
}

export interface CreateDocumentCallbackProps {
    id: string;
    chatId: string;
    prompt: string;
    title: string;
    dataStream: UIMessageStreamWriter;
    session: any;
}

export interface DocumentHandler<T = ArtifactKind> {
    kind: T;
    onCreateDocument: (args: CreateDocumentCallbackProps) => Promise<void>;
}

export function createDocumentHandler<T extends ArtifactKind>(config: {
    kind: T;
    onCreateDocument: (params: CreateDocumentCallbackProps) => Promise<string>;
}): DocumentHandler<T> {
    return {
        kind: config.kind,
        onCreateDocument: async (args: CreateDocumentCallbackProps) => {
            const draftContent = await config.onCreateDocument({
                id: args.id,
                chatId: args.chatId,
                prompt: args.prompt,
                title: args.title,
                dataStream: args.dataStream,
                session: "0",
            });

            await saveDocument({
                id: args.id,
                chatId: args.chatId,
                content: draftContent,
                title: args.title,
                type: config.kind,
                media: "",
            });

            return;
        }
    }
}

/*
 * Use this array to define the document handlers for each artifact kind.
 */
export const documentHandlersByArtifactKind: Array<DocumentHandler> = [
    textDocumentHandler,
    codeDocumentHandler,
    sheetDocumentHandler
];

export const artifactKinds = ['text', 'code', 'sheet'] as const;