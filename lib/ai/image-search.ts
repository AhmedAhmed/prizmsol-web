"use server";

import { gateway } from "@ai-sdk/gateway";
import { generateText } from "ai";
import { image_search_prompt } from "./prompts";

const imageSearch = async (query: string) => {
    try {
        const host = process.env.NEXT_PUBLIC_URL || "https://www.prizmsol.com";
        const req = await fetch(`${host}/api/search?q=${encodeURIComponent(query)}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
        });
        if (!req.ok) {
            const errorText = await req.text();
            console.error("Image search error:", req.status, errorText);
            throw new Error(`Image search failed with status ${req.status}`);
        }
        const data = await req.json();
        if (!data || !data.images || data.images.length === 0) {
            throw new Error("No images found for the given query");
        }
        return data?.images || [];
    } catch (error) {
        console.error("Image search error:", error);
    }
}

export async function generateImageQuery(message: string) {
    const { text: title } = await generateText({
        model: gateway("google/gemini-2.0-flash"),
        system: image_search_prompt,
        prompt: message,
    });

    return title;
}

export default imageSearch;