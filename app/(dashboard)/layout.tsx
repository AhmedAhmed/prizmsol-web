import AppLayout from "@/components/layouts/app-layout";
import SidebarProvider from "@/providers/sidebar-provider";
import React from "react";

export default async function DashboardLayout({ children }: { children: React.ReactNode; }) {
    return (
        <SidebarProvider>
            <AppLayout>
                {children}
            </AppLayout>
        </SidebarProvider>
    );
}
