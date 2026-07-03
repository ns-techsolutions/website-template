import { BOOKING_REFERENCE_PREFIX } from "../constants/booking.constants";

/** Short human-friendly booking reference, e.g. "RB-7Q2K9P". */
export function makeReference(): string {
  return `${BOOKING_REFERENCE_PREFIX}${Math.random()
    .toString(36)
    .slice(2, 8)
    .toUpperCase()}`;
}
