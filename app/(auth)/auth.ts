import { compare } from "bcrypt-ts";
import NextAuth, { type DefaultSession, type NextAuthOptions } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { DUMMY_PASSWORD } from "@/lib/constants";
import { getUser } from "@/lib/db/queries";
import { authConfig } from "./auth.config";

export type UserType = "guest" | "regular";
export type UserPlan = "free" | "pro" | "plus";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      type: UserType;
      plan?: UserPlan;
    } & DefaultSession["user"];
  }
  interface User {
    id?: string;
    email?: string | null;
    type: UserType;
    plan?: UserPlan;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    type: UserType;
    plan?: UserPlan;
  }
}

export const authOptions: NextAuthOptions = {
  ...authConfig,
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<any> {
        const email = String(credentials?.email ?? "");
        const password = String(credentials?.password ?? "");

        const users = await getUser(email);
        if (users.length === 0) {
          await compare(password, DUMMY_PASSWORD);
          return null; // returning null = no session
        }

        const [user] = users;
        if (!user.password) {
          await compare(password, DUMMY_PASSWORD);
          return null;
        }

        const passwordsMatch = await compare(password, user.password);
        if (!passwordsMatch) return null;

        // ✅ Make sure id is a string
        const result = {
          id: String(user.id),
          email: user.email,
          type: "regular" as UserType,
          name: user.name,
          plan: user.plan as UserPlan,
        };
      
        return result;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // user is only defined on first sign in
      if (user) {
        token.id = user.id as string;
        token.type = user.type as UserType;
        token.email = user.email;
        token.name = user.name;
        token.plan = user.plan as UserPlan;
      }
      return token;
    },
    async session({ session, token }) {
      // ✅ Explicitly build session.user from token instead of mutating
      session.user = {
        id: token.id,
        type: token.type,
        email: token.email,
        name: token.name,
        plan: token.plan as UserPlan,
      };
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };