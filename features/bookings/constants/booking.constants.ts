import type { BookingStatusView } from "../types/booking.view";

export const BOOKING_REFERENCE_PREFIX = "RB-";

export const BOOKING_STATUS_LABELS: Record<BookingStatusView, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  "no-show": "No-show",
};

/** Statuses a customer is still allowed to cancel. */
export const CANCELLABLE_STATUSES: BookingStatusView[] = ["pending", "confirmed"];
