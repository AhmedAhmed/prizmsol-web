import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import NProgressProvider from "@/providers/nprogress-provider";
import PlayerProvider from "@/providers/player-provider";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import { Toaster } from "sonner";
import { SessionProvider } from "next-auth/react";
import "./globals.css";
import { NextAuthProvider } from "@/providers/next-auth-provider";
import Providers from "@/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "PrizmSol",
    description: "Prizmsol is an answer engine that provides users with upto date answers to questions, creates documents and helps with code.",
};

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${inter.className} dark:bg-neutral-900 bg-neutral-50 text-black relative dark:text-white flex min-h-full flex-col antialiased selection:bg-blue-700/80 selection:text-white dark:selection:bg-blue-700/80 dark:selection:text-white`}
            >
                <Suspense>
                    <Providers>
                        <div className="flex flex-col min-h-screen bg-neutral-100 dark:bg-black">
                            {children}
                        </div>
                        <Toaster theme="dark" />
                    </Providers>
                </Suspense>
            </body>
        </html>
    );
}
