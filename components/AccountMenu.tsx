"use client";
import {
    BarChartIcon,
    ChevronsUpDownIcon,
    CreditCardIcon,
    Layers,
    LifeBuoyIcon,
    LockIcon,
    LogOutIcon,
    ScrollIcon,
    Settings,
    SunMoonIcon,
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
import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { ModeToggle } from "./ui/mode-toggle";

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
        cancelAtPeriodEnd?: boolean;
    };
    showName?: boolean;
}) {
    const plan = accountSnapshot?.plan ?? user?.plan ?? "free";

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

    const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

    return (
        <div className="flex flex-1 h-full w-full bg-transparent">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <div className="flex flex-1 gap-1 justify-start items-center cursor-pointer active:opacity-80">
                        <Button variant="ghost" className={cn("relative hover:bg-neutral-200 dark:hover:bg-neutral-900 justify-start px-2 py-1 my-2.5 h-auto w-full", !showName && "hover:bg-transparent dark:hover:bg-transparent")}>
                            <div className="flex items-center flex-1 gap-2">
                                <div className="relative overflow-hidden rounded-full flex justify-center items-center bg-emerald-600 dark:bg-emerald-700 h-[32px] w-[32px]">
                                    {user?.image ? (
                                        <Image src={user?.image as string} alt="Avatar" width={35} height={35} className="h-full w-full object-cover" />
                                    ) : (
                                        <span className="text-md text-white">{getInitials(name)}</span>
                                    )}
                                </div>
                                {showName && <div className="hidden lg:flex flex-col items-start">
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
                            <span className="text-md text-black dark:text-white">{name}</span>
                            {user?.email && <span className="flex text-md font-normal text-black dark:text-white">{user.email}</span>}
                            <span className="text-xs text-neutral-500 dark:text-neutral-400">{capitalize(plan)} Plan</span>
                        </div>
                    </DropdownMenuLabel>
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
