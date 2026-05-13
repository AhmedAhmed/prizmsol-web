import { cn } from "@/lib/utils";
import { ChangeEventHandler } from "react";
import { useFormStatus } from "react-dom";

export default function PromptTextarea({
    value,
    name,
    onChange,
    disabled,
    textareaRef,
    className,
    enterToSend,
    placeholder,
    rows = 1,
    defaultValue,
    onPaste,
}: {
    value?: string;
    name?: string;
    onChange?: ChangeEventHandler<HTMLTextAreaElement>;
    enterToSend?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
    disabled?: boolean;
    textareaRef?: React.Ref<HTMLTextAreaElement>;
    className?: string;
    placeholder?: string;
    rows?: number;
    defaultValue?: string;
    onPaste?: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
}) {
    const status = useFormStatus();
    return (
        <textarea
            ref={textareaRef}
            className={cn(
                `min-h-[25px] w-full resize-none border-0 bg-transparent p-4 pb-2 placeholder:text-neutral-500 focus:outline-hidden focus:ring-0 sm:text-sm overflow-hidden`,
                className,
                {
                    "text-neutral-500 dark:text-neutral-500": status?.pending,
                }
            )}
            placeholder={placeholder || "Ask me anything..."}
            name={name}
            autoComplete="off"
            value={value}
            disabled={status?.pending || disabled}
            onChange={onChange}
            onKeyDown={enterToSend}
            rows={rows}
            defaultValue={defaultValue}
            onPaste={onPaste}
        />
    );
}
