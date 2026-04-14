"use client";
import SubmitButton from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { MailIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { settingsAction } from "../actions";


export default function GeneralSettingsForm({
    user
}: {
    user: any;
}) {
    const [state, action] = useActionState(settingsAction, undefined);
    const router = useRouter();

    useEffect(() => {
        if (state?.status == 200) {
            toast.success("Settings saved successfully");
            router.refresh();
        }
    }, [state, router]);

    return (
        <form className="flex flex-col gap-5 mx-auto w-full max-w-xl" action={action}>
            <div className="flex flex-col gap-2">
                <label htmlFor="name" className="text-sm font-semibold">Name</label>
                <Input type="text" name="name" id="name" autoComplete="off" defaultValue={user?.name} />
                <p className="text-sm text-red-500">{state?.errors?.name}</p>
            </div>
            <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-sm font-semibold">Email</label>
                <div className="relative text-neutral-800/80 dark:text-neutral-200/80 items-center file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border dark:border-neutral-800 flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive">
                    <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 dark:text-neutral-500 h-4 w-4 border-r border-neutral-200 dark:border-neutral-800" />
                    <span className="pl-8">{user.email}</span>
                </div>
                <span className="text-sm text-neutral-500 dark:text-neutral-500">Changing your email address is currently not supported.</span>
            </div>

            <SubmitButton text="Save" className="w-full" />
        </form>
    );
}
