"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";

// ─── Schemas ──────────────────────────────────────────────────────────────────

const emailSchema = z.object({
  email: z.string(),
});

const otpSchema = z.object({
  email: z.string(),
  otp: z.string().length(6),
});

// ─── Send OTP ─────────────────────────────────────────────────────────────────

export type SendOtpActionState = {
  status: "idle" | "in_progress" | "success" | "failed" | "invalid_data";
  email?: string;
};

export const sendOtp = async (
  _: SendOtpActionState,
  formData: FormData
): Promise<SendOtpActionState> => {
  try {
    const parsed = emailSchema.safeParse({
      email: formData.get("email"),
    });

    if (!parsed.success) {
      return { status: "invalid_data" };
    }

    const email = parsed.data.email.toLowerCase().trim();

    await auth.api.sendVerificationOTP({
      body: { email, type: "sign-in" },
    });

    return { status: "success", email };
  } catch (error) {
    console.error("sendOtp error:", error);
    return { status: "failed" };
  }
};

// ─── Verify OTP ───────────────────────────────────────────────────────────────

export type VerifyOtpActionState = {
  status:
    | "idle"
    | "in_progress"
    | "success"
    | "failed"
    | "invalid_otp"
    | "invalid_data";
  email?: string;
};

export const verifyOtp = async (
  _: VerifyOtpActionState,
  formData: FormData
): Promise<VerifyOtpActionState> => {
  try {
    const parsed = otpSchema.safeParse({
      email: formData.get("email"),
      otp: formData.get("otp"),
    });

    if (!parsed.success) {
      return { status: "invalid_data" };
    }

    const email = parsed.data.email.toLowerCase().trim();
    const otp = parsed.data.otp.trim();

    await auth.api.signInEmailOTP({
      body: { 
        email,
        type: "sign-in",
        otp 
      },
      headers: await headers(),
    });

    return { status: "success", email };
  } catch (error: any) {
    console.error("verifyOtp error:", error);

    if (
      error?.message?.toLowerCase().includes("invalid") ||
      error?.message?.toLowerCase().includes("otp")
    ) {
      return { status: "invalid_otp" };
    }

    return { status: "failed" };
  }
};