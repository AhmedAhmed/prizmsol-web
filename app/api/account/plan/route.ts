import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getUserById, updateUserPlanAndSubscription } from "@/lib/db/queries";
import { getPlanByProductId } from "@/lib/stripe/billing";
import { getStripe } from "@/lib/stripe/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const session = await auth.api.getSession({
      headers: await headers() // you need to pass the headers object.
  })
  if (!session?.user?.id) {
    return NextResponse.json({ plan: "free" }, { status: 401 });
  }

  const selectedUser = await getUserById(session.user.id);
  if (!selectedUser) {
    return NextResponse.json({ plan: "free" }, { status: 404 });
  }

  try {
    const stripe = getStripe();
    let subscription: Stripe.Subscription | null = null;

    if (selectedUser.stripeSubscriptionId) {
      subscription = await stripe.subscriptions.retrieve(selectedUser.stripeSubscriptionId);
    } else if (selectedUser.stripeCustomerId) {
      const subscriptions = await stripe.subscriptions.list({
        customer: selectedUser.stripeCustomerId,
        status: "all",
        limit: 10,
      });
      subscription =
        subscriptions.data.find((item) =>
          ["active", "trialing", "past_due"].includes(item.status)
        ) ?? null;
    }

    if (!subscription) {
      if (selectedUser.plan !== "free") {
        await updateUserPlanAndSubscription({
          userId: selectedUser.id,
          plan: "free",
          stripeSubscriptionId: null,
          stripeProductId: null,
          billingPeriodStart: null,
          billingPeriodEnd: null,
          resetCredits: true,
        });
      }
    return NextResponse.json(
      { plan: "free" },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
    );
    }

    const activeStatuses = new Set(["active", "trialing", "past_due"]);
    if (!activeStatuses.has(subscription.status)) {
      await updateUserPlanAndSubscription({
        userId: selectedUser.id,
        plan: "free",
        stripeSubscriptionId: null,
        stripeProductId: null,
        billingPeriodStart: null,
        billingPeriodEnd: null,
        resetCredits: true,
      });
      return NextResponse.json(
        { plan: "free" },
        { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
      );
    }

    const productId =
      typeof subscription.items.data[0]?.price?.product === "string"
        ? subscription.items.data[0].price.product
        : null;
    const mappedPlan = getPlanByProductId(productId);
    const plan = mappedPlan === "free" ? "pro" : mappedPlan;

    await updateUserPlanAndSubscription({
      userId: selectedUser.id,
      plan,
      stripeSubscriptionId: subscription.id,
      stripeProductId: productId,
      billingPeriodStart: new Date(subscription.current_period_start * 1000),
      billingPeriodEnd: new Date(subscription.current_period_end * 1000),
      resetCredits: false,
    });

    return NextResponse.json(
      { plan },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
    );
  } catch (_error) {
    return NextResponse.json(
      { plan: selectedUser.plan ?? "free" },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
    );
  }
}
