"use client";
import { useSidebar } from "@/hooks/use-sidebar";
import { getUserPreference, saveUserPreference } from "@/lib/storage";
import { useEffect, useState } from "react";
import DesktopAppMenu from "./DesktopAppMenu";
import MobileAppMenu from "./MobileAppMenu";

const SIDEBAR_COOKIE_NAME = "sidebar_state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7

export default function AppMenu({ user, isExpanded, chats }: { user?: any; isExpanded: number, chats: any }) {
    const [expanded, setExpanded] = useState<number>(isExpanded || 0);
    const { setIsExpanded } = useSidebar();

    const toggleExpanded = () => {
        document.cookie = `${SIDEBAR_COOKIE_NAME}=${expanded == 0 ? 1 : 0}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`

        setExpanded(expanded == 0 ? 1 : 0);
        setIsExpanded(expanded == 0 ? 1 : 0);
        saveUserPreference("appMenuExpanded", expanded == 0 ? 1 : 0);
    };

    useEffect(() => {
        const exp = getUserPreference("appMenuExpanded");
        setExpanded(exp == "0" ? exp : 1);
        setIsExpanded(exp == "0" ? exp : 1);
    }, []);

    return expanded == 1 ? (
        <DesktopAppMenu
            chats={chats}
            onClickHandler={toggleExpanded}
            initialUser={user?.sessionUser}
            initialAccountSnapshot={user?.accountSnapshot}
        />
    ) : (
        <MobileAppMenu
            onClickHandler={toggleExpanded}
        />
    );
}
