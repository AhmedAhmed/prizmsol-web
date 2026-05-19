"use client";
import SubmitButton from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { isEmpty } from "lodash";
import { useState } from "react";
import { toast } from "sonner";
import { addSourceAction } from "../actions";
import { Textarea } from "@/components/ui/textarea";

export default function TextSourceForm() {
    const [title, setTitle] = useState<string>("");
    const [content, setContent] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) return;

        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);
        try {
            const response = await addSourceAction(formData);
            if (response.status === 200) {
                toast.success("Source added successfully");
                setTitle("");
                setContent("");
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
            <Input type="hidden" name="type" value="text" />
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
            <div className="flex flex-col flex-1 gap-2">
                <Textarea
                    name="content"
                    value={content}
                    className="field-sizing-content bg-transparent dark:bg-transparent text-sm placeholder:text-muted-foreground p-3 w-full min-h-[80px] max-h-[500px] resize-none border rounded-md"
                    placeholder="Paste your content here..."
                    onChange={(e) => setContent(e.target.value)}
                />
            </div>
            <div className="flex justify-end">
                <SubmitButton text="Add Text Source" disabled={!title.trim() || !content.trim() || isSubmitting} />
            </div>
        </form>
    );
}
