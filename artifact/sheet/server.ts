import { gateway, streamText } from "ai";
import { sheetPrompt } from "@/lib/ai/prompts";
import { createDocumentHandler } from "@/lib/ai/artifacts/server";
import { ArtifactKind } from "@/components/artifact";

export const sheetDocumentHandler = createDocumentHandler<ArtifactKind>({
  kind: "sheet",
  onCreateDocument: async ({prompt, dataStream}) => {
    let draftContent = "";

    const { fullStream } = streamText({
      model: gateway("moonshotai/kimi-k2.5"),
      system: `${sheetPrompt}\n\nOutput ONLY the raw CSV data. No explanations, no markdown fences.`,
      prompt: prompt,
    });

    for await (const delta of fullStream) {
      if (delta.type === "text-delta") {
        draftContent += delta.text;
        dataStream.write({
          type: "data-sheetDelta",
          data: draftContent,
          transient: true,
        });
      }
    }

    return draftContent;
  },
});
