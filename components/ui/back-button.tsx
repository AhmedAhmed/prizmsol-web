"use client";
import { ArrowLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "./button";

export default function BackButton({
    className
}: {
    className?: string;
}) {
    const router = useRouter();
    const goBack = () => {
        router.back();
    }
    return (
        <Button variant="ghost" size="icon" onClick={goBack} className={`${className} rounded-full curspor-pointer`}>
            <ArrowLeftIcon className="h-4" />
        </Button>
    );
}