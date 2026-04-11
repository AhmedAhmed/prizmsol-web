import "server-only";
import Stripe from "stripe";
import {
  getUserById,
  getUserByStripeCustomerId,
  updateUserPlanAndSubscription,
  updateUserStripeCustomerId,
} from "@/lib/db/queries";
import { getStripe } from "@/lib/stripe/server";

export type BillingPlan = "free" | "pro" | "plus";

const FREE_CREDIT_LIMIT_CENTS = Number(process.env.FREE_AI_CREDIT_LIMIT_CENTS ?? 100);
const PRO_CREDIT_LIMIT_CENTS = Number(process.env.PRO_AI_CREDIT_LIMIT_CENTS ?? 20000);
const PLUS_CREDIT_LIMIT_CENTS = Number(process.env.PLUS_AI_CREDIT_LIMIT_CENTS ?? 1500);

export function getCreditLimitCents(plan: BillingPlan) {
  if (plan === "plus") return PLUS_CREDIT_LIMIT_CENTS;
  if (plan === "pro") return PRO_CREDIT_LIMIT_CENTS;
  return FREE_CREDIT_LIMIT_CENTS;
}

export function getCurrentUsageWindow(user: {
  billingPeriodStart?: Date | null;
  billingPeriodEnd?: Date | null;
}) {
  const now = new Date();

  if (user.billingPeriodStart) {
    const from = new Date(user.billingPeriodStart);
    const periodEnd = user.billingPeriodEnd
      ? new Date(user.billingPeriodEnd)
      : new Date(from.getFullYear(), from.getMonth() + 1, from.getDate());
    const to = now < periodEnd ? now : periodEnd;
    return { from, to };
  }

  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const to = now < periodEnd ? now : periodEnd;
  return { from, to };
}

export function getPlanByProductId(productId: string | null | undefined): BillingPlan {
  if (!productId) return "free";
  const plusProductId = process.env.STRIPE_PLUS_PRODUCT_ID;
  const proProductId = process.env.STRIPE_PRO_PRODUCT_ID ?? process.env.STRIPE_PRODUCT_ID;
  if (plusProductId && productId === plusProductId) return "plus";
  if (proProductId && productId === proProductId) return "pro";
  return "free";
}

export function getConfiguredSubscriptionProductIds() {
  const productIds = process.env.STRIPE_PRODUCT_IDS
    ? process.env.STRIPE_PRODUCT_IDS.split(",").map((item) => item.trim()).filter(Boolean)
    : [];

  if (productIds.length > 0) return productIds;

  const fromVars = [
    process.env.STRIPE_PRO_PRODUCT_ID ?? process.env.STRIPE_PRODUCT_ID,
    process.env.STRIPE_PLUS_PRODUCT_ID,
  ].filter(Boolean) as string[];

  if (fromVars.length > 0) {
    return Array.from(new Set(fromVars));
  }

  if (!process.env.STRIPE_PRODUCT_ID) {
    throw new Error("Missing STRIPE_PRODUCT_ID or STRIPE_PRODUCT_IDS environment variable");
  }
  return [process.env.STRIPE_PRODUCT_ID];
}

export async function getRecurringPriceForProduct(stripe: Stripe, productId: string) {
  const prices = await stripe.prices.list({
    product: productId,
    active: true,
    type: "recurring",
    limit: 10,
  });

  const [firstRecurringPrice] = prices.data;
  if (!firstRecurringPrice) {
    throw new Error(`No active recurring price found for product ${productId}`);
  }
  return firstRecurringPrice;
}

export async function ensureStripeCustomerForUser(userId: string) {
  const stripe = getStripe();
  const selectedUser = await getUserById(userId);
  if (!selectedUser) {
    throw new Error("User not found");
  }

  if (selectedUser.stripeCustomerId) {
    return selectedUser.stripeCustomerId;
  }

  const customer = await stripe.customers.create({
    email: selectedUser.email,
    name: selectedUser.name ?? undefined,
    metadata: { userId: selectedUser.id },
  });

  await updateUserStripeCustomerId({
    userId: selectedUser.id,
    stripeCustomerId: customer.id,
  });

  return customer.id;
}

