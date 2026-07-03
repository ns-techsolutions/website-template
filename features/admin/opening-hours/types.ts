import type { Closure, OpeningHour } from "@/lib/admin/types";

/** The salon's weekly opening hours, holiday closures, and bookable slot length. */
export interface SalonHours {
  openingHours: OpeningHour[];
  closures: Closure[];
  slotDurationMinutes: number;
  /** Turnaround/cleanup minutes reserved after each appointment. */
  bufferMinutes: number;
  /** Hours before the appointment a cancellation still gets a full deposit refund. */
  cancellationCutoffHours: number;
  /** ISO-3166 alpha-2 default country for storefront phone inputs. */
  defaultCountry: string;
}
