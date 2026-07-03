import { z } from "zod";

// Secrets (resendApiKey, stripeSecretKey, stripeWebhookSecret) arrive as
// plaintext and are only persisted (encrypted) when a non-empty value is sent.
export const updateIntegrationSettingsSchema = z
  .object({
    emailEnabled: z.boolean().optional(),
    emailFrom: z.string().trim().optional(),
    emailReplyTo: z.string().trim().optional(),
    resendApiKey: z.string().trim().optional(),
    paymentProvider: z.string().trim().optional(),
    stripePublishableKey: z.string().trim().optional(),
    stripeSecretKey: z.string().trim().optional(),
    stripeWebhookSecret: z.string().trim().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "No fields to update" });

export type UpdateIntegrationSettingsInput = z.infer<
  typeof updateIntegrationSettingsSchema
>;
