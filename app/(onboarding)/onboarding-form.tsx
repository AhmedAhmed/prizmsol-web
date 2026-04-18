"use client";
import SubmitButton from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { VanityInput } from "@/components/vanity-input";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { onboardingAction, updatePortfolioAction } from "./action";

export default function OnboardingForm({
    portfolio,
    edit = false
}: {
    portfolio: any;
    edit?: boolean;
}) {
    const [state, action] = useActionState(edit ? updatePortfolioAction : onboardingAction, undefined);
    const router = useRouter();

    useEffect(() => {
        if (state?.status == 200) {
            toast.success("Settings saved successfully");
            router.push("/");
        }
    }, [state, router]);

    return (
        <form className="flex flex-col gap-5 mx-auto w-full max-w-xl" action={action}>
            <div className="flex flex-col gap-2">
                <label htmlFor="title" className="text-sm font-semibold">Title</label>
                <Input type="text" name="title" id="title" autoComplete="off" placeholder="My Engineering Portfolio" defaultValue={portfolio?.title} />
                <p className="text-sm text-red-500">{state?.errors?.title}</p>
            </div>
            <VanityInput name="vanity" defaultValue={portfolio?.vanity} />
            <div className="flex flex-col gap-2">
                <label htmlFor="vanity" className="text-sm font-semibold">Description</label>
                <Textarea
                    name="description"
                    id="description"
                    className="resize-none field-sizing-content"
                    autoComplete="off"
                    placeholder="Tell people a little bit about you. This will be displayed on your website."
                    defaultValue={portfolio.description}
                />
                <p className="text-sm text-red-500">{state?.errors?.description}</p>
            </div>
            <SubmitButton text="Continue" className="w-full" />
        </form>
    );
}

