import { auth } from "@/lib/auth";
import { extractTextFromRemoteFile } from "@/lib/sources/parse-remote-file";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

function isAllowedFileUrl(fileUrl: string): boolean {
    const prefix = process.env.CLOUDFRONT_URL;
    if (!prefix) {
        return false;
    }
    return fileUrl.startsWith(prefix);
}

export async function POST(req: Request) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    let body: { fileUrl?: string };
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
    }

    const fileUrl = body.fileUrl;
    if (!fileUrl || typeof fileUrl !== "string") {
        return NextResponse.json({ message: "fileUrl is required" }, { status: 400 });
    }

    if (!isAllowedFileUrl(fileUrl)) {
        return NextResponse.json({ message: "URL not allowed" }, { status: 403 });
    }

    try {
        const { text, title } = await extractTextFromRemoteFile(fileUrl);
        return NextResponse.json({
            content: text,
            title,
            extension: "",
            message: "ok",
        });
    } catch (e) {
        console.error("file-content", e);
        return NextResponse.json(
            { message: e instanceof Error ? e.message : "Parse failed" },
            { status: 500 },
        );
    }
}
