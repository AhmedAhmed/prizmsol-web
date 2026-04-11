"use client";
import { SessionProvider } from "next-auth/react";

export const NextAuthProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider
        basePath={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/api/auth`}
    >
        {children}
    </SessionProvider>
  );
};