"use client";
import { FileIcon, GlobeIcon, TextIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SourcesFilter() {
    const pathname = usePathname();
    const isText = pathname == "/sources";
    const isFile = pathname == "/sources/files";
    const isWebsite = pathname == "/sources/websites";
    return (
        <div className="flex items-center border-b-[0.5px] border-neutral-200 dark:border-neutral-800 px-4 h-10">
            <Link
                href="/sources"
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    isText
                        ? "border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100"
                        : "border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                }`}
            >
                <span className="flex items-center gap-2">
                    <TextIcon className="w-4 h-4" />
                    Text
                </span>
            </Link>
            <Link
                href="/sources/files"
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    isFile
                        ? "border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100"
                        : "border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                }`}
            >
                <span className="flex items-center gap-2">
                    <FileIcon className="w-4 h-4" />
                    Files
                </span>
            </Link>
            <Link
                href="/sources/websites"
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    isWebsite
                        ? "border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100"
                        : "border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                }`}
            >
                <span className="flex items-center gap-2">
                    <GlobeIcon className="w-4 h-4" />
                    Websites
                </span>
            </Link>
        </div>
    );
}