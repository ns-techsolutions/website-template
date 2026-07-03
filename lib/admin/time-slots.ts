import type { OpeningHour } from "./types"

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
]

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number)
  return hours * 60 + minutes
}

/** Minutes-since-midnight for an "HH:mm" string. */
export function timeToMinutes(time: string): number {
  return toMinutes(time)
}

function toTimeString(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`
}

/** Finds the opening hours entry that matches the weekday of the given date. */
export function getOpeningHoursForDate(
  openingHours: OpeningHour[],
  date: Date
): OpeningHour | undefined {
  const dayName = DAY_NAMES[date.getDay()]
  return openingHours.find((h) => h.day === dayName)
}

/** Formats a "HH:mm" time slot for display, e.g. "09:30" -> "9:30 AM". */
export function formatSlotLabel(time: string): string {
  const [hours, minutes] = time.split(":").map(Number)
  const period = hours >= 12 ? "PM" : "AM"
  const displayHours = hours % 12 === 0 ? 12 : hours % 12
  return `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`
}

/**
 * Generates the bookable time slots for a given date, based on the salon's
 * opening hours and the configured slot duration. Slots whose start time
 * appears in `bookedTimes` are excluded.
 */
export function generateTimeSlots(
  openingHours: OpeningHour[],
  date: Date,
  slotDurationMinutes: number,
  bookedTimes: string[] = []
): string[] {
  const hours = getOpeningHoursForDate(openingHours, date)
  if (!hours || hours.closed || slotDurationMinutes <= 0) return []

  const start = toMinutes(hours.open)
  const end = toMinutes(hours.close)
  const booked = new Set(bookedTimes)

  const slots: string[] = []
  for (let t = start; t + slotDurationMinutes <= end; t += slotDurationMinutes) {
    const slot = toTimeString(t)
    if (!booked.has(slot)) slots.push(slot)
  }
  return slots
}

/** Half-open overlap test: [aStart, aEnd) intersects [bStart, bEnd). */
export function rangesOverlap(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number
): boolean {
  return aStart < bEnd && bStart < aEnd
}

/** A non-cancelled booking, as far as availability is concerned. */
export interface SlotBooking {
  time: string // "HH:mm" start
  duration: number | null // service minutes (falls back to slotMinutes)
  staffId: string | null
}

export interface ComputeAvailableSlotsArgs {
  openingHours: OpeningHour[]
  date: Date
  /** Grid step between candidate start times (salon slotDurationMinutes). */
  slotMinutes: number
  /** Minutes the chosen service occupies (falls back to slotMinutes when 0). */
  serviceDuration: number
  /** Turnaround reserved after every appointment. */
  bufferMinutes: number
  /** Active staff available on this date (already excluding approved leave). */
  staffIds: string[]
  /** Non-cancelled bookings for this date. */
  bookings: SlotBooking[]
  /** When set, availability is computed for that staff member only. */
  requestedStaffId?: string | null
}

/** Busy interval (in minutes) a booking occupies for a given staff member. */
interface BusyWindow {
  start: number
  end: number
}

/**
 * Per-staff, duration-aware bookable start times. A candidate slot is offered
 * when the requested staff member is free for the whole service (plus buffer),
 * or — when no specific staff is requested — when at least one active staff
 * member is free. Concurrency is therefore bounded by the number of staff.
 */
export function computeAvailableSlots({
  openingHours,
  date,
  slotMinutes,
  serviceDuration,
  bufferMinutes,
  staffIds,
  bookings,
  requestedStaffId,
}: ComputeAvailableSlotsArgs): string[] {
  const hours = getOpeningHoursForDate(openingHours, date)
  if (!hours || hours.closed || slotMinutes <= 0) return []

  // A specific staff member who isn't active / is on leave can't take bookings.
  if (requestedStaffId && !staffIds.includes(requestedStaffId)) return []

  const duration = serviceDuration > 0 ? serviceDuration : slotMinutes
  const buffer = Math.max(0, bufferMinutes)
  const open = toMinutes(hours.open)
  const close = toMinutes(hours.close)

  // Group booking busy windows by staff; track "any stylist" (null) bookings
  // separately — each still consumes one unit of pool capacity.
  const byStaff = new Map<string, BusyWindow[]>()
  const unassigned: BusyWindow[] = []
  for (const b of bookings) {
    const bStart = toMinutes(b.time)
    const bEnd = bStart + (b.duration && b.duration > 0 ? b.duration : slotMinutes) + buffer
    const win = { start: bStart, end: bEnd }
    if (b.staffId) {
      const list = byStaff.get(b.staffId)
      if (list) list.push(win)
      else byStaff.set(b.staffId, [win])
    } else {
      unassigned.push(win)
    }
  }

  const isFree = (windows: BusyWindow[] | undefined, t: number, end: number) =>
    !windows?.some((w) => rangesOverlap(t, end, w.start, w.end))

  // Backward-compatible fallback: a salon that hasn't configured any staff is
  // treated as a single shared resource (capacity 1), so it can still take
  // bookings. Every booking occupies that one resource.
  const noStaff = staffIds.length === 0
  const allWindows = noStaff
    ? [...unassigned, ...[...byStaff.values()].flat()]
    : []

  const slots: string[] = []
  for (let t = open; t + duration <= close; t += slotMinutes) {
    const end = t + duration + buffer

    if (noStaff) {
      if (!allWindows.some((w) => rangesOverlap(t, end, w.start, w.end))) {
        slots.push(toTimeString(t))
      }
      continue
    }

    if (requestedStaffId) {
      // Specific staff: only their own bookings matter.
      if (isFree(byStaff.get(requestedStaffId), t, end)) slots.push(toTimeString(t))
      continue
    }

    // "Any stylist": at least one active staff member must be free, after
    // accounting for unassigned bookings that also draw from the pool.
    const freeStaff = staffIds.filter((id) => isFree(byStaff.get(id), t, end)).length
    const overlappingUnassigned = unassigned.filter((w) =>
      rangesOverlap(t, end, w.start, w.end)
    ).length
    if (freeStaff - overlappingUnassigned > 0) slots.push(toTimeString(t))
  }
  return slots
}
