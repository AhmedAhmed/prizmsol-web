import { createDocumentHandler } from '@/lib/ai/artifacts/server';
import { document_prompt } from '@/lib/ai/prompts';
import { gateway } from '@ai-sdk/gateway';
import { smoothStream, streamText } from 'ai';

export const textDocumentHandler = createDocumentHandler<'text'>({
    kind: 'text',
    onCreateDocument: async ({ prompt, dataStream }) => {
        let draftContent = '';
        // stream data to artifact.
        const result = streamText({
            model: gateway("google/gemini-2.0-flash"),
            system: document_prompt,
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
})
