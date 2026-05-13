"use client";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { ArrowLeftFromLine } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SimpleBar from "simplebar-react";
import AccountMenu from "../AccountMenu";
import Logo from "../logo";
import LogoIcon from "../logoIcon";
import { appMenuItems, loggedOutMenuItems } from "./constants";

export default function AppMenu({
    chats,
    onClickHandler,
    initialUser,
    initialAccountSnapshot,
}: {
    chats: any;
    onClickHandler: any;
    initialUser?: any;
    initialAccountSnapshot?: {
        plan: string;
        totalUsed: number;
        limit: number;
        remaining: number;
    };
}) {
    const pathname = usePathname();
    const isLoggedOut = false;
    const { data: session } = authClient.useSession()
    const user = session?.user ?? initialUser;

    const menuItems = !isLoggedOut ? appMenuItems : loggedOutMenuItems;
    const isSelected = (url: string) => {
        if (url == "/" && pathname == url) {
            return true;
        } else if (url != "/" && pathname.startsWith(url)) {
            return true;
        }
        return false;
    };

    const renderItem = ({ href, name, icon: Icon, variant = "normal", newChat = false }: any, index: number) => {
        const selected = isSelected(href);
        return (
            <li className={
                cn(
                    `flex flex-1 justify-start items-center z-40`,
                )} key={index}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant={variant}
                            className={cn(
                                `flex flex-1 cursor-pointer group/pill h-[34px] justify-start items-center relative border border-transparent hover:border-neutral-300 dark:hover:border-neutral-800/30 gap-3 px-2 py-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-700/30 overflow-hidden`,
                                {
                                    "hover:bg-emerald-200/60 dark:hover:bg-emerald-800/30 hover:border-emerald-300 dark:hover:border-emerald-950": selected && variant == "normal",
                                    "bg-neutral-950 hover:bg-neutral-900 dark:bg-neutral-50 dark:hover:bg-neutral-100 border-0": newChat
                                }
                            )}
                            asChild
                        >
                            <Link href={href} className={cn("cursor-default", {
                                "mb-1.5": variant == "outline",
                            })}>
                                {newChat && <div className="absolute left-0 top-0 z-50 h-[34px] w-full -translate-x-full bg-linear-to-r from-transparent via-white/50 dark:via-black/50 to-transparent group-hover/pill:animate-[shimmer_1.5s]"></div>}
                                <Icon size={24} className={cn("opacity-50 group-hover/pill:opacity-100", {
                                    "text-white dark:text-black opacity-100": newChat,
                                    "opacity-100 text-emerald-700 dark:text-emerald-400": selected && !newChat,
                                })} />
                                <div className="hidden lg:flex flex-col">
                                    <span className={cn("flex", {
                                        "text-white dark:text-black": newChat,
                                        "text-neutral-800 group-hover/pill:text-neutral-900 dark:text-neutral-400 dark:group-hover/pill:text-neutral-50": !selected && !newChat,
                                        "text-emerald-700 dark:text-emerald-400": selected && !newChat,
                                    })}
                                    >
                                        {name}
                                    </span>
                                </div>
                            </Link>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent className="flex lg:hidden" side="right">
                        <span>{name}</span>
                    </TooltipContent>
                </Tooltip>
            </li>
        );
    };

    return (
        <div className="flex flex-col mt-2.5 justify-start items-start gap-2 w-[50px] lg:w-[250px]  h-[calc(100vh-10px)] overflow-hidden z-40 bg-neutral-100 dark:bg-black">
            <SimpleBar className="w-[50px] lg:w-[250px]">
                <div className="flex flex-col justify-between items-center lg:items-start h-[calc(100vh-10px)]">
                    <div className="flex flex-col gap-2 w-full">
                        <Link href="/" className="flex lg:self-start cursor-default flex-col gap-2 px-2 lg:px-4 py-2.5 relative group/pill overflow-hidden hover:opacity-100 h-[40px] w-full justify-center items-start">
                            <div className="absolute left-0 top-0 z-10 h-[72px] w-full -translate-x-full bg-linear-to-r from-transparent via-neutral-100/80 dark:via-black to-transparent group-hover/pill:animate-[shimmer_1.5s]"></div>
                            <Logo className="hidden lg:flex h-[22px]" />
                            <LogoIcon className="h-[18px] lg:hidden" />
                        </Link>
                        <ul className="flex flex-col gap-1.5 px-2 pb-1 w-full">
                            <li
                                className={`hidden lg:flex flex-1 h-[34px] justify-start items-center z-40 w-full`}
                            >
                                <div
                                    className={`flex flex-1 h-[34px] justify-between relative items-center gap-3`}
                                >
                                    <span className="hidden items-center lg:flex flex-1 text-md font-bold ml-2">Welcome</span>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                className="flex cursor-pointer h-[34px] lg:h-full w-[34px] justify-start items-center relative border border-transparent gap-3 px-2 hover:bg-neutral-200 dark:hover:bg-neutral-900"
                                                onClick={onClickHandler}
                                            >
                                                <ArrowLeftFromLine size={24} />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent side="right">
                                            <span>Collapse</span>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                            </li>
                            {menuItems.map(renderItem)}
                        </ul>
                    </div>
                    <div className="flex flex-col w-full gap-2 px-2.5">
                        {(initialUser) && (
                            <AccountMenu
                                user={user}
                                accountSnapshot={initialAccountSnapshot}
                            />
                        )}
                    </div>
                </div>
            </SimpleBar>
        </div>
    );
}
