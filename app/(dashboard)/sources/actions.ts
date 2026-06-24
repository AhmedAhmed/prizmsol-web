"use server";

import { auth } from "@/lib/auth";
import {
    deleteSourceForOwner,
    insertUserSource,
    resetUserSourcesTraining,
} from "@/lib/db/queries";
import { trainUserSources } from "@/lib/sources/train-user-sources";
import { get } from "lodash";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const TextFormValidationSchema = z.object({
    title: z.string().min(1).max(100),
    content: z.string().min(1),
});

const WebsiteFormValidationSchema = z.object({
    title: z.string().min(1).max(100),
    url: z.string().url(),
});

const sourceTypeSchema = z.enum(["text", "file", "website"]);

async function requireUserId(): Promise<string | null> {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    return session?.user?.id ?? null;
}

export async function addSourceAction(formData: FormData) {
    const userId = await requireUserId();
    if (!userId) {
        return { status: 401, data: null, errors: ["Unauthorized"] };
    }

    const typeRaw = formData.get("type") as string;
    const typeParsed = sourceTypeSchema.safeParse(typeRaw);
    if (!typeParsed.success) {
        return { status: 400, data: null, errors: ["Invalid source type"] };
    }
    const type = typeParsed.data;
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const fileUrl = (formData.get("file") as string) || "";

    let name: string;
    let body: string;

    if (type === "website") {
        const url = formData.get("url") as string;
        const websiteValidation = WebsiteFormValidationSchema.safeParse({ title, url });
        if (!websiteValidation.success) {
            const titleErrors = get(websiteValidation.error.flatten(), "fieldErrors.title.[0]", "");
            const urlErrors = get(websiteValidation.error.flatten(), "fieldErrors.url.[0]", "");
            const errs: string[] = [];
            if (titleErrors) errs.push(String(titleErrors));
            if (urlErrors) errs.push(String(urlErrors));
            return { status: 400, data: null, errors: errs };
        }
        name = websiteValidation.data.title;
        body = websiteValidation.data.url;
    } else {
        const formValidation = TextFormValidationSchema.safeParse({ title, content });
        if (!formValidation.success) {
            const titleErrors = get(formValidation.error.flatten(), "fieldErrors.title.[0]", "");
            const contentErrors = get(formValidation.error.flatten(), "fieldErrors.content.[0]", "");
            const errs: string[] = [];
            if (titleErrors) errs.push(String(titleErrors));
            if (contentErrors) errs.push(String(contentErrors));
            return { status: 400, data: null, errors: errs };
        }
        name = formValidation.data.title;
        body = formValidation.data.content;
    }

    let metadata: Record<string, unknown>;
    if (type === "file") {
        metadata = {
            content: body,
            characterCount: body.length,
            fileUrl: fileUrl || undefined,
            fileName: name,
            mimeType: "application/octet-stream",
            fileSize: 0,
            storageKey: (() => {
                if (!fileUrl) {
                    return "";
                }
                try {
                    return new URL(fileUrl).pathname.replace(/^\//, "");
                } catch {
                    return "";
                }
            })(),
        };
    } else if (type === "website") {
        metadata = {
            url: body,
            characterCount: 0,
        };
    } else {
        metadata = {
            content: body,
            characterCount: body.length,
        };
    }

    try {
        const row = await insertUserSource({
            userId,
            type,
            name,
            metadata,
        });
        if (!row) {
            return { status: 500, data: null, errors: ["Could not save source"] };
        }

        await resetUserSourcesTraining(userId);

        revalidatePath("/", "layout");
        return {
            status: 200,
            data: row,
            errors: [] as string[],
        };
    } catch (e) {
        console.error(e);
        return { status: 500, data: null, errors: ["Could not save source"] };
    }
}

export async function deleteSourceAction(formData: FormData) {
    const userId = await requireUserId();
    if (!userId) {
        return { status: 401, data: null, errors: ["Unauthorized"] };
    }

    const id = formData.get("id") as string;
    if (!id) {
        return { status: 400, data: null, errors: ["Invalid request"] };
    }

    try {
        const ok = await deleteSourceForOwner({ sourceId: id, userId });
        if (!ok) {
            return { status: 404, data: null, errors: ["Source not found"] };
        }

        await resetUserSourcesTraining(userId);

        revalidatePath("/sources", "layout");
        return { status: 200, data: null, errors: [] as string[] };
    } catch (e) {
        console.error(e);
        return { status: 500, data: null, errors: ["Could not delete source"] };
    }
}

export async function trainSourcesAction(formData: FormData): Promise<{
    status: number;
    data: { trained: number; totalChunks: number } | null;
    error?: string;
}> {
    const userId = await requireUserId();
    if (!userId) {
        return { status: 401, data: null, error: "Unauthorized" };
    }

    const result = await trainUserSources({ userId });
    if (!result.ok) {
        return { status: 400, data: null, error: result.error };
    }

    revalidatePath("/sources", "layout");
    return { status: 200, data: { trained: result.trained, totalChunks: result.totalChunks } };
}
