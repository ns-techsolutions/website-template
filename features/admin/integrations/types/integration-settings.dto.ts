import type { GatewayOption } from "@/lib/payments/gateways";

// Masked view for the admin Integrations tab — booleans + non-secret fields
// only. Decrypted secrets NEVER cross the wire (see ResolvedIntegrationSettings
// for server-side use).
export interface IntegrationSettingsDto {
  emailEnabled: boolean;
  emailFrom: string;
  emailReplyTo: string;
  hasResendKey: boolean;
  paymentProvider: string; // "none" | "stripe" | …
  stripePublishableKey: string; // publishable is not a secret
  hasStripeSecretKey: boolean;
  hasStripeWebhookSecret: boolean;
  /** Gateways the master admin has enabled — the dropdown options. */
  availableGateways: GatewayOption[];
}

// Server-only: decrypted secrets resolved for the email/payment layers. Never
// returned by an API route.
export interface ResolvedIntegrationSettings {
  emailEnabled: boolean;
  resendApiKey: string | null;
  emailFrom: string | null;
  emailReplyTo: string | null;
  paymentProvider: string;
  stripeSecretKey: string | null;
  stripePublishableKey: string | null;
  stripeWebhookSecret: string | null;
}
