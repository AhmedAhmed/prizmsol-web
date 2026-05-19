"use client";
import SubmitButton from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { TrashIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function DeleteSourceDialog({
    id,
    action,
}: {
    id: string;
    action: (formData: FormData) => Promise<{
        status: number;
        data: unknown;
        errors: string[];
    }>;
}) {
    const [open, setOpen] = useState(false);
    const handleAction = async (formData: FormData) => {
        const response = await action(formData);

        if (response.status === 200) {
            toast.success("Source deleted successfully");
            setOpen(false);
        } else {
            toast.error(response.errors[0] ?? "Delete failed");
        }
    };
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="cursor-pointer hover:bg-red-500/10 dark:hover:bg-red-500/20 shrink-0"
                >
                    <TrashIcon className="w-4 h-4 text-red-500 dark:text-red-400" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Are you sure you want to delete this source?</DialogTitle>
                    <DialogDescription>This action cannot be undone.</DialogDescription>
                </DialogHeader>
                <form action={handleAction}>
                    <Input type="hidden" name="id" value={id} />
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" type="button">
                                Cancel
                            </Button>
                        </DialogClose>
                        <SubmitButton variant="destructive" text="Delete" disabled={false} />
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
