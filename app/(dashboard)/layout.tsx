import AppLayout from "@/components/layouts/app-layout";
import { auth } from "@/lib/auth";
import { getPortfolioByUserId } from "@/lib/db/queries";
import SidebarProvider from "@/providers/sidebar-provider";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";

export default async function DashboardLayout({ children }: { children: React.ReactNode; }) {
    const session = await auth.api.getSession({
        headers: await headers() // you need to pass the headers object.
    })
    const user = session?.user;
    const portfolio = await user?.id ? await getPortfolioByUserId(user?.id as string) : null;
    if (!portfolio) {
        return redirect("/onboarding");
    } else {
        return (
            <SidebarProvider>
                <AppLayout>
                    {children}
                </AppLayout>
            </SidebarProvider>
        );
    }
}
