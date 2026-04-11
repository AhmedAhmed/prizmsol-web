"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useActionState, useEffect, useState } from "react";

import { type LoginActionState, login } from "../actions";
import { toast } from "sonner";
import { AuthForm } from "@/components/chat/auth-form";
import SubmitButton from "@/components/submit-button";

export default function Page() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSuccessful, setIsSuccessful] = useState(false);

  const [state, formAction] = useActionState<LoginActionState, FormData>(
    login,
    { status: "idle" }
  );

  const { update: updateSession } = useSession();


  const handleSuccess = async () => {
    if (state.status === "success" && state.email && state.password) {
      await signIn("credentials", {
        email: state.email,
        password: state.password,
        callbackUrl: "/",
      });
      router.refresh();
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: router and updateSession are stable refs
  useEffect(() => {
    if (state.status === "failed") {
      toast.error("Invalid credentials!");
    } else if (state.status === "invalid_data") {
      toast.error("Failed validating your submission!");
    } else if (state.status === "success" && state.email && state.password) {
      setIsSuccessful(true);
      handleSuccess();
    }
  }, [state.status]);

  const handleSubmit = (formData: FormData) => {
    setEmail(formData.get("email") as string);
    formAction(formData);
  };

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Welcome to Prizmsol</h1>
      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
        Sign in to your account to continue
      </p>
      <AuthForm action={handleSubmit} defaultEmail={email}>
        <SubmitButton text="Sign In" />
        <p className="text-center text-[13px] text-neutral-600 dark:text-neutral-400">
          {"No account? "}
          <Link
            className="text-black dark:text-white font-semibold underline-offset-4 hover:underline"
            href="/register"
          >
            Sign up
          </Link>
        </p>
      </AuthForm>
    </>
  );
}
