import PaneHeader from "@/components/PaneHeader";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import Link from "next/link";

export default function RecentLayout({
    children
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-1 flex-col">
            <PaneHeader>
                <div className="flex flex-1 items-center justify-between">
                    <h2 className="text-sm font-bold">Recents</h2>
                    <Button variant="outline" className="group text-sm  w-fit px-1.5 py-0.5 h-auto" asChild>
                        <Link href="/">
                            <PlusIcon className="h-2.5 w-2.5 opacity-50 group-hover:opacity-100 transition-all" />
                            <span className="text-sm">New Chat</span>
                        </Link>
                    </Button>
                </div>
            </PaneHeader>
            <div className="flex flex-1 justify-center mt-10">
                <div className="flex flex-col w-full max-w-3xl px-5">
                    <div className="flex flex-col flex-1 items-center justify-between pb-10">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}