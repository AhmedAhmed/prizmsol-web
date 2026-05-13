import { CheckIcon } from "lucide-react";

import { CheckoutButton } from "@/components/billing/checkout-button";
import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import {
  BillingPlan,
  getConfiguredSubscriptionProductIds,
  getCreditLimitCents,
  getPlanByProductId,
  getRecurringPriceForProduct,
} from "@/lib/stripe/billing";
import { getStripe } from "@/lib/stripe/server";
import { headers } from "next/headers";
import Link from "next/link";

function formatPlanPrice(amount: number | null, interval: string | null) {
  if (amount === null || !interval) {
    return "Custom";
  }

  return `$${(amount / 100).toFixed(0)}/${interval}`;
}

// Plan hierarchy: free < pro < plus
// Returns true if lhs is a strictly lower tier than rhs
function isLowerPlan(lhs: BillingPlan, rhs: BillingPlan): boolean {
  const order: Record<BillingPlan, number> = { free: 0, pro: 1, plus: 2 };
  return order[lhs] < order[rhs];
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
  let currentPlan: BillingPlan | null = null;
  if (session?.user) {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/account/plan`, {
        headers: requestHeaders,
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        currentPlan = (data.plan as BillingPlan) ?? null;
      }
    } catch {
      // If the request fails, fall back to showing no active plan
    }
  }

  const isOnFreePlan = session?.user && currentPlan === "free";
  const isPaidUser =
    session?.user && currentPlan !== null && currentPlan !== "free";

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
        recurringPrice: formatPlanPrice(
          price.unit_amount,
          price.recurring?.interval ?? null
        ),
        creditCap,
        isRecommended: product.name.toLowerCase().includes("plus"),
        // Match the plan key returned by the API against the plan identifier
        isCurrentPlan: currentPlan === plan,
        plan,
      };
    })
  );

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 pb-12 pt-5">
      <div className="mb-6 w-full">
        <Link
          href="/plans"
          className="inline-flex items-center gap-1 text-sm transition-colors"
        >
          <Logo className="h-[24px]" />
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
        <div className="w-full max-w-7xl overflow-x-auto rounded-2xl border border-neutral-200 bg-neutral-50 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="grid grid-cols-1 lg:grid-cols-3">
            <section className="flex min-h-[430px] flex-col border-b p-7 dark:border-neutral-800 lg:border-b-0 lg:border-r border-neutral-200">
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
                  ${getCreditLimitCents("free") / 100} of usage included
                </li>
              </ul>
              {isOnFreePlan ? (
                <Button
                  className="mt-auto w-full rounded-full"
                  size="lg"
                  variant="outline"
                  disabled
                >
                  Current plan
                </Button>
              ) : isPaidUser ? (
                <form
                  action="/api/stripe/subscription/cancel"
                  method="POST"
                  className="mt-auto"
                >
                  <Button
                    className="w-full rounded-full cursor-pointer"
                    size="lg"
                    variant="outline"
                    type="submit"
                  >
                    Cancel Subscription
                  </Button>
                </form>
              ) : (
                <Button
                  asChild
                  className="mt-auto w-full rounded-full cursor-pointer"
                  size="lg"
                  variant="outline"
                >
                  <Link href="/register">Sign up</Link>
                </Button>
              )}
            </section>

            {paidPlans.map((plan, index) => (
              <section
                className="flex min-h-[430px] flex-col border-b p-7 dark:border-neutral-800 last:border-r-0 lg:border-b-0 lg:border-r border-neutral-200"
                key={plan.productId}
              >
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-semibold">{plan.name}</h2>
                  {plan.isRecommended ? (
                    <span className="text-xs font-semibold text-amber-500">
                      Recommended
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-3xl font-bold">
                  {plan.recurringPrice}
                </p>
                <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-400">
                  {index === 0
                    ? "Everything in Hobby, plus:"
                    : "Everything in Pro, plus:"}
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
                    Higher usage limits
                  </li>
                </ul>
                <div className="mt-auto pt-7">
                  {plan.isCurrentPlan ? (
                    <Button
                      className="w-full rounded-full"
                      size="lg"
                      variant="outline"
                      disabled
                    >
                      Current plan
                    </Button>
                  ) : // If user is on a higher paid plan, block purchase of lower plans
                    currentPlan &&
                      isLowerPlan(plan.plan, currentPlan) ? (
                      <Button
                        className="w-full rounded-full"
                        size="lg"
                        variant="outline"
                        disabled
                      >
                        Not available
                      </Button>
                    ) : (
                      <CheckoutButton
                        label={`Get ${plan.name}`}
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
