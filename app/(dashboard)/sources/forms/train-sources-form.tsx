"use client";
import SubmitButton from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { BrainIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { trainSourcesAction } from "../actions";

export default function TrainSourcesForm() {
    const [isPending, setIsPending] = useState(false);

    const handleAction = async () => {
        setIsPending(true);
        const formData = new FormData();
        const response = await trainSourcesAction(formData);
        setIsPending(false);

        if (response.status === 200) {
            toast.success("Sources trained successfully");
        } else {
            toast.error(response.error ?? "Training failed");
        }
    };

    return (
        <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-6"
            onClick={() => handleAction()}
            disabled={isPending}
        >
            <BrainIcon className="w-4 h-4 mr-1" />
            {isPending ? "Training…" : "Train"}
        </Button>
    );
}
