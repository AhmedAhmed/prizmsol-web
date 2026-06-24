import { gateway } from "@ai-sdk/gateway";
import { tool as createTool, generateText } from "ai";
import { z } from "zod";
import { websearch_prompt } from "./prompts";

export const imageTool = createTool({
    description: "Create an image based on the prompt",
    inputSchema: z.object({
        prompt: z.string().describe("The prompt to use for generating an image"),
    }),
    execute: async (params: { prompt: string }) => {
        const url = process.env.NEXT_PUBLIC_URL as string;
        const imageResp = await fetch(`${url}/api/image`, {
            method: "POST",
            body: JSON.stringify({
                prompt: params.prompt,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        });
        const image = await imageResp.json();
        if (!image.success) {
            return {
                error: "Failed to create image",
                content: "An error occurred while creating the image.",
            };
        }

        return {
            prompt: params.prompt,
            content: "An image has been created and is now visible to the user.",
            image: image.image,
        };
    }
});

export const webSearchTool = createTool({
    description: "Search the web for more information. This tool will call other functions that will include the research findings.",
    inputSchema: z.object({
        prompt: z.string().describe("The optimized prompt to use for generating a web search that will yield the best thorough results")
    }),
    execute: async (params: { prompt: string }) => {
        const { text, sources } = await generateText({
            model: gateway("google/gemini-2.0-flash"),
            system: websearch_prompt,
            prompt: params.prompt,
        });

        return {
            query: params.prompt,
            text: text,
            sources: sources,
            images: [],
            content: "Search results have been generated and are now visible to the user.",
        };
    }
});

export const tools = {
    webSearchTool,
};
