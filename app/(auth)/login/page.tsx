"use client";

import { AuthForm } from "@/components/chat/auth-form";
import SubmitButton from "@/components/submit-button";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { type SendOtpActionState, sendOtp } from "../actions";

export default function Page() {
  const router = useRouter();

  const [sendState, sendAction] = useActionState<SendOtpActionState, FormData>(
    sendOtp,
    { status: "idle" }
  );

  useEffect(() => {
    if (sendState.status === "failed") {
      toast.error("Failed to send code. Please try again.");
    } else if (sendState.status === "invalid_data") {
      toast.error("Please enter a valid email.");
    } else if (sendState.status === "success" && sendState.email) {
      toast.success("Code sent to your email!");
      router.push(`/verify?email=${encodeURIComponent(sendState.email)}`);
    }
  }, [sendState]);

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">
        Welcome to Prizmsol
      </h1>

      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
        Enter your email to receive a login code.
      </p>

      <AuthForm action={sendAction}>
        <SubmitButton text="Continue" />
        <p className="text-center text-[13px] text-neutral-600 dark:text-neutral-400">
          No account needed. Just login with your email.
        </p>
      </AuthForm>
    </>
  );
}