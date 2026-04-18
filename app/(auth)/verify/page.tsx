"use client";

import { AuthForm } from "@/components/chat/auth-form";
import SubmitButton from "@/components/submit-button";
import { useRouter, useSearchParams } from "next/navigation";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { type VerifyOtpActionState, verifyOtp } from "../actions";

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [verifyState, verifyAction] = useActionState<
    VerifyOtpActionState,
    FormData
  >(verifyOtp, { status: "idle" });

  useEffect(() => {
    if (verifyState.status === "failed") {
      toast.error("Something went wrong. Please try again.");
    } else if (verifyState.status === "invalid_data") {
      toast.error("Please enter a valid 6-digit code.");
    } else if (verifyState.status === "invalid_otp") {
      toast.error("Incorrect code. Please try again.");
    } else if (verifyState.status === "success") {
      router.push("/");
      router.refresh();
    }
  }, [verifyState]);

  const handleOtpSubmit = (formData: FormData) => {
    formData.set("email", email);
    verifyAction(formData);
  };

  if (!email) {
    // fallback if someone lands here directly
    router.push("/");
    return null;
  }

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">
        Verify your email
      </h1>

      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
        Enter the 6-digit code sent to {email}.
      </p>

      <AuthForm action={handleOtpSubmit} type="otp">
        <SubmitButton text="Verify Code" />
      </AuthForm>

      <button
        type="button"
        onClick={() => router.push("/")}
        className="w-full text-center text-[13px] text-neutral-600 dark:text-neutral-400 hover:underline mt-2"
      >
        Use a different email
      </button>
    </>
  );
}
