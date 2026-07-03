import { NotFoundError } from "@/lib/api/errors";
import { getTenantDb } from "@/lib/db/tenant";
import { appointmentInstant } from "@/lib/booking/time";
import { getPaymentProvider } from "@/lib/payments/registry";
import { integrationSettingsService } from "@/features/admin/integrations/services/integration-settings.service";

import { bookingRepository } from "../repositories/booking.repository";
import { paymentRepository } from "../repositories/payment.repository";

export type RefundSkippedReason =
  | "no_payment" // nothing was paid online
  | "already_refunded"
  | "window" // cancelled too late to qualify for a refund
  | "provider_unconfigured";

export interface RefundOutcome {
  refunded: boolean;
  /** Whole currency units refunded (only when `refunded`). */
  amount?: number;
  /** Currency of the refunded payment, e.g. "gbp" (only when `refunded`). */
  currency?: string;
  reason?: RefundSkippedReason;
}

/**
 * Refunds a booking's paid deposit in full and flips the Payment to `refunded`.
 * Idempotent and a graceful no-op when there's nothing to refund. Honors the
 * salon's cancellation window unless `force` is set (admin override).
 */
export async function refundBookingDeposit(
  bookingId: string,
  opts: { force?: boolean } = {},
): Promise<RefundOutcome> {
  const force = opts.force ?? false;

  const booking = await bookingRepository.findById(bookingId);
  if (!booking) throw new NotFoundError("Booking not found.");

  const payments = await paymentRepository.findByBookingId(bookingId);
  const paid = payments.find((p) => p.status === "paid");
  if (!paid) {
    const already = payments.some((p) => p.status === "refunded");
    return { refunded: false, reason: already ? "already_refunded" : "no_payment" };
  }

  const db = await getTenantDb();
  const settings = await db.salonSettings.findFirst({
    select: { cancellationCutoffHours: true, timezone: true },
  });

  // Window policy — skipped for an admin force-refund.
  if (!force) {
    const cutoffHours = settings?.cancellationCutoffHours ?? 24;
    const timezone = settings?.timezone ?? "Europe/London";
    const startsAt = appointmentInstant(
      booking.date.toISOString().slice(0, 10),
      booking.time,
      timezone,
    );
    const eligible =
      startsAt !== null &&
      Date.now() <= startsAt.getTime() - cutoffHours * 60 * 60 * 1000;
    if (!eligible) return { refunded: false, reason: "window" };
  }

  const resolved = await integrationSettingsService.getResolved(paid.workspaceId);
  if (
    resolved.paymentProvider === "none" ||
    !resolved.stripeSecretKey ||
    !paid.providerRef
  ) {
    return { refunded: false, reason: "provider_unconfigured" };
  }

  const provider = getPaymentProvider(resolved.paymentProvider);
  const refund = await provider.createRefund(
    { providerRef: paid.providerRef }, // full refund — omit amount
    { secretKey: resolved.stripeSecretKey },
  );

  await paymentRepository.markRefunded(paid.id, refund.providerRef);
  return { refunded: true, amount: paid.amount, currency: paid.currency };
}
