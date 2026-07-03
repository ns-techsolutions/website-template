import Stripe from "stripe";

import type { PaymentProvider } from "../provider";

// Stripe Checkout adapter, keyed by the salon's own secret key. The tenant slug
// is stored in session metadata so the webhook can resolve the salon.
export const stripeProvider: PaymentProvider = {
  id: "stripe",

  async createCheckout(input, ctx) {
    const stripe = new Stripe(ctx.secretKey);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: input.currency,
            product_data: { name: `Deposit — ${input.serviceName}` },
            // Stripe expects the smallest currency unit (e.g. pence).
            unit_amount: Math.round(input.amount * 100),
          },
        },
      ],
      customer_email: input.customerEmail || undefined,
      success_url: ctx.successUrl,
      cancel_url: ctx.cancelUrl,
      metadata: {
        tenant: ctx.tenantSlug,
        bookingReference: input.bookingReference,
      },
    });
    return { url: session.url, providerRef: session.id };
  },

  async verifyAndParseWebhook(rawBody, signature, webhookSecret, secretKey) {
    const stripe = new Stripe(secretKey);
    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      return { type: "paid", providerRef: session.id };
    }
    return { type: "ignored" };
  },

  async createRefund(input, ctx) {
    const stripe = new Stripe(ctx.secretKey);
    // `providerRef` is the Checkout Session id — resolve its PaymentIntent to refund.
    const session = await stripe.checkout.sessions.retrieve(input.providerRef);
    const paymentIntent =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id;
    if (!paymentIntent) {
      throw new Error("No payment intent on the checkout session to refund.");
    }
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntent,
      // Stripe expects the smallest currency unit (e.g. pence); omit for a full refund.
      ...(input.amount ? { amount: Math.round(input.amount * 100) } : {}),
    });
    return { providerRef: refund.id };
  },
};
