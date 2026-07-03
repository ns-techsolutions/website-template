import { getTenantDb } from "@/lib/db/tenant";
import { availableSlotsFor, loadSlotContext } from "@/lib/booking/slot-availability";

export interface AvailabilityOptions {
  /** Resolves the service duration so multi-slot services block correctly. */
  serviceId?: string | null;
  /** Narrows availability to a specific staff member ("any stylist" when null). */
  staffId?: string | null;
}

/**
 * Bookable time slots for a given "yyyy-MM-dd" date. Per-staff and
 * duration-aware: a slot is offered when the requested staff member (or, for
 * "any stylist", at least one active staff member) is free for the full service
 * duration plus the cleanup buffer. Closures, opening hours and approved staff
 * leave all remove availability.
 */
export const catalogService = {
  async availability(dateStr: string, opts: AvailabilityOptions = {}): Promise<string[]> {
    // Local-parsed date → correct weekday for slot generation.
    const slotDate = new Date(`${dateStr}T00:00:00`);
    if (Number.isNaN(slotDate.getTime())) return [];

    const db = await getTenantDb();
    const ctx = await loadSlotContext(db, dateStr, { serviceId: opts.serviceId });
    if (!ctx) return [];

    return availableSlotsFor(ctx, slotDate, opts.staffId);
  },
};
