import { CheckIcon } from "lucide-react";

import Link from "next/link";
import { ChevronLeftIcon } from "lucide-react";
import { CheckoutButton } from "@/components/billing/checkout-button";
import { Button } from "@/components/ui/button";
import {
  getConfiguredSubscriptionProductIds,
  getRecurringPriceForProduct,
  getCreditLimitCents,
  getPlanByProductId,
} from "@/lib/stripe/billing";
import { getStripe } from "@/lib/stripe/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

function formatPlanPrice(amount: number | null, interval: string | null) {
  if (amount === null || !interval) {
    return "Custom";
  }

  return `$${(amount / 100).toFixed(0)}/${interval}`;
}

export default async function PricingPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const checkoutState = resolvedSearchParams.checkout;
  const stripe = getStripe();
  const productIds = getConfiguredSubscriptionProductIds();

  // Fetch the user's current plan from the internal API
  let currentPlan: string | null = null;
  if (session?.user) {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/account/plan`, {
        headers: requestHeaders,
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        currentPlan = data.plan ?? null;
      }
    } catch {
      // If the request fails, fall back to showing no active plan
    }
  }

  const isOnFreePlan = session?.user && currentPlan === "free";

  const paidPlans = await Promise.all(
    productIds.map(async (productId) => {
      const price = await getRecurringPriceForProduct(stripe, productId);
      const product = await stripe.products.retrieve(productId);
      const plan = getPlanByProductId(productId);
      const creditCap = getCreditLimitCents(plan);
      return {
        productId,
        name: product.name,
        description: product.description ?? "Paid subscription plan",
        recurringPrice: formatPlanPrice(price.unit_amount, price.recurring?.interval ?? null),
        creditCap,
        isRecommended: product.name.toLowerCase().includes("plus"),
        // Match the plan key returned by the API against the plan identifier
        isCurrentPlan: currentPlan === plan,
      };
    })
  );

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 py-12">
      <div className="mb-6 w-full">
        <Link
          href="/"
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm text-neutral-600 transition-colors hover:bg-neutral-200 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Back
        </Link>
      </div>

      <div className="mx-auto mb-10 w-full max-w-3xl text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Pricing
        </h1>
        <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400 sm:text-base">
          Start free, then upgrade to unlock higher limits and priority
          performance.
        </p>
        {checkoutState === "success" ? (
          <p className="mt-4 rounded-md border border-green-500/40 bg-green-500/10 px-3 py-2 text-sm text-green-700 dark:text-green-400">
            Payment completed. Your subscription is now being activated.
          </p>
        ) : null}
        {checkoutState === "cancelled" ? (
          <p className="mt-4 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-300">
            Checkout cancelled. You can restart your subscription anytime.
          </p>
        ) : null}
      </div>

      <div className="flex w-full justify-center">
        <div className="w-full max-w-6xl overflow-x-auto rounded-2xl border border-neutral-200 bg-neutral-50 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="grid grid-cols-1 lg:grid-cols-3">
            <section className="flex min-h-[430px] flex-col border-b lg:border-b-0 lg:border-r border-neutral-200 p-7 dark:border-neutral-800">
              <h2 className="text-2xl font-semibold">Hobby</h2>
              <p className="mt-1 text-3xl font-bold">Free</p>
              <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-400">
                Includes:
              </p>
              <ul className="mt-5 space-y-2.5 text-sm">
                <li className="flex items-start gap-2">
                  <CheckIcon className="mt-0.5 h-4 w-4" />
                  No credit card required
                </li>
                <li className="flex items-start gap-2">
                  <CheckIcon className="mt-0.5 h-4 w-4" />
                  Limited agent requests
                </li>
                <li className="flex items-start gap-2">
                  <CheckIcon className="mt-0.5 h-4 w-4" />
                  AI usage cap: ${getCreditLimitCents("free") / 100}
                </li>
              </ul>
              {isOnFreePlan ? (
                <Button className="mt-auto w-full rounded-full" size="lg" variant="outline" disabled>
                  Current plan
                </Button>
              ) : session?.user ? (
                <Button className="mt-auto w-full rounded-full" size="lg" variant="outline" disabled>
                  Hobby
                </Button>
              ) : (
                <Button asChild className="mt-auto w-full rounded-full" size="lg" variant="outline">
                  <Link href="/register">Sign up</Link>
                </Button>
              )}
            </section>

            {paidPlans.map((plan, index) => (
              <section
                className="flex min-h-[430px] flex-col border-b lg:border-b-0 lg:border-r border-neutral-200 p-7 last:border-r-0 dark:border-neutral-800"
                key={plan.productId}
              >
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-semibold">{plan.name}</h2>
                  {plan.isRecommended ? (
                    <span className="text-xs font-semibold text-amber-500">Recommended</span>
                  ) : null}
                </div>
                <p className="mt-1 text-3xl font-bold">{plan.recurringPrice}</p>
                <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-400">
                  {index === 0 ? "Everything in Hobby, plus:" : "Everything in Pro, plus:"}
                </p>
                <ul className="mt-5 space-y-2.5 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckIcon className="mt-0.5 h-4 w-4" />
                    Extended limits on AI models
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckIcon className="mt-0.5 h-4 w-4" />
                    Priority access to new features
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckIcon className="mt-0.5 h-4 w-4" />
                    AI usage cap: ${plan.creditCap / 100}
                  </li>
                </ul>
                <div className="mt-auto pt-7">
                  {plan.isCurrentPlan ? (
                    <Button className="w-full rounded-full" size="lg" variant="outline" disabled>
                      Current plan
                    </Button>
                  ) : (
                    <CheckoutButton
                      label={session?.user ? `Get ${plan.name}` : "Login to subscribe"}
                      productId={plan.productId}
                    />
                  )}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}