"use client";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

interface AutogrowTextareaProps extends React.ComponentProps<typeof Textarea> {
    isSubmitting?: boolean;
    shouldClear?: boolean;
}

export default function AutogrowTextarea({ isSubmitting, shouldClear, ...props }: AutogrowTextareaProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (!textareaRef.current) return;
        const textarea = textareaRef.current;

        const adjustHeight = () => {
            // Reset height to auto to get the correct scrollHeight
            textarea.style.height = 'auto';
            // Set the height to the scrollHeight to expand the textarea
            textarea.style.height = `${textarea.scrollHeight}px`;
        };

        // Initial adjustment
        adjustHeight();

        // Add event listener
        textarea.addEventListener('input', adjustHeight);

        // Clean up
        return () => {
            textarea.removeEventListener('input', adjustHeight);
        };
    }, []);

    return <Textarea
        {...props}
        ref={textareaRef}
        className={
            cn("w-full p-3 border border-neutral-300 dark:border-neutral-700 rounded-md focus:outline-hidden focus:ring-2 focus:ring-blue-500 min-h-[50px] overflow-hidden resize-none", props.className)
        }
    />;
}
