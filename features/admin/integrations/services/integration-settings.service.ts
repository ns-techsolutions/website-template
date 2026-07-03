import type { Prisma } from "@prisma/client";

import { BadRequestError } from "@/lib/api/errors";
import { decryptSecret, encryptSecret } from "@/lib/crypto/secret";
import { isGatewayEnabled, listEnabledGateways } from "@/lib/payments/gateways";

import { integrationSettingsRepository } from "../repositories/integration-settings.repository";
import type {
  IntegrationSettingsDto,
  ResolvedIntegrationSettings,
} from "../types/integration-settings.dto";
import { updateIntegrationSettingsSchema } from "../validations/integration-settings.schema";

function safeDecrypt(value: string | null): string | null {
  if (!value) return null;
  try {
    return decryptSecret(value);
  } catch {
    return null;
  }
}

export const integrationSettingsService = {
  /** Masked DTO for the admin UI — never exposes a decrypted secret. */
  async getMasked(workspaceId: string): Promise<IntegrationSettingsDto> {
    const [row, availableGateways] = await Promise.all([
      integrationSettingsRepository.get(workspaceId),
      listEnabledGateways(),
    ]);
    return {
      emailEnabled: row?.emailEnabled ?? false,
      emailFrom: row?.emailFrom ?? "",
      emailReplyTo: row?.emailReplyTo ?? "",
      hasResendKey: !!row?.resendApiKeyEnc,
      paymentProvider: row?.paymentProvider ?? "none",
      stripePublishableKey: row?.stripePublishableKey ?? "",
      hasStripeSecretKey: !!row?.stripeSecretKeyEnc,
      hasStripeWebhookSecret: !!row?.stripeWebhookSecretEnc,
      availableGateways,
    };
  },

  async update(workspaceId: string, raw: unknown): Promise<IntegrationSettingsDto> {
    const input = updateIntegrationSettingsSchema.parse(raw);
    const data: Prisma.IntegrationSettingsUncheckedUpdateInput = {};

    if (input.emailEnabled !== undefined) data.emailEnabled = input.emailEnabled;
    if (input.emailFrom !== undefined) data.emailFrom = input.emailFrom || null;
    if (input.emailReplyTo !== undefined) data.emailReplyTo = input.emailReplyTo || null;
    if (input.resendApiKey) data.resendApiKeyEnc = encryptSecret(input.resendApiKey);

    if (input.paymentProvider !== undefined) {
      if (!(await isGatewayEnabled(input.paymentProvider))) {
        throw new BadRequestError("That payment gateway is not available.");
      }
      data.paymentProvider = input.paymentProvider;
    }
    if (input.stripePublishableKey !== undefined) {
      data.stripePublishableKey = input.stripePublishableKey || null;
    }
    if (input.stripeSecretKey) data.stripeSecretKeyEnc = encryptSecret(input.stripeSecretKey);
    if (input.stripeWebhookSecret) {
      data.stripeWebhookSecretEnc = encryptSecret(input.stripeWebhookSecret);
    }

    await integrationSettingsRepository.upsert(workspaceId, data);
    return this.getMasked(workspaceId);
  },

  /** Server-only: decrypted secrets for the email/payment layers. */
  async getResolved(workspaceId: string): Promise<ResolvedIntegrationSettings> {
    const row = await integrationSettingsRepository.get(workspaceId);
    return {
      emailEnabled: row?.emailEnabled ?? false,
      resendApiKey: safeDecrypt(row?.resendApiKeyEnc ?? null),
      emailFrom: row?.emailFrom ?? null,
      emailReplyTo: row?.emailReplyTo ?? null,
      paymentProvider: row?.paymentProvider ?? "none",
      stripeSecretKey: safeDecrypt(row?.stripeSecretKeyEnc ?? null),
      stripePublishableKey: row?.stripePublishableKey ?? null,
      stripeWebhookSecret: safeDecrypt(row?.stripeWebhookSecretEnc ?? null),
    };
  },
};
