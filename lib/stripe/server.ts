import "server-only";
import Stripe from "stripe";

let stripeClient: Stripe | null = null;

function getStripeSecretKey() {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY environment variable");
  }

  return stripeSecretKey;
}

export function getStripe() {
  if (stripeClient) {
    return stripeClient;
  }

  stripeClient = new Stripe(getStripeSecretKey());
  return stripeClient;
}

export function getDefaultSubscriptionPriceId() {
  const priceId = process.env.STRIPE_PRICE_ID;

  if (!priceId) {
    throw new Error("Missing STRIPE_PRICE_ID environment variable");
  }

  return priceId;
}

export async function getSubscriptionPriceId(stripe: Stripe) {
  const directPriceId = process.env.STRIPE_PRICE_ID;
  if (directPriceId) {
    return directPriceId;
  }

  const productId = process.env.STRIPE_PRODUCT_ID;
  if (!productId) {
    throw new Error(
      "Missing STRIPE_PRODUCT_ID environment variable (or set STRIPE_PRICE_ID)"
    );
  }

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

  return firstRecurringPrice.id;
}
