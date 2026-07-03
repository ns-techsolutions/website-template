import { ForbiddenError } from "@/lib/api/errors";
import type { AuthUser } from "@/lib/auth/get-auth-user";
import type { BookingEntity } from "../types/booking.entity";

/** A booking belongs to a user by direct link or by matching (guest) email. */
export function assertBookingOwnership(
  booking: BookingEntity,
  user: AuthUser,
): void {
  const owns =
    booking.userId === user.id ||
    booking.email === user.email.toLowerCase();
  if (!owns) {
    throw new ForbiddenError("You can't access this booking.");
  }
}
