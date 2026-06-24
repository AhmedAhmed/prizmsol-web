"use client";
import SubmitButton from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { isEmpty } from "lodash";
import { GlobeIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { addSourceAction } from "../actions";

export default function WebsiteSourceForm() {
    const [title, setTitle] = useState<string>("");
    const [url, setUrl] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!title.trim() || !url.trim()) return;

        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);
        try {
            const response = await addSourceAction(formData);
            if (response.status === 200) {
                toast.success("Website source added");
                setTitle("");
                setUrl("");
            } else if (!isEmpty(response.errors)) {
                for (const err of response.errors) {
                    if (err) toast.error(err);
                }
            }
        } catch (err) {
            console.error("submit error", err);
            toast.error("Failed to add source");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input type="hidden" name="type" value="website" />
            <div className="flex flex-col gap-2">
                <Input
                    type="text"
                    name="title"
                    value={title}
                    className="rounded-sm bg-transparent dark:bg-transparent"
                    placeholder="Source title"
                    onChange={(e) => setTitle(e.target.value)}
                />
            </div>
            <div className="flex flex-col gap-2">
                <div className="relative">
                    <GlobeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <Input
                        type="url"
                        name="url"
                        value={url}
                        className="rounded-sm bg-transparent dark:bg-transparent pl-10"
                        placeholder="https://example.com"
                        onChange={(e) => setUrl(e.target.value)}
                    />
                </div>
                <p className="text-xs text-neutral-500">
                    We&apos;ll crawl same-domain pages up to 2 levels deep (max 25 pages).
                </p>
            </div>
            <div className="flex justify-end">
                <SubmitButton text="Add Website Source" disabled={!title.trim() || !url.trim() || isSubmitting} />
            </div>
        </form>
    );
}
