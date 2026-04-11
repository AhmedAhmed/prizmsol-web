import type { NextAuthOptions } from "next-auth";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const authConfig: Partial<NextAuthOptions> = {
  pages: {
    signIn: `${base}/login`,
    newUser: `${base}/`,
  },
  providers: [],
  callbacks: {},
};