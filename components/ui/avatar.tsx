"use client";
import Image from "next/image";
import { useState } from "react";

interface AvatarProps {
    src: string;
    fallback?: string;
}

export default function Avatar(props: AvatarProps & typeof Image ) {
    const [isError, setIsError] = useState(false);
    const { fallback = "AA" } = props;
    return (
        <div className="relative flex justify-center items-center bg-emerald-600 dark:bg-emerald-700 h-[32px] w-[32px]">
            <Image
                alt="Avatar"
                {...props}
                onError={() => setIsError(true)}
            />
            {isError && <span className="text-md text-white">{fallback}</span>}
        </div> 
    );
}