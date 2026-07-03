import { Prisma } from "@prisma/client";
import type { BookingStatus } from "@prisma/client";

import { ConflictError } from "@/lib/api/errors";
import { getTenantDb } from "@/lib/db/tenant";
import { sendBookingConfirmation } from "@/lib/mail";
import { loadSlotContext, resolveStaffForSlot } from "@/lib/booking/slot-availability";
import { consumeEmailOtp } from "@/features/email-otp/business/consume-email-otp";

import { toBookingView } from "../mappers/booking.mapper";
import type { BookingView } from "../types/booking.view";
import { makeReference } from "../utils/booking.utils";

/** Normalized booking input — satisfied by both the customer and admin schemas. */
export interface CreateBookingDraft {
  customerName: string;
  email: string; // "" allowed for admin walk-ins without an email
  phone?: string;
  service?: string;
  serviceId?: string;
  staff?: string;
  staffId?: string;
  date: Date;
  time: string;
  code?: string;
}

export interface CreateBookingOptions {
  /** Skip guest email OTP (admin operators are trusted). */
  skipOtp?: boolean;
  /** Initial status (admin can set it; customers are always "pending"). */
  status?: BookingStatus;
  /** Admin force-book: bypass the availability/capacity check. */
  override?: boolean;
  /** Send the customer confirmation email (default true). */
  sendConfirmation?: boolean;
}

/**
 * Single source of truth for creating a booking — used by both the customer and
 * admin flows. Resolves catalog snapshots server-side, then performs a
 * race-safe, per-staff conflict check inside a transaction: a day-scoped Postgres
 * advisory lock serializes concurrent bookings so the check-then-insert is
 * atomic, preventing double-booking. For "any stylist" it auto-assigns a free
 * staff member; when the salon is full it throws a 409 (unless `override`).
 */
export async function createBookingUseCase(
  input: CreateBookingDraft,
  userId: string | null,
  options: CreateBookingOptions = {},
): Promise<BookingView> {
  const {
    skipOtp = false,
    status = "pending",
    override = false,
    sendConfirmation = true,
  } = options;

  // Guests must prove control of the email before a booking is taken; signed-in
  // users are trusted (their account email is already verified), as are admin
  // operators. Skipped when the salon can't deliver email — see consumeEmailOtp.
  if (userId === null && !skipOtp) {
    await consumeEmailOtp(input.email, "booking", input.code);
  }

  const db = await getTenantDb();

  // Resolve the catalog snapshots server-side so price/duration can't be forged.
  let serviceName = input.service ?? "";
  let serviceId: string | null = null;
  let price: number | null = null;
  let duration: number | null = null;
  if (input.serviceId) {
    const svc = await db.service.findUnique({
      where: { id: input.serviceId },
      select: { id: true, name: true, price: true, duration: true },
    });
    if (svc) {
      serviceId = svc.id;
      serviceName = svc.name;
      price = svc.price;
      duration = svc.duration;
    }
  }

  const dateStr = input.date.toISOString().slice(0, 10);
  // Local-parsed date → correct weekday for the opening-hours / grid check.
  const slotDate = new Date(`${dateStr}T00:00:00`);
  const requestedStaffId = input.staffId ?? null;

  let booking;
  try {
    booking = await db.$transaction(async (tx) => {
      // Serialize all bookings for this day so the conflict check + insert run
      // atomically — two concurrent requests for the last free staff can't both win.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${dateStr}))`;

      const ctx = await loadSlotContext(tx, dateStr, { serviceId });
      if (!ctx) throw new ConflictError("This salon isn't accepting bookings yet.");

      const { ok, staffId } = resolveStaffForSlot(
        ctx,
        slotDate,
        input.time,
        requestedStaffId,
        override,
      );
      if (!ok) {
        throw new ConflictError(
          "That time slot is no longer available. Please choose another time.",
        );
      }

      // Snapshot the assigned staff's name (auto-picked for "any stylist").
      let staffName = input.staff ?? null;
      if (staffId) {
        const stf = await tx.staff.findUnique({
          where: { id: staffId },
          select: { name: true },
        });
        if (stf) staffName = stf.name;
      }

      return tx.booking.create({
        data: {
          reference: makeReference(),
          customerName: input.customerName,
          email: input.email,
          phone: input.phone ?? null,
          service: serviceName,
          staff: staffName,
          serviceId,
          staffId,
          price,
          duration,
          date: input.date,
          time: input.time,
          status,
          userId: userId ?? null,
        },
      });
    });
  } catch (e) {
    // The [staffId, date, time] unique index caught an exact-slot duplicate
    // (e.g. a double-submit) that slipped past the in-memory check.
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      throw new ConflictError(
        "That time slot was just taken. Please choose another time.",
      );
    }
    throw e;
  }

  // Fire-and-forget confirmation email — never block/fault the booking on it.
  if (sendConfirmation && booking.email) {
    void sendBookingConfirmation({
      email: booking.email,
      customerName: booking.customerName,
      reference: booking.reference,
      service: booking.service,
      date: booking.date,
      time: booking.time,
      staff: booking.staff,
    });
  }

  return toBookingView(booking);
}
