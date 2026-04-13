import { ArtifactKind } from '@/components/artifact';
import { createDocumentHandler } from '@/lib/ai/artifacts/server';
import { code_prompt } from '@/lib/ai/prompts';
import { gateway } from '@ai-sdk/gateway';
import { smoothStream, streamText } from 'ai';

export const codeDocumentHandler = createDocumentHandler<ArtifactKind>({
    kind: 'code',
    onCreateDocument: async ({ prompt, dataStream }) => {
        let draftContent = '';
        // stream data to artifact.
        const result = streamText({
            model: gateway("moonshotai/kimi-k2.5"),
            system: code_prompt,
            prompt: prompt,
            experimental_transform: smoothStream({ chunking: 'word' }),
        });

        const { fullStream } = result;

        for await (const delta of fullStream) {
            const { type } = delta;

            if (type === 'text-delta') {
                const textDelta = delta.text;

                draftContent += textDelta;

                dataStream.write({
                    type: 'data-text-delta',
                    data: textDelta,
                });
            }
        }

        return draftContent;
    }
});
