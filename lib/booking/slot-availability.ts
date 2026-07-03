import type { Prisma } from "@prisma/client";

import type { Closure, OpeningHour } from "@/lib/admin/types";
import {
  computeAvailableSlots,
  getOpeningHoursForDate,
  rangesOverlap,
  timeToMinutes,
  type SlotBooking,
} from "@/lib/admin/time-slots";

// Accepts either the full PrismaClient or a transaction client — both expose the
// model delegates we read here, so the same logic backs the public availability
// endpoint and the race-safe booking transaction.
type Db = Prisma.TransactionClient;

const DAY_MS = 1000 * 60 * 60 * 24;

/** Everything needed to decide availability for one salon, one date. */
export interface SlotContext {
  openingHours: OpeningHour[];
  slotMinutes: number;
  bufferMinutes: number;
  /** Duration of the requested service (0 when none/unknown). */
  serviceDuration: number;
  /** Active staff for the date, already excluding approved leave. */
  staffIds: string[];
  /** Non-cancelled bookings for the date. */
  bookings: SlotBooking[];
  /** True when the date is a closure (or the salon has no settings). */
  closed: boolean;
}

/**
 * Loads the per-staff availability context for a "yyyy-MM-dd" date: opening
 * hours, slot/buffer config, the requested service duration, the staff pool
 * (minus approved leave) and the day's bookings. Works against a Prisma client
 * or a transaction client so the read and write paths stay in sync.
 */
export async function loadSlotContext(
  db: Db,
  dateStr: string,
  opts: { serviceId?: string | null; excludeBookingId?: string } = {},
): Promise<SlotContext | null> {
  const settings = await db.salonSettings.findFirst();
  if (!settings) return null;

  const closures = (settings.closures ?? []) as unknown as Closure[];
  const closed = closures.some((c) => c.date === dateStr);
  const openingHours = (settings.openingHours ?? []) as unknown as OpeningHour[];

  let serviceDuration = 0;
  if (opts.serviceId) {
    const svc = await db.service.findUnique({
      where: { id: opts.serviceId },
      select: { duration: true },
    });
    if (svc) serviceDuration = svc.duration;
  }

  // UTC day bounds — matches how booking dates are stored (UTC midnight).
  const start = new Date(`${dateStr}T00:00:00.000Z`);
  const end = new Date(start.getTime() + DAY_MS);

  const activeStaff = await db.staff.findMany({
    where: { status: "active" },
    select: { id: true },
  });

  // Any approved leave overlapping the day removes that staff member.
  const leave = await db.leaveRequest.findMany({
    where: { status: "approved", from: { lt: end }, to: { gte: start } },
    select: { staffId: true },
  });
  const onLeave = new Set(leave.map((l) => l.staffId));
  const staffIds = activeStaff.map((s) => s.id).filter((id) => !onLeave.has(id));

  const bookings = await db.booking.findMany({
    where: {
      date: { gte: start, lt: end },
      status: { not: "cancelled" },
      // Exclude the booking being rescheduled so it doesn't conflict with itself.
      ...(opts.excludeBookingId ? { id: { not: opts.excludeBookingId } } : {}),
    },
    select: { time: true, duration: true, staffId: true },
  });

  return {
    openingHours,
    slotMinutes: settings.slotDurationMinutes,
    bufferMinutes: settings.bufferMinutes ?? 0,
    serviceDuration,
    staffIds,
    bookings,
    closed,
  };
}

/** Bookable start times for a date, optionally narrowed to one staff member. */
export function availableSlotsFor(ctx: SlotContext, date: Date, staffId?: string | null): string[] {
  if (ctx.closed) return [];
  return computeAvailableSlots({
    openingHours: ctx.openingHours,
    date,
    slotMinutes: ctx.slotMinutes,
    serviceDuration: ctx.serviceDuration,
    bufferMinutes: ctx.bufferMinutes,
    staffIds: ctx.staffIds,
    bookings: ctx.bookings,
    requestedStaffId: staffId ?? null,
  });
}

export interface SlotAssignment {
  /** Whether the slot can be booked under the current rules. */
  ok: boolean;
  /** Concrete staff to assign (auto-picked for "any stylist"; may be null). */
  staffId: string | null;
}

/**
 * Decides whether a single requested slot can be booked and, for "any stylist"
 * requests, which free staff member to assign. Mirrors computeAvailableSlots'
 * overlap logic for one window. `override` (admin force) skips the free/hours
 * checks but still resolves a staff member where possible.
 */
export function resolveStaffForSlot(
  ctx: SlotContext,
  date: Date,
  time: string,
  requestedStaffId: string | null,
  override = false,
): SlotAssignment {
  const duration = ctx.serviceDuration > 0 ? ctx.serviceDuration : ctx.slotMinutes;
  const buffer = Math.max(0, ctx.bufferMinutes);
  const t = timeToMinutes(time);
  const end = t + duration + buffer;

  // Build busy windows per staff (+ unassigned "any" bookings that draw from the pool).
  const byStaff = new Map<string, { start: number; end: number }[]>();
  const unassigned: { start: number; end: number }[] = [];
  for (const b of ctx.bookings) {
    const bStart = timeToMinutes(b.time);
    const win = {
      start: bStart,
      end: bStart + (b.duration && b.duration > 0 ? b.duration : ctx.slotMinutes) + buffer,
    };
    if (b.staffId) {
      const list = byStaff.get(b.staffId);
      if (list) list.push(win);
      else byStaff.set(b.staffId, [win]);
    } else {
      unassigned.push(win);
    }
  }
  const staffFree = (id: string) =>
    !byStaff.get(id)?.some((w) => rangesOverlap(t, end, w.start, w.end));

  if (override) {
    // Admin force: keep the requested staff, or fall back to any active staff.
    return { ok: true, staffId: requestedStaffId ?? ctx.staffIds[0] ?? null };
  }

  if (ctx.closed) return { ok: false, staffId: null };

  // Requested time must sit within opening hours and on the slot grid.
  const hours = getOpeningHoursForDate(ctx.openingHours, date);
  if (!hours || hours.closed) return { ok: false, staffId: null };
  const open = timeToMinutes(hours.open);
  const close = timeToMinutes(hours.close);
  if (t < open || t + duration > close || (t - open) % ctx.slotMinutes !== 0) {
    return { ok: false, staffId: null };
  }

  // Single-resource fallback when no staff are configured (capacity 1).
  if (ctx.staffIds.length === 0) {
    const occupied = [...byStaff.values(), unassigned]
      .flat()
      .some((w) => rangesOverlap(t, end, w.start, w.end));
    return occupied ? { ok: false, staffId: null } : { ok: true, staffId: null };
  }

  if (requestedStaffId) {
    if (!ctx.staffIds.includes(requestedStaffId)) return { ok: false, staffId: null };
    return staffFree(requestedStaffId)
      ? { ok: true, staffId: requestedStaffId }
      : { ok: false, staffId: null };
  }

  // "Any stylist": assign the first free active staff member, if any.
  const free = ctx.staffIds.find(staffFree);
  return free ? { ok: true, staffId: free } : { ok: false, staffId: null };
}
