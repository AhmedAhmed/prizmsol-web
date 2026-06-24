"use client";
import { MoreHorizontalIcon, PencilIcon, TrashIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { TypeAnimation } from "react-type-animation";
import DeleteDialog from "../delete-dialog";
import EditDialog from "../edit-dialog";

export default function SidebarTitle({
    project,
    numberOfMessages,
}: {
    project: any;
    numberOfMessages: number;
}) {
    const [editOpen, setEditOpen] = useState(false);
    const [open, setOpen] = useState(false);

    return (
        <>
            <div className="sticky top-0 z-20 bg-neutral-50 dark:bg-transparent border-b-[0.5px] border-neutral-200 dark:border-neutral-800 px-2.5 py-1.5 text-sm font-semibold flex items-center justify-between">
                <div className="flex w-full justify-between items-center gap-2">
                    <div className="flex flex-1 items-center gap-2">
                        {numberOfMessages == 1 && <TypeAnimation
                            style={{ width: "100%" }}
                            sequence={[project?.title]}
                            speed={80}
                            cursor={false}
                        />}
                        {numberOfMessages > 1 && <span className="text-md line-clamp-1">{project?.title}</span>}
                    </div>
                    <div className="flex items-center gap-1">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="p-1.5 h-auto w-auto" size="icon">
                                    <MoreHorizontalIcon size={20} />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setEditOpen(true)}>
                                    <PencilIcon size={20} />
                                    <span>Rename</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-500" onClick={() => setOpen(true)}>
                                    <TrashIcon size={20} />
                                    <span>Delete</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
            <DeleteDialog project={project} open={open} onOpenChange={setOpen} />
            <EditDialog project={project} open={editOpen} onOpenChange={setEditOpen} />
        </>
    );
}
