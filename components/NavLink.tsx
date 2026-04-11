"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavLink({
    href,
    baseUrl,
    activeClassName,
    inactiveClassName,
    children,
    title = "",
}: {
    href: string;
    baseUrl?: string;
    activeClassName: string;
    inactiveClassName: string;
    children: React.ReactNode;
    title?: string;
}) {
    const path = usePathname();

    let active = path === href || (href != baseUrl && path.startsWith(href));

    return (
        <Link className={`cursor-pointer ${active ? activeClassName : inactiveClassName}`} href={href} title={title}>
            <>{children}</>
        </Link>
    );
}
