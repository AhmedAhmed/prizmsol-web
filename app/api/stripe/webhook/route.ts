import Stripe from "stripe";
import { NextResponse } from "next/server";
import {
  downgradeUserFromStripeCustomer,
  syncUserFromStripeSubscription,
} from "@/lib/stripe/billing";
import { getStripe } from "@/lib/stripe/server";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Missing Stripe webhook secret/signature" }, { status: 400 });
  }

  const rawBody = await request.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    console.error("Stripe webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const checkoutSession = event.data.object as Stripe.Checkout.Session;
      if (checkoutSession.subscription && checkoutSession.customer) {
        const subscription = await stripe.subscriptions.retrieve(
          checkoutSession.subscription as string
        );
        await syncUserFromStripeSubscription({
          stripeCustomerId: checkoutSession.customer as string,
          subscription,
        });
      }
    }

    if (event.type === "customer.subscription.updated") {
      const subscription = event.data.object as Stripe.Subscription;
      if (subscription.customer) {
        await syncUserFromStripeSubscription({
          stripeCustomerId: subscription.customer as string,
          subscription,
        });
      }
    }

    // Billing period has ended — downgrade and reset credits
    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      if (subscription.customer) {
        await downgradeUserFromStripeCustomer(subscription.customer as string, {
          resetCredits: true,
        });
      }
    }

    // Paused is not a true cancellation — downgrade access but preserve credits
    if (event.type === "customer.subscription.paused") {
      const subscription = event.data.object as Stripe.Subscription;
      if (subscription.customer) {
        await downgradeUserFromStripeCustomer(subscription.customer as string, {
          resetCredits: false,
        });
      }
    }
  } catch (error) {
    console.error("Stripe webhook processing error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}