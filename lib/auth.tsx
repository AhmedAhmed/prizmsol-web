import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP } from "better-auth/plugins";
import { eq } from "drizzle-orm";
import { Resend } from "resend";
import { db } from "@/lib/db/drizzle";
import * as schema from "@/lib/db/schema";
import { getStripe } from "@/lib/stripe/server";
import { render } from "@react-email/components";
import { OtpEmail } from "@/lib/emails/otp-email";
import { nextCookies } from "better-auth/next-js";

const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),

  verification: {
    // This ensures identifiers (like email) are stored in plain text for lookup.
    storeIdentifier: "plain",
    // This ensures verification records (OTPs) are stored in the database.
    storeInDatabase: true,
  },

  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: 300,

      storeOTP: "plain",

      async sendVerificationOTP({ email, otp, type }) {
        if (type === "sign-in") {
          const html = await render(<OtpEmail otp={otp} />);

          await resend.emails.send({
            from: "Prizmsol <no-reply@updates.prizmsol.com>",
            to: email,
            subject: "Your login code",
            html,
          });
        }
      },
    }),

    nextCookies(),
  ],

  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          if (!user.email) return;

          const stripe = getStripe();

          const customer = await stripe.customers.create({
            email: user.email,
            name: user.name ?? undefined,
            metadata: { userId: user.id },
          });

          await db
            .update(schema.user)
            .set({ stripeCustomerId: customer.id })
            .where(eq(schema.user.id, user.id));
        },
      },
    },
  },
});
