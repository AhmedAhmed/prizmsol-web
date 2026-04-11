// import { saveDocument } from "@/lib/db/queries";
import { gateway } from "@ai-sdk/gateway";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { experimental_generateImage as generateImage } from "ai";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuid } from "uuid";

const s3Client = new S3Client({
    region: process.env.AWS_REGION as string,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS as string,
        secretAccessKey: process.env.AWS_SECRET as string,
    },
});

export async function POST(request: NextRequest) {
    const { prompt, chatId, messageId } = await request.json();

    try {
        const { image } = await generateImage({
            model: gateway("openai/gpt-image-1") as any,
            prompt: prompt,
            size: "1024x1024",
            providerOptions: {
                openai: {
                    quality: "medium",
                }
            }
        });

        let key = `tts/${uuid()}.mp3`;

        const params = {
            Key: key,
            Body: image.base64,
            ContentEncoding: "base64",
            ContentType: "image/png",
            Bucket: process.env.BUCKET_NAME,
        };

        const command = new PutObjectCommand(params);
        const data = await s3Client.send(command);

        // create a new tts in history.
        // const result = await saveDocument({
        //     chatId,
        //     messageId,
        //     content: prompt,
        //     media: `${process.env.CLOUDFRONT_URL}${key}`,
        //     type: "image",
        // });
        // if (result.count == 0) {
        //     return NextResponse.json({
        //         success: false,
        //         error: "Failed to create image",
        //     }, {
        //         status: 500,
        //     });
        // }
        return NextResponse.json({
            image: `${process.env.CLOUDFRONT_URL}${key}`,
            // result,
            data,
            success: true,
        }, {
            status: 200,
        });
    } catch (error) {
        console.error("Error generating image:", error);
        return new Response("Error generating image", { status: 500 });
    }
}
