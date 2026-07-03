import type { BookingStatus } from "@prisma/client";

import type { BookingEntity } from "../types/booking.entity";
import type { BookingStatusView, BookingView } from "../types/booking.view";

const STATUS_TO_VIEW: Record<BookingStatus, BookingStatusView> = {
  pending: "pending",
  confirmed: "confirmed",
  completed: "completed",
  cancelled: "cancelled",
  no_show: "no-show",
};

const VIEW_TO_STATUS: Record<BookingStatusView, BookingStatus> = {
  pending: "pending",
  confirmed: "confirmed",
  completed: "completed",
  cancelled: "cancelled",
  "no-show": "no_show",
};

export function toBookingView(booking: BookingEntity): BookingView {
  return {
    id: booking.id,
    reference: booking.reference,
    email: booking.email,
    customerName: booking.customerName,
    phone: booking.phone ?? undefined,
    service: booking.service,
    staff: booking.staff ?? undefined,
    date: booking.date.toISOString(),
    time: booking.time,
    status: STATUS_TO_VIEW[booking.status],
    createdAt: booking.createdAt.toISOString(),
  };
}

export function viewStatusToEnum(status: BookingStatusView): BookingStatus {
  return VIEW_TO_STATUS[status];
}
