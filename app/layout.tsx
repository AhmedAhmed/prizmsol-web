import { cn } from "@/lib/utils";
import Providers from "@/providers";
import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import { Geist, Inter } from "next/font/google";
import { Suspense } from "react";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const geist = Geist({ subsets: ["latin"] });

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
        <html lang="en" suppressHydrationWarning className={cn("font-sans", inter.variable)}>
            <body
                className={`${geist.className} dark:bg-neutral-900 bg-neutral-50 text-black relative dark:text-white flex min-h-full flex-col antialiased selection:bg-emerald-300 selection:text-emerald-900`}
            >
                <Suspense>
                    <Providers>
                        <Analytics />
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
