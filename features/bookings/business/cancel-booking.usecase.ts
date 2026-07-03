import { ConflictError, NotFoundError } from "@/lib/api/errors";
import type { AuthUser } from "@/lib/auth/get-auth-user";
import { sendBookingStatusUpdate } from "@/lib/mail";

import { toBookingView } from "../mappers/booking.mapper";
import { bookingRepository } from "../repositories/booking.repository";
import type { BookingView } from "../types/booking.view";
import { assertBookingOwnership } from "./validate-booking";
import {
  refundBookingDeposit,
  type RefundOutcome,
} from "./refund-booking.usecase";

// Enum values a customer may still cancel (mirrors CANCELLABLE_STATUSES, which is
// expressed in the view vocabulary).
const CANCELLABLE_ENUM = new Set(["pending", "confirmed"]);

export async function cancelBookingUseCase(
  id: string,
  user: AuthUser,
): Promise<BookingView> {
  const booking = await bookingRepository.findById(id);
  if (!booking) throw new NotFoundError("Booking not found.");

  assertBookingOwnership(booking, user);

  if (!CANCELLABLE_ENUM.has(booking.status)) {
    throw new ConflictError("This booking can no longer be cancelled.");
  }

  const updated = await bookingRepository.update(id, { status: "cancelled" });

  // Auto-refund the deposit in full when within the salon's cancellation window.
  // Best-effort: a payment-gateway hiccup must not fault the cancellation itself
  // (an admin can still force-refund later).
  let refund: RefundOutcome = { refunded: false };
  try {
    refund = await refundBookingDeposit(id, { force: false });
  } catch (e) {
    console.error("[cancel] auto-refund failed:", e);
  }

  // Notify the customer (admin cancellations email separately). Fire-and-forget —
  // a failed email must never fault the cancellation.
  void sendBookingStatusUpdate(
    {
      email: updated.email,
      customerName: updated.customerName,
      reference: updated.reference,
      service: updated.service,
      date: updated.date,
    },
    "cancelled",
    refund.refunded
      ? { refundedAmount: refund.amount, currency: refund.currency }
      : undefined,
  );

  return toBookingView(updated);
}
