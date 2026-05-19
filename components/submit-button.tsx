"use client";

import { cn } from '@/lib/utils';
import { CheckCircle2Icon, Loader2Icon, LucideIcon } from 'lucide-react';
import React, { useEffect } from 'react';
import { useFormStatus } from "react-dom";
import { Button } from "./ui/button";
import { useRouter } from 'next/navigation';

export default function SubmitButton({
    text,
    pendingText,
    className,
    variant,
    disabled,
}: {
    text: string;
    className?: string;
    pendingText?: string;
    doneText?: string;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | null | undefined;
    icon?: LucideIcon;
    disabled?: boolean;
}) {
    const status = useFormStatus();
    const [showCheck, setShowCheck] = React.useState(false);
    const router = useRouter();

    useEffect(() => {
        if (!status.pending) {
            setTimeout(() => {
                setShowCheck(false);
                router.refresh();
            }, 1000);
        }
    }, [status]);

    const renderCheck = () => {
        return showCheck && (
            <CheckCircle2Icon size={15} className='font-bold' />
        );
    }

    return (
        <Button type="submit" variant={variant} onClick={() => setShowCheck(true)} disabled={status.pending || disabled} className={cn('flex cursor-pointer justify-center items-center', className)}>
            {status.pending && <Loader2Icon size={15} className='animate-spin' />}
            <span className='text-md'>
                {status.pending ? pendingText : text}
            </span>
        </Button>
    );
}
