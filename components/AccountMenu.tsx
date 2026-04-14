"use client";
import {
    ChevronsUpDownIcon,
    CreditCardIcon,
    Layers,
    LifeBuoyIcon,
    LockIcon,
    LogOutIcon,
    ScrollIcon,
    Settings,
    SunMoonIcon,
    BarChartIcon
} from "lucide-react";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { ModeToggle } from "./ui/mode-toggle";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import Image from "next/image";

export default function AccountMenu({
    user,
    accountSnapshot,
    showName = true,
}: {
    user: any;
    accountSnapshot?: {
        plan: string;
        totalUsed: number;
        limit: number;
        remaining: number;
    };
    showName?: boolean;
}) {
    const initialPlan = accountSnapshot?.plan ?? user?.plan ?? "free";
    const initialLimit = accountSnapshot?.limit ?? 0;
    const initialRemaining = accountSnapshot?.remaining ?? 0;
    const initialUsed = accountSnapshot?.totalUsed ?? 0;
    const initialUsagePercent = initialLimit > 0 ? Math.min(100, (initialUsed / initialLimit) * 100) : 0;

    const [plan, setPlan] = useState<string>(initialPlan);
    const [usagePercent, setUsagePercent] = useState<number | null>(initialUsagePercent);
    const [totalCredits, setTotalCredits] = useState<number>(Math.round(initialLimit * 100));
    const [remainingCredits, setRemainingCredits] = useState<number>(Math.max(0, Math.round(initialRemaining * 100)));
    const [isCancelling, setIsCancelling] = useState(false);
    const name = user?.name || "Unknown User";
    const getInitials = (name: string) => {
        const names = name ? name.split(" ") : "AA";
        if (names.length > 1) {
            return names[0][0] + names[1][0];
        } else {
            return names[0][0];
        }
    }

    const handleLogout = async () => {
        signOut();
        toast.success("You have been logged out successfully");
    }

    const handleCancelPlan = async () => {
        try {
            setIsCancelling(true);
            const response = await fetch("/api/stripe/subscription/cancel", { method: "POST" });
            if (!response.ok) {
                toast.error("Unable to cancel plan");
                return;
            }
            setPlan("plan");
            toast.success("Plan will be cancelled at end of billing period.");
        } catch (_error) {
            toast.error("Unable to cancel plan");
        } finally {
            setIsCancelling(false);
        }
    };

    const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

    return (
        <div className="flex flex-1 h-full w-full bg-transparent">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <div className="flex flex-1 gap-1 justify-start items-center cursor-pointer active:opacity-80">
                        <Button variant="ghost" className={cn("relative hover:bg-neutral-200 dark:hover:bg-neutral-900 justify-start px-2 py-1 my-2.5 h-auto w-full", !showName && "hover:bg-transparent dark:hover:bg-transparent")}>
                            <div className="flex items-center flex-1 gap-2">
                                <Avatar className="relative flex justify-center items-center bg-emerald-600 dark:bg-emerald-700 h-[32px] w-[32px]">
                                    {user?.image ? (
                                        <Image src={user?.image as string} alt="Avatar" width={35} height={35} className="h-full w-full object-cover" />
                                    ) : (
                                        <AvatarFallback className="text-md text-white">{getInitials(name)}</AvatarFallback>
                                    )}
                                </Avatar>
                                {showName && <div className="flex flex-col items-start">
                                    <span className="text-md">{user?.name || "Unknown User"}</span>
                                    <span className="text-xs text-neutral-500 dark:text-neutral-400">{capitalize(plan)} </span>
                                </div>}
                            </div>
                            {showName && <ChevronsUpDownIcon className="ml-2 h-4 w-4" />}
                        </Button>
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[300px]">
                    <DropdownMenuLabel className="flex items-center gap-2">
                        <div className="flex flex-col">
                            <span className="text-md">{name}</span>
                            {user?.email && <span className="flex text-md font-normal">{user.email}</span>}
                            <span className="text-xs text-neutral-500 dark:text-neutral-400">{capitalize(plan)} Plan</span>
                        </div>
                    </DropdownMenuLabel>
                    <div className="mx-2 rounded-xl border border-neutral-200 bg-neutral-100 p-3 dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="mb-3 flex items-center justify-between">
                            <span className="text-sm font-semibold">Balance</span>
                            <Link
                                href="/pricing"
                                className="rounded-lg bg-black px-3 py-0.5 text-sm font-medium text-white dark:bg-white dark:text-black"
                            >
                                Upgrade
                            </Link>
                        </div>
                        <div className="space-y-1 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-neutral-500 dark:text-neutral-400">Total</span>
                                <span className="font-semibold">{totalCredits.toLocaleString()} credits</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-neutral-500 dark:text-neutral-400">Remaining</span>
                                <span className="font-semibold">{remainingCredits.toLocaleString()}</span>
                            </div>
                        </div>
                        {plan !== "free" ? (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="mt-3 w-full"
                                onClick={handleCancelPlan}
                                disabled={isCancelling}
                            >
                                {isCancelling ? "Cancelling..." : "Cancel plan"}
                            </Button>
                        ) : null}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem asChild>
                            <Link href="/" className="flex items-center w-full">
                                <Layers className="mr-2 h-4 w-4" />
                                <span>Home</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/pricing" className="flex items-center w-full">
                                <CreditCardIcon className="mr-2 h-4 w-4" />
                                <span>Plans</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/usage" className="flex items-center w-full">
                            <BarChartIcon className="mr-2 h-4 w-4" />
                                <span>Usage</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/settings" className="flex items-center w-full">
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Settings</span>
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                                <LifeBuoyIcon className="mr-2 h-4 w-4" />
                                <span>Legal</span>
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                                <DropdownMenuSubContent>
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href="/legal/terms"
                                            className="flex items-center w-full"
                                        >
                                            <ScrollIcon className="mr-2 h-4 w-4" />
                                            <span>Terms of Service</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href="/legal/privacy"
                                            className="flex items-center w-full"
                                        >
                                            <LockIcon className="mr-2 h-4 w-4" />
                                            <span>Privacy</span>
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                        </DropdownMenuSub>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <div className="flex flex-1 justify-between items-center mx-2">
                            <div className="flex items-center">
                                <SunMoonIcon className="mr-4 h-4 w-4" />
                                <span className="text-sm">Theme</span>
                            </div>
                            <ModeToggle />
                        </div>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem onClick={handleLogout}>
                            <LogOutIcon className="mr-2 h-4 w-4" />
                            <span>Logout</span>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
