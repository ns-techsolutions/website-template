import type { PaymentProvider } from "../provider";

// "Pay at salon" — no online payment. Bookings proceed without a checkout.
export const noneProvider: PaymentProvider = {
  id: "none",
  async createCheckout() {
    return { url: null };
  },
  async verifyAndParseWebhook() {
    return { type: "ignored" };
  },
  async createRefund() {
    // No online payment was taken, so there is nothing to refund.
    throw new Error("This salon does not take online payments.");
  },
};
