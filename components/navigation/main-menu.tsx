"use client";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";

export function MainMenu(props: any) {
  return (
    <NavigationMenu {...props}>
      <NavigationMenuList className="gap-5">
        <NavigationMenuItem>
          <Link href="/features" legacyBehavior passHref>
            <NavigationMenuLink className="hidden group lg:inline-flex h-10 w-max items-center justify-center rounded-md px-3 py-1 transition-colors focus:bg-neutral-100 focus:text-neutral-900 focus:outline-hidden disabled:pointer-events-none disabled:opacity-50 data-active:bg-neutral-100/50 data-[state=open]:bg-neutral-100/50 dark:focus:bg-neutral-800 dark:focus:text-neutral-50 dark:data-active:bg-neutral-800/50 dark:data-[state=open]:bg-neutral-800/50 group bg-transparent dark:bg-transparent text-sm font-semibold">
              Features
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/plans" legacyBehavior passHref>
            <NavigationMenuLink className="hidden group lg:inline-flex h-10 w-max items-center justify-center rounded-md px-3 py-1 transition-colors focus:bg-neutral-100 focus:text-neutral-900 focus:outline-hidden disabled:pointer-events-none disabled:opacity-50 data-active:bg-neutral-100/50 data-[state=open]:bg-neutral-100/50 dark:focus:bg-neutral-800 dark:focus:text-neutral-50 dark:data-active:bg-neutral-800/50 dark:data-[state=open]:bg-neutral-800/50 group bg-transparent dark:bg-transparent text-sm font-semibold">
              Plan
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/about" legacyBehavior passHref>
            <NavigationMenuLink className="hidden group lg:inline-flex h-10 w-max items-center justify-center rounded-md px-3 py-1 transition-colors focus:bg-neutral-100 focus:text-neutral-900 focus:outline-hidden disabled:pointer-events-none disabled:opacity-50 data-active:bg-neutral-100/50 data-[state=open]:bg-neutral-100/50 dark:focus:bg-neutral-800 dark:focus:text-neutral-50 dark:data-active:bg-neutral-800/50 dark:data-[state=open]:bg-neutral-800/50 group bg-transparent dark:bg-transparent text-sm font-semibold">
              About
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-hidden transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