export async function syncUserFromStripeSubscription({
  stripeCustomerId,
  subscription,
}: {
  stripeCustomerId: string;
  subscription: Stripe.Subscription;
}) {
  const selectedUser = await getUserByStripeCustomerId(stripeCustomerId);
  if (!selectedUser) return;

  const item = subscription.items.data[0];
  const productId =
    typeof item?.price?.product === "string" ? item.price.product : null;
  const plan = getPlanByProductId(productId);

  await updateUserPlanAndSubscription({
    userId: selectedUser.id,
    plan,
    stripeSubscriptionId: subscription.id,
    stripeProductId: productId,
    billingPeriodStart: new Date(subscription.current_period_start * 1000),
    billingPeriodEnd: new Date(subscription.current_period_end * 1000),
    resetCredits: true,
  });
}

export async function downgradeUserFromStripeCustomer(
  stripeCustomerId: string,
  options: { resetCredits: boolean } = { resetCredits: false }
) {
  const user = await getUserByStripeCustomerId(stripeCustomerId);
  if (!user) return;

  await updateUserPlanAndSubscription({
    userId: user.id,
    plan: "free",
    stripeSubscriptionId: null,
    stripeProductId: null,
    billingPeriodStart: null,
    billingPeriodEnd: null,
    resetCredits: options.resetCredits,
  });
}

export async function reconcileUserPlanStatus(userId: string) {
  const selectedUser = await getUserById(userId);
  if (!selectedUser) return null;

  const now = new Date();
  const periodEnded =
    selectedUser.billingPeriodEnd ? now > new Date(selectedUser.billingPeriodEnd) : false;

  const stripe = getStripe();
  let subscription: Stripe.Subscription | null = null;

  try {
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
    } else if (selectedUser.email) {
      const customers = await stripe.customers.list({
        email: selectedUser.email,
        limit: 1,
      });
      const customer = customers.data[0];
      if (customer?.id) {
        await updateUserStripeCustomerId({
          userId: selectedUser.id,
          stripeCustomerId: customer.id,
        });
        const subscriptions = await stripe.subscriptions.list({
          customer: customer.id,
          status: "all",
          limit: 10,
        });
        subscription =
          subscriptions.data.find((item) =>
            ["active", "trialing", "past_due"].includes(item.status)
          ) ?? null;
      }
    }
  } catch (_error) {
    subscription = null;
  }

  // No valid active Stripe subscription: downgrade after period end (or immediately for stale paid rows).
  if (!subscription) {
    if (selectedUser.plan !== "free" && (periodEnded || !selectedUser.billingPeriodEnd)) {
      await updateUserPlanAndSubscription({
        userId: selectedUser.id,
        plan: "free",
        stripeSubscriptionId: null,
        stripeProductId: null,
        billingPeriodStart: null,
        billingPeriodEnd: null,
        resetCredits: true,
      });
      return { ...selectedUser, plan: "free" as BillingPlan };
    }
    return selectedUser;
  }

  const activeStatuses: Stripe.Subscription.Status[] = [
    "active",
    "trialing",
    "past_due",
  ];

  if (!activeStatuses.includes(subscription.status)) {
    await updateUserPlanAndSubscription({
      userId: selectedUser.id,
      plan: "free",
      stripeSubscriptionId: null,
      stripeProductId: null,
      billingPeriodStart: null,
      billingPeriodEnd: null,
      resetCredits: true,
    });
    return { ...selectedUser, plan: "free" as BillingPlan };
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

  return {
    ...selectedUser,
    plan,
    stripeSubscriptionId: subscription.id,
    stripeProductId: productId,
    billingPeriodStart: new Date(subscription.current_period_start * 1000),
    billingPeriodEnd: new Date(subscription.current_period_end * 1000),
  };
}
