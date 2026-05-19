"use client";
import { ChevronLeftIcon } from "lucide-react";
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
        <Button variant="ghost" size="icon" onClick={goBack} className={`${className} rounded-sm curspor-pointer`}>
            <ChevronLeftIcon className="h-4" />
        </Button>
    );
}