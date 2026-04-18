"use client";

import { Input } from "@/components/ui/input";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type VanityStatus = "idle" | "checking" | "available" | "taken" | "error";

interface VanityInputProps {
    error?: string;
    value?: string;
    onChange?: (value: string) => void;
    name?: string;
    defaultValue?: string;
}

const DEBOUNCE_MS = 500;
const MIN_LENGTH = 3;

function sanitize(raw: string) {
    return raw.toLowerCase().replace(/[^a-z0-9-]/g, "");
}

export function VanityInput({
    error,
    value: controlledValue,
    onChange,
    name = "vanity",
    defaultValue = ""
}: VanityInputProps) {
    const isControlled = controlledValue !== undefined;

    const [internalValue, setInternalValue] = useState(defaultValue);
    const value = isControlled ? controlledValue : internalValue;

    const [status, setStatus] = useState<VanityStatus>("idle");
    const [serverMessage, setServerMessage] = useState<string | null>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const latestVanity = useRef<string>("");

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const sanitized = sanitize(e.target.value);
        if (!isControlled) setInternalValue(sanitized);
        onChange?.(sanitized);

        setServerMessage(null);

        if (timerRef.current) clearTimeout(timerRef.current);

        if (sanitized.length < MIN_LENGTH) {
            setStatus("idle");
            return;
        }

        setStatus("checking");
        timerRef.current = setTimeout(() => checkVanity(sanitized), DEBOUNCE_MS);
    }

    async function checkVanity(vanity: string) {
        latestVanity.current = vanity;
        try {
            const res = await fetch(`/api/portfolio/vanity/${encodeURIComponent(vanity)}`);
            if (latestVanity.current !== vanity) return;

            const json = await res.json();
            if (latestVanity.current !== vanity) return;

            if (res.status === 200) {
                setStatus("available");
                setServerMessage(json.message ?? "Available");
            } else if (res.status === 400) {
                setStatus("taken");
                setServerMessage(json.message ?? "Not available");
            } else if (res.status === 401) {
                setStatus("error");
                setServerMessage("Sign in to check availability");
            } else {
                setStatus("error");
                setServerMessage("Could not check availability");
            }
        } catch {
            if (latestVanity.current !== vanity) return;
            setStatus("error");
            setServerMessage("Could not check availability");
        }
    }

    useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

    const statusIcon = {
        idle: null,
        checking: <Loader2 className="size-4 animate-spin text-muted-foreground" />,
        available: <CheckCircle2 className="size-4 text-emerald-500" />,
        taken: <XCircle className="size-4 text-destructive" />,
        error: <XCircle className="size-4 text-amber-500" />,
    }[status];

    const statusText: Record<VanityStatus, string> = {
        idle: value.length > 0 && value.length < MIN_LENGTH ? `Minimum ${MIN_LENGTH} characters` : "",
        checking: "Checking availability…",
        available: serverMessage ?? "Available",
        taken: serverMessage ?? "This vanity is already taken",
        error: serverMessage ?? "Could not check availability",
    };

    const statusColour: Record<VanityStatus, string> = {
        idle: "text-muted-foreground",
        checking: "text-muted-foreground",
        available: "text-emerald-600 dark:text-emerald-400",
        taken: "text-destructive",
        error: "text-amber-500",
    };

    const displayMessage = error ?? (statusText[status] || null);
    const displayColour = error ? "text-destructive" : statusColour[status];

    return (
        <div className="flex flex-col gap-2">
            <label htmlFor="vanity" className="text-sm font-semibold">
                Vanity
            </label>

            <div className="relative">
                <Input
                    id="vanity"
                    name={name}
                    type="text"
                    autoComplete="off"
                    spellCheck={false}
                    placeholder="Create a vanity for your portfolio"
                    value={value}
                    onChange={handleChange}
                    className={statusIcon ? "pr-9" : ""}
                />
                {statusIcon && (
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                        {statusIcon}
                    </span>
                )}
            </div>

            {displayMessage && (
                <p className={`text-sm ${displayColour}`}>{displayMessage}</p>
            )}
        </div>
    );
}