"use client";
import { Button } from "@/components/ui/button";
import { PaperclipIcon } from "lucide-react";
import { useRef, useState } from "react";

function putFileWithProgress(
    url: string,
    file: File,
    onProgress: (percent: number) => void,
): Promise<void> {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", url);
        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable && e.total > 0) {
                onProgress(Math.round((e.loaded / e.total) * 100));
            }
        };
        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve();
            } else {
                reject(new Error(`Upload failed (${xhr.status})`));
            }
        };
        xhr.onerror = () => reject(new Error("Upload failed"));
        xhr.send(file);
    });
}

export default function UploadFile({
    onFinish,
    onProgress,
}: {
    onProgress: (percent: number) => void;
    onFinish: (file: string) => void;
}) {
    const fileRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState<boolean>(false);

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        const list = e.target.files;
        if (!list?.[0]) {
            return;
        }
        const file = list[0];
        try {
            setIsUploading(true);
            const formData = new FormData();
            formData.append("file", file);
            const response = await fetch("/api/upload/sign", {
                method: "POST",
                body: formData,
            });
            const data = (await response.json()) as {
                url?: string;
                fileUrl?: string;
                error?: string;
            };
            if (!response.ok) {
                throw new Error(data.error ?? "Upload failed");
            }
            if (data.url && data.fileUrl) {
                await putFileWithProgress(data.url, file, (p) => onProgress?.(p));
                onProgress?.(100);
                onFinish?.(data.fileUrl);
            }
        } catch (err) {
            console.warn("uploadUrl Error: ", err);
        } finally {
            setIsUploading(false);
            e.target.value = "";
        }
    };

    return (
        <div className="flex items-center gap-1">
            <input
                type="file"
                accept=".pdf,.docx,.doc,.txt"
                ref={fileRef}
                onChange={handleChange}
                className="hidden"
            />
            <Button type="button" variant="ghost" onClick={() => fileRef.current?.click()}>
                <PaperclipIcon className="w-4 h-4" />
            </Button>
            {isUploading && <span>Uploading...</span>}
        </div>
    );
}
