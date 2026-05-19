import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuid } from "uuid";

const s3Client = new S3Client({
    region: process.env.AWS_REGION as string,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS as string,
        secretAccessKey: process.env.AWS_SECRET as string,
    },
});

function sanitizeFilename(name: string): string {
    return name
        .replace(/[^a-zA-Z0-9._-]/g, "-") // replace special chars with hyphens
        .replace(/-{2,}/g, "-") // collapse multiple hyphens
        .toLowerCase();
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get("file") as File | null;
        if (!file || !file.name) {
            return NextResponse.json({ error: "File is required." }, { status: 400 });
        }

        const bucket = process.env.BUCKET_NAME;
        const publicBase = process.env.CLOUDFRONT_URL;
        if (!bucket || !publicBase) {
            return NextResponse.json({ error: "Upload is not configured." }, { status: 500 });
        }

        const parts = file.name.split(".");
        const fileExtension = parts.length > 1 ? (parts.pop() ?? "bin") : "bin";
        const baseName = sanitizeFilename(parts.join("."));
        const id = uuid().slice(0, 8); // Use first 8 chars of UUID for brevity
        const key = `${session.user.id}/${baseName}-${id}.${fileExtension}`;

        const command = new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            ContentType: file.type || "application/octet-stream",
        });

        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
        const fileUrl = `${publicBase}${key}`;

        return NextResponse.json(
            {
                url,
                fileName: key,
                fileUrl,
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("upload/sign", error);
        return NextResponse.json(
            { message: "Error creating upload URL.", error: String(error) },
            { status: 500 },
        );
    }
}
