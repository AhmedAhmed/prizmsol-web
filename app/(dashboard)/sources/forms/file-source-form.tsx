"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { isEmpty } from "lodash";
import { UploadIcon } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { addSourceAction } from "../actions";

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

export default function FileSourceForm() {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [progress, setProgress] = useState<number>(0);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [formTitle, setFormTitle] = useState<string>("");
    const [formContent, setFormContent] = useState<string>("");
    const [url, setUrl] = useState<string>("");

    const parseFile = async (fileUrl: string) => {
        if (!fileUrl) {
            toast.error("No file to parse");
            return { content: "", title: "", extension: "", message: "No file to parse" };
        }
        const response = await fetch("/api/file-content", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileUrl }),
        });
        const data = (await response.json()) as {
            content: string;
            extension: string;
            message: string;
            title: string;
        };
        if (!response.ok) {
            throw new Error((data as { message?: string }).message ?? "Parse failed");
        }
        return data;
    };

    const handleFile = async (file: File) => {
        let fileUrl: string | undefined;
        try {
            setIsUploading(true);
            setProgress(0);
            const uploadForm = new FormData();
            uploadForm.append("file", file);
            const response = await fetch("/api/upload/sign", {
                method: "POST",
                body: uploadForm,
            });
            const data = (await response.json()) as {
                url?: string;
                fileUrl?: string;
                error?: string;
                message?: string;
            };
            if (!response.ok) {
                throw new Error(data.error ?? data.message ?? "Upload failed");
            }
            if (data.url && data.fileUrl) {
                fileUrl = data.fileUrl;
                setUrl(data.fileUrl);
                await putFileWithProgress(data.url, file, setProgress);
                const parsed = await parseFile(data.fileUrl);
                setFormContent(parsed.content);
                setFormTitle(parsed.title);

                // Auto-submit after successful file parse
                const formData = new FormData();
                formData.append("type", "file");
                formData.append("file", data.fileUrl);
                formData.append("title", parsed.title);
                formData.append("content", parsed.content);
                const response = await addSourceAction(formData);
                if (response.status === 200) {
                    toast.success("Source added successfully");
                    setFormTitle("");
                    setFormContent("");
                    setUrl("");
                } else if (!isEmpty(response.errors)) {
                    for (const err of response.errors) {
                        if (err) toast.error(err);
                    }
                }
            }
        } catch (e: unknown) {
            console.warn("upload", e);
            toast.error(e instanceof Error ? e.message : "Upload failed");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="flex flex-col gap-4 w-full">
            <input
                ref={fileInputRef}
                type="file"
                accept=".doc,.docx,.txt,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                className="hidden"
                onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                        void handleFile(f);
                        e.target.value = "";
                    }
                }}
            />
            <div className="flex flex-col w-full gap-2 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 p-8 items-center justify-center min-h-[300px] bg-neutral-50/50 dark:bg-neutral-900/30">
                <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center">
                    doc, docx, or txt — up to 10 MB
                </p>
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                    <UploadIcon className="w-4 h-4 mr-2" />
                    Choose file
                </Button>
            </div>
            {isUploading && (
                <div className="flex flex-col w-full gap-2">
                    <div className="flex justify-between text-sm">
                        <span>Uploading…</span>
                        <span className="text-neutral-500">{progress}%</span>
                    </div>
                    <Progress value={progress} />
                </div>
            )}
            {formTitle && formContent && !isUploading && (
                <div className="text-sm text-neutral-600">
                    Adding source: <strong>{formTitle}</strong>
                </div>
            )}
        </div>
    );
}
