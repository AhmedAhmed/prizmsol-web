"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useActionState, useEffect, useState } from "react";
import { AuthForm } from "@/components/chat/auth-form";
import { type RegisterActionState, register } from "../actions";
import { toast } from "sonner";
import SubmitButton from "@/components/submit-button";

export default function Page() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const [state, formAction] = useActionState<RegisterActionState, FormData>(
    register,
    { status: "idle" }
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: next-auth signIn handles redirect
  useEffect(() => {
    if (state.status === "user_exists") {
      toast.error("Account already exists!");
    } else if (state.status === "failed") {
      toast.error("Failed to create account!");
    } else if (state.status === "invalid_data") {
      toast.error("Failed validating your submission!");
    } else if (state.status === "success") {
      toast.success("Account created!");
      const loginEmail = state.email ?? email;
      const loginPassword = state.password;
      if (!loginEmail || !loginPassword) return;

      signIn("credentials", {
        email: loginEmail,
        password: loginPassword,
        redirect: true,
        callbackUrl: "/",
      });
    }
  }, [state.status]);

  const handleSubmit = (formData: FormData) => {
    setEmail(formData.get("email") as string);
    formAction(formData);
  };

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Create account</h1>
      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">Get started for free</p>
      <AuthForm type="signup" action={handleSubmit} defaultEmail={email}>
        <SubmitButton text="Sign up" />
        <p className="text-center text-[13px] text-neutral-600 dark:text-neutral-400">
          {"Have an account? "}
          <Link
            className="text-black dark:text-white font-semibold underline-offset-4 hover:underline"
            href="/login"
          >
            Sign in
          </Link>
        </p>
      </AuthForm>
    </>
  );
}
