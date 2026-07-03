// A pluggable payment-provider adapter. Add a gateway by implementing this and
// registering it in registry.ts + the control-plane PaymentGateway table.

export interface CheckoutContext {
  secretKey: string;
  successUrl: string;
  cancelUrl: string;
  tenantSlug: string;
}

export interface CheckoutInput {
  amount: number; // whole currency units (e.g. pounds)
  currency: string;
  bookingReference: string;
  customerEmail: string;
  serviceName: string;
}

export interface CheckoutResult {
  /** Hosted checkout URL, or null when no online payment is required. */
  url: string | null;
  /** Provider-side id (e.g. Stripe session id) to reconcile via webhook. */
  providerRef?: string;
}

export interface WebhookResult {
  type: "paid" | "ignored";
  /** Matches the Payment.providerRef recorded at checkout. */
  providerRef?: string;
}

export interface RefundContext {
  secretKey: string;
}

export interface RefundInput {
  /** The Payment.providerRef recorded at checkout (e.g. Stripe session id). */
  providerRef: string;
  /** Whole currency units to refund; omit for a full refund. */
  amount?: number;
}

export interface RefundResult {
  /** Provider-side refund id, stored on the Payment for audit. */
  providerRef: string;
}

export interface PaymentProvider {
  id: string;
  /** Returns `{ url: null }` when the provider takes no online payment. */
  createCheckout(input: CheckoutInput, ctx: CheckoutContext): Promise<CheckoutResult>;
  verifyAndParseWebhook(
    rawBody: string,
    signature: string,
    webhookSecret: string,
    secretKey: string,
  ): Promise<WebhookResult>;
  /** Refunds a previously-captured payment. */
  createRefund(input: RefundInput, ctx: RefundContext): Promise<RefundResult>;
}
