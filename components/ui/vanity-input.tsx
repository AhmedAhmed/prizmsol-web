"use client";
import { AtSignIcon } from "lucide-react";
import { ChangeEvent } from "react";
import { Input } from "./input";

export default function UsernameInput({
    user,
    state
}: {
    user: any;
    state: any;
}) {

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const input = e.currentTarget;
        let value = input.value;

        // Allow letters, numbers, -, _, .
        value = value.replace(/[^a-zA-Z0-9._-]/g, "");

        // Remove leading number or period
        if (/^[0-9.]/.test(value)) {
            value = value.slice(1);
        }

        input.value = value;
    };

    return (
        <div className="flex flex-col gap-2">
            <label htmlFor="vanity" className="text-sm font-semibold">Vanity</label>
            <div className="flex items-center gap-2 relative">
                <AtSignIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 dark:text-neutral-500 h-4 w-4 border-r border-neutral-200 dark:border-neutral-800" />
                <Input
                    type="text"
                    name="vanity"
                    id="vanity"
                    className="pl-8"
                    autoComplete="off"
                    onChange={handleChange}
                    defaultValue={user.username}
                    placeholder="johndoe"
                />
            </div>
            <p className="text-sm text-red-500">{state?.errors?.name}</p>
        </div>
    );
}
