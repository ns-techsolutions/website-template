import type { PaymentProvider } from "./provider";
import { noneProvider } from "./providers/none";
import { stripeProvider } from "./providers/stripe";

const PROVIDERS: Record<string, PaymentProvider> = {
  none: noneProvider,
  stripe: stripeProvider,
};

/** Resolve a provider adapter by id; unknown ids fall back to pay-at-salon. */
export function getPaymentProvider(id: string): PaymentProvider {
  return PROVIDERS[id] ?? noneProvider;
}
