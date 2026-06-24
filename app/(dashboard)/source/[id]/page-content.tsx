"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExternalLinkIcon, SearchIcon } from "lucide-react";
import { useMemo, useState } from "react";

interface Page {
    url: string;
    title: string;
    content: string;
}

export default function PageContent({
    pages,
}: {
    pages: Page[];
}) {
    const [search, setSearch] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);

    const filtered = useMemo(
        () =>
            pages.filter((p) =>
                p.title.toLowerCase().includes(search.toLowerCase()),
            ),
        [pages, search],
    );

    const selected = filtered[selectedIndex] ?? filtered[0];

    return (
        <div className="flex flex-1 gap-4 p-5 min-h-0">
            <div className="flex flex-col w-64 shrink-0 border rounded-md min-h-0">
                <div className="relative border-b">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <Input
                        type="text"
                        placeholder="Filter pages..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setSelectedIndex(0);
                        }}
                        className="pl-9 border-0 rounded-none shadow-none focus-visible:ring-0"
                    />
                </div>
                <ScrollArea className="flex-1">
                    <div className="flex flex-col p-1.5 gap-0.5">
                        {filtered.map((page, i) => (
                            <Button
                                key={i}
                                variant={i === selectedIndex ? "secondary" : "ghost"}
                                size="sm"
                                onClick={() => setSelectedIndex(i)}
                                className="justify-start text-left w-full h-auto py-1.5 px-2 font-normal"
                            >
                                <span className="line-clamp-2 text-xs">{page.title}</span>
                            </Button>
                        ))}
                        {filtered.length === 0 && (
                            <div className="px-3 py-4 text-sm text-neutral-500 text-center">
                                No pages match
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>
            {selected && (
                <div className="flex flex-col flex-1 border rounded-md min-h-0">
                    <div className="flex items-center gap-2 px-4 py-2 border-b bg-neutral-50 dark:bg-neutral-900/50 text-sm font-medium shrink-0">
                        <a
                            href={selected.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:underline truncate"
                        >
                            <ExternalLinkIcon className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{selected.title}</span>
                        </a>
                    </div>
                    <ScrollArea className="flex-1">
                        <pre className="p-4 text-sm whitespace-pre-wrap font-sans text-wrap break-all">
                            {selected.content}
                        </pre>
                    </ScrollArea>
                </div>
            )}
        </div>
    );
}
