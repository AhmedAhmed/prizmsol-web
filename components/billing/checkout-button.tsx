"use client";

import { useState } from "react";
import { Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";

type CheckoutButtonProps = {
  disabled?: boolean;
  label?: string;
  productId?: string;
};

export function CheckoutButton({
  disabled = false,
  label = "Upgrade with Stripe",
  productId,
}: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const onCheckout = async () => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId }),
      });

      if (response.status === 401) {
        window.location.href = `/login?redirectUrl=${encodeURIComponent(
          "/pricing"
        )}`;
        return;
      }

      if (!response.ok) {
        throw new Error("Unable to create checkout session");
      }

      const payload = (await response.json()) as { url?: string };

      if (!payload.url) {
        throw new Error("Checkout URL missing");
      }

      window.location.href = payload.url;
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  return (
    <Button
      className="w-full"
      disabled={disabled || isLoading}
      onClick={onCheckout}
      size="lg"
    >
      {isLoading ? <Loader2Icon className="h-4 w-4 animate-spin" /> : null}
      {label}
    </Button>
  );
}
