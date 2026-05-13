import { GemIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "../../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../ui/dialog";

export default function LimitDialog({
    open,
    onOpenChange,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Upgrade Plan</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                    You have reached the limit of messages you can send on this plan. Please upgrade to continue sending messages.
                </DialogDescription>
                <DialogFooter>
                    <Link href="/billing" className="flex items-center space-x-4">
                        <Button type="button">
                            <GemIcon size={20} />
                            <span>Upgrade</span>
                        </Button>
                    </Link>
                    <Button type="button" variant="outline" className="bg-neutral-500 dark:bg-neutral-700 hover:bg-neutral-700 dark:hover:bg-neutral-800 text-white" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
