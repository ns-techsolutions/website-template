import { Prisma } from "@prisma/client";

import { ConflictError, NotFoundError } from "@/lib/api/errors";
import { getTenantDb } from "@/lib/db/tenant";
import type { Appointment, AppointmentStatus } from "@/lib/admin/types";
import { loadSlotContext, resolveStaffForSlot } from "@/lib/booking/slot-availability";
import { createBookingUseCase } from "@/features/bookings/business/create-booking.usecase";
import {
  refundBookingDeposit,
  type RefundOutcome,
} from "@/features/bookings/business/refund-booking.usecase";
import { viewStatusToEnum } from "@/features/bookings/mappers/booking.mapper";
import { sendBookingStatusUpdate } from "@/lib/mail";

import {
  appointmentRepository,
  toAppointmentDto,
} from "../repositories/appointment.repository";
import {
  createAppointmentSchema,
  updateAppointmentSchema,
} from "../validations/appointment.schema";

export interface ListAppointmentsQuery {
  q?: string;
  status?: AppointmentStatus;
  limit?: number;
  offset?: number;
}

export const appointmentService = {
  async list(params: ListAppointmentsQuery = {}): Promise<Appointment[]> {
    const { status, ...rest } = params;
    const rows = await appointmentRepository.list({
      ...rest,
      status: status ? viewStatusToEnum(status) : undefined,
    });
    return rows.map(toAppointmentDto);
  },

  async get(id: string): Promise<Appointment> {
    const row = await appointmentRepository.findById(id);
    if (!row) throw new NotFoundError("Appointment not found.");
    return toAppointmentDto(row);
  },

  // Admin create runs through the shared booking engine, so it obeys the same
  // per-staff availability/capacity and race-safety rules as customer bookings.
  // Admin-only powers: trusted (no OTP), can set the status, and can `override`
  // the conflict check to force-book a walk-in / squeeze-in.
  async create(raw: unknown): Promise<Appointment> {
    const input = createAppointmentSchema.parse(raw);
    const view = await createBookingUseCase(
      {
        customerName: input.customer,
        email: input.email ?? "",
        phone: input.phone,
        serviceId: input.serviceId,
        staffId: input.staffId,
        date: input.date,
        time: input.time,
      },
      null,
      {
        skipOtp: true,
        status: input.status ? viewStatusToEnum(input.status) : "pending",
        override: input.override ?? false,
        sendConfirmation: Boolean(input.email),
      },
    );

    const row = await appointmentRepository.findById(view.id);
    if (!row) throw new NotFoundError("Appointment not found.");
    return toAppointmentDto(row);
  },

  async update(id: string, raw: unknown): Promise<Appointment> {
    const existing = await appointmentRepository.findById(id);
    if (!existing) throw new NotFoundError("Appointment not found.");

    const input = updateAppointmentSchema.parse(raw);
    const db = await getTenantDb();
    const data: Prisma.BookingUncheckedUpdateInput = {};
    if (input.customer !== undefined) data.customerName = input.customer;
    if (input.phone !== undefined) data.phone = input.phone || null;

    // Resolve catalog snapshots (name/price/duration) from the service id so
    // admin edits stay consistent with the catalog, like customer bookings.
    if (input.serviceId !== undefined) {
      const svc = await db.service.findUnique({
        where: { id: input.serviceId },
        select: { id: true, name: true, price: true, duration: true },
      });
      if (svc) {
        data.serviceId = svc.id;
        data.service = svc.name;
        data.price = svc.price;
        data.duration = svc.duration;
      }
    }

    let staffId = existing.staffId;
    if (input.staffId !== undefined) {
      if (input.staffId) {
        const stf = await db.staff.findUnique({
          where: { id: input.staffId },
          select: { id: true, name: true },
        });
        if (stf) {
          data.staffId = stf.id;
          data.staff = stf.name;
          staffId = stf.id;
        }
      } else {
        data.staffId = null;
        data.staff = null;
        staffId = null;
      }
    }

    if (input.date !== undefined) data.date = input.date;
    if (input.time !== undefined) data.time = input.time;
    if (input.status !== undefined) data.status = viewStatusToEnum(input.status);

    // Re-check availability when the slot/staff/service moved (skipped on override).
    const movedSlot =
      input.date !== undefined ||
      input.time !== undefined ||
      input.staffId !== undefined ||
      input.serviceId !== undefined;
    if (movedSlot && !input.override) {
      const date = input.date ?? existing.date;
      const dateStr = date.toISOString().slice(0, 10);
      const slotDate = new Date(`${dateStr}T00:00:00`);
      const time = input.time ?? existing.time;
      const serviceId = input.serviceId ?? existing.serviceId ?? null;
      const ctx = await loadSlotContext(db, dateStr, {
        serviceId,
        excludeBookingId: id,
      });
      if (ctx) {
        const res = resolveStaffForSlot(ctx, slotDate, time, staffId, false);
        if (!res.ok) {
          throw new ConflictError(
            "That time slot is no longer available. Please choose another time.",
          );
        }
        // Auto-assign a free staff member when none was chosen ("any stylist").
        if (!staffId && res.staffId) {
          data.staffId = res.staffId;
          const stf = await db.staff.findUnique({
            where: { id: res.staffId },
            select: { name: true },
          });
          if (stf) data.staff = stf.name;
        }
      }
    }

    let updated;
    try {
      updated = await appointmentRepository.update(id, data);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        throw new ConflictError(
          "Another booking already holds that exact slot for this staff member.",
        );
      }
      throw e;
    }

    const statusChanged =
      input.status !== undefined && viewStatusToEnum(input.status) !== existing.status;

    // On a transition to cancelled, auto-refund the deposit within the salon's
    // cancellation window (same policy as customer-initiated cancels). Best-effort:
    // a gateway error must not fault the status change — admins can force-refund.
    let refund: RefundOutcome = { refunded: false };
    if (statusChanged && input.status === "cancelled") {
      try {
        refund = await refundBookingDeposit(id, { force: false });
      } catch (e) {
        console.error("[appointment.update] auto-refund failed:", e);
      }
    }

    // Notify the customer when an admin confirms or cancels their booking.
    if (
      statusChanged &&
      updated.email &&
      (input.status === "confirmed" || input.status === "cancelled")
    ) {
      void sendBookingStatusUpdate(
        {
          email: updated.email,
          customerName: updated.customerName,
          reference: updated.reference,
          service: updated.service,
          date: updated.date,
        },
        input.status,
        refund.refunded
          ? { refundedAmount: refund.amount, currency: refund.currency }
          : undefined,
      );
    }

    return toAppointmentDto(updated);
  },

  // Admin force-refund: refunds the deposit regardless of the cancellation window.
  async refund(id: string): Promise<Appointment> {
    const existing = await appointmentRepository.findById(id);
    if (!existing) throw new NotFoundError("Appointment not found.");

    const result = await refundBookingDeposit(id, { force: true });
    if (!result.refunded) {
      throw new ConflictError(
        result.reason === "already_refunded"
          ? "This deposit has already been refunded."
          : "There is no paid deposit to refund for this booking.",
      );
    }

    if (existing.email) {
      void sendBookingStatusUpdate(
        {
          email: existing.email,
          customerName: existing.customerName,
          reference: existing.reference,
          service: existing.service,
          date: existing.date,
        },
        existing.status === "cancelled" ? "cancelled" : "refunded",
        { refundedAmount: result.amount, currency: result.currency },
      );
    }

    const row = await appointmentRepository.findById(id);
    return toAppointmentDto(row!);
  },

  async remove(id: string): Promise<Appointment> {
    const existing = await appointmentRepository.findById(id);
    if (!existing) throw new NotFoundError("Appointment not found.");
    return toAppointmentDto(await appointmentRepository.remove(id));
  },
};
