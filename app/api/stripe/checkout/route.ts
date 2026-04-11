import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/(auth)/auth";
import { ensureStripeCustomerForUser, getRecurringPriceForProduct } from "@/lib/stripe/billing";
import { getStripe } from "@/lib/stripe/server";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stripe = getStripe();
    const body = (await request.json().catch(() => ({}))) as { productId?: string };
    const productId = body.productId ?? process.env.STRIPE_PRODUCT_ID;

    if (!productId) {
      return NextResponse.json({ error: "Missing product id" }, { status: 400 });
    }

    const price = await getRecurringPriceForProduct(stripe, productId);
    const customerId = await ensureStripeCustomerForUser(session.user.id);
    const origin = new URL(request.url).origin;

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: price.id, quantity: 1 }],
      client_reference_id: session.user.id,
      allow_promotion_codes: true,
      metadata: {
        userId: session.user.id,
        productId,
      },
      success_url: `${origin}/?checkout=success`,
      cancel_url: `${origin}/pricing?checkout=cancelled`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Stripe checkout session error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
