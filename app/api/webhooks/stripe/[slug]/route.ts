import type { NextRequest } from "next/server";
import { PaymentStatus } from "@prisma/client";

import { controlDb } from "@/lib/db/control";
import { decryptSecret } from "@/lib/crypto/secret";
import { runWithTenantDb } from "@/lib/db/tenant-client";
import { getTenantDb } from "@/lib/db/tenant";
import { integrationSettingsService } from "@/features/admin/integrations/services/integration-settings.service";
import { paymentRepository } from "@/features/bookings/repositories/payment.repository";
import { bookingRepository } from "@/features/bookings/repositories/booking.repository";
import { stripeProvider } from "@/lib/payments/providers/stripe";

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ slug: string }> },
) {
  const { slug } = await ctx.params;

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return jsonResponse({ error: "Missing stripe-signature header" }, 400);
  }

  // Read raw body before any parsing — Stripe signature verification requires it.
  const rawBody = await req.text();

  const tenant = await controlDb.tenant.findUnique({
    where: { slug },
    select: { databaseUrl: true, status: true },
  });
  if (!tenant || tenant.status !== "active") {
    return jsonResponse({ error: "Unknown salon" }, 404);
  }

  const databaseUrl = decryptSecret(tenant.databaseUrl);

  try {
    await runWithTenantDb(databaseUrl, async () => {
      const db = await getTenantDb();

      const workspace = await db.workspace.findFirst({ select: { id: true } });
      if (!workspace) return;

      const settings = await integrationSettingsService.getResolved(workspace.id);
      if (!settings.stripeWebhookSecret || !settings.stripeSecretKey) return;

      const result = await stripeProvider.verifyAndParseWebhook(
        rawBody,
        signature,
        settings.stripeWebhookSecret,
        settings.stripeSecretKey,
      );

      if (result.type !== "paid" || !result.providerRef) return;

      const payment = await paymentRepository.findByProviderRef(result.providerRef);
      if (!payment) return;

      // Stripe delivers webhooks at-least-once and retries on any non-2xx or
      // timeout. Only a still-pending payment should be confirmed here — otherwise
      // a redelivery after a refund/cancellation would flip the payment back to
      // paid and re-confirm a cancelled booking. Idempotency guard:
      if (payment.status !== PaymentStatus.pending) return;

      await paymentRepository.updateStatus(payment.id, PaymentStatus.paid);
      await bookingRepository.update(payment.bookingId, { status: "confirmed" });
    });
  } catch (error) {
    if (error instanceof Error && /signature/i.test(error.message)) {
      return jsonResponse({ error: "Webhook signature verification failed" }, 400);
    }
    console.error("[webhook/stripe]", error);
  }

  return jsonResponse({ received: true }, 200);
}
