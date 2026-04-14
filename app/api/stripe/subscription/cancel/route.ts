import { NextResponse } from "next/server";
import { getUserById, updateUserPlanAndSubscription } from "@/lib/db/queries";
import { getStripe } from "@/lib/stripe/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST() {
  const session = await auth.api.getSession({
      headers: await headers() // you need to pass the headers object.
  })
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await getUserById(session.user.id);
  if (!user?.stripeSubscriptionId) {
    return NextResponse.json({ error: "No active subscription" }, { status: 400 });
  }

  try {
    const stripe = getStripe();

    // Schedule cancellation at period end instead of canceling immediately
    const subscription = await stripe.subscriptions.update(user.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    // Keep the user on their current plan — just flag that it's canceling.
    // Credits are NOT reset here; that happens at period end via webhook.
    await updateUserPlanAndSubscription({
      userId: user.id,
      plan: user.plan,                          // keep existing plan
      stripeSubscriptionId: user.stripeSubscriptionId,
      stripeProductId: user.stripeProductId,
      billingPeriodStart: user.billingPeriodStart,
      billingPeriodEnd: new Date(subscription.current_period_end * 1000),
      resetCredits: false,                      // no reset yet
    });

    return NextResponse.json({
      success: true,
      message: "Subscription will cancel at end of billing period",
      cancelAt: new Date(subscription.current_period_end * 1000),
    });
  } catch (error) {
    console.error("Failed to cancel subscription", error);
    return NextResponse.json({ error: "Failed to cancel subscription" }, { status: 500 });
  }
}