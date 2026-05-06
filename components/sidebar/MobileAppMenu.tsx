import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { TooltipPortal } from "@radix-ui/react-tooltip";
import { ArrowRightFromLine } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SimpleBar from "simplebar-react";
import AccountMenu from "../AccountMenu";
import LogoIcon from "../logoIcon";
import SimpleTooltip from "../simple-tooltip";
import { appMenuItems, loggedOutMenuItems } from "./constants";
export default function MobileAppMenu({
    onClickHandler,
}: {
    onClickHandler: () => void;
}) {
    const pathname = usePathname();
    const { data: session } = authClient.useSession()
    const user = session?.user;
    const isLoggedOut = false;
    const menuItems = !isLoggedOut ? appMenuItems : loggedOutMenuItems;

    const isSelected = (url: string) => {
        if (url == "/" && pathname == url) {
            return true;
        } else if (url != "/" && pathname.startsWith(url)) {
            return true;
        }
        return false;
    };

    const renderItem = ({ href, name, icon: Icon, variant = "ghost", newChat = false }: any, index: number) => {
        const selected = isSelected(href);
        return (
            <li className={cn(
                `flex flex-1 w-full justify-start items-center z-40`,
            )} key={index}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant={variant}
                            className={cn(
                                `flex flex-1 cursor-pointer justify-center items-center relative border border-transparent h-[34px] gap-3 px-2 bg-neutral-100 dark:bg-neutral-950 hover:bg-neutral-200 dark:hover:bg-neutral-700/20 dark:hover:border-neutral-800/30`,
                                {
                                    "bg-neutral-200 hover:bg-neutral-200 dark:bg-neutral-800/30 dark:hover:bg-neutral-700/30 border-neutral-300 dark:border-neutral-800/30": selected && variant == "ghost",
                                    "bg-neutral-950 hover:bg-neutral-800 text-neutral-50 hover:text-neutral-50 dark:bg-white dark:hover:bg-neutral-200 dark:text-neutral-950 dark:hover:text-neutral-950 border-0": newChat,
                                }
                            )}
                            asChild
                        >
                            <Link href={href} className="cursor-default">
                                <Icon size={26} />
                            </Link>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                        <span>{name}</span>
                    </TooltipContent>
                </Tooltip>
            </li>
        );
    };

    return (
        <div className="flex flex-col mt-2.5 justify-start items-start gap-2 h-[calc(100vh-10px)] overflow-hidden z-40 bg-neutral-100 dark:bg-black">
            <SimpleBar className="w-[50px]">
                <div className="flex flex-col justify-between items-center h-[calc(100vh-10px)]">
                    <div className="flex flex-col items-center lg:items-start h-full">
                        <SimpleTooltip text="Prizmsol" side="right">
                            <Link href="/" className="flex pb-2.5 pt-3.5 justify-center items-center justify-self-center self-center h-[34px] w-[34px]">
                                <LogoIcon className="h-[18px]" />
                            </Link>
                        </SimpleTooltip>
                        <ul className="flex flex-col gap-1.5 w-full pt-2.5">
                            <li
                                className={`hidden lg:flex flex-1 justify-start items-center z-40 w-full`}
                            >
                                <div
                                    className={`flex flex-1 h-[34px] justify-between relative items-center gap-3`}
                                >
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                className="flex cursor-pointer flex-1 h-[34px] lg:h-full justify-start items-center relative border border-transparent gap-3 px-2 hover:bg-neutral-200 dark:hover:bg-neutral-900"
                                                onClick={onClickHandler}
                                            >
                                                <ArrowRightFromLine size={24} />
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
                    <AccountMenu user={user} showName={false} />
                </div>
            </SimpleBar>
        </div>
    );
}
