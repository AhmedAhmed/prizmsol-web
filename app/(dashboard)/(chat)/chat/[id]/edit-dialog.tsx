import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { PencilIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { editProjectTitle } from "./actions/editProjectAction";
import SubmitButton from "@/components/submit-button";

export default function EditDialog({
    open,
    project,
    onOpenChange
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    project: any;
}) {
    const router = useRouter();
    const handleSave = async (formData: FormData) => {
        const { success, message, error } = await editProjectTitle(formData);

        if (success) {
            toast.success(message);
            onOpenChange(false);
            router.refresh();
        } else {
            toast.error(error);
        }
    }
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Chat</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                    Edit the title of your chat.
                </DialogDescription>
                <form className="space-y-4" action={handleSave}>
                    <Input type="hidden" name="id" value={project?.id} />
                    <Input
                        placeholder="Untitled Project"
                        className="w-full"
                        name="title"
                        defaultValue={project?.title}
                    />
                    <DialogFooter>
                        <SubmitButton
                            text="Save"
                            className="cursor-pointer text-white dark:text-white bg-emerald-500 dark:bg-emerald-700 hover:bg-emerald-700 dark:hover:bg-emerald-800 text-white"
                        />
                        <Button type="button" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
