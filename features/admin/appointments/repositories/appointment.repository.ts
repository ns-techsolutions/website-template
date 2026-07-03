import { Prisma } from "@prisma/client";
import type { BookingStatus } from "@prisma/client";

import { getTenantDb } from "@/lib/db/tenant";
import type { Appointment, AppointmentStatus } from "@/lib/admin/types";

const withRefs = {
  include: {
    serviceRef: { select: { price: true, duration: true } },
    payments: { select: { status: true }, orderBy: { createdAt: "desc" as const }, take: 1 },
  },
} satisfies Prisma.BookingDefaultArgs;

export type AppointmentRow = Prisma.BookingGetPayload<typeof withRefs>;

const ENUM_TO_VIEW: Record<BookingStatus, AppointmentStatus> = {
  pending: "pending",
  confirmed: "confirmed",
  completed: "completed",
  cancelled: "cancelled",
  no_show: "no-show",
};

export function toAppointmentDto(row: AppointmentRow): Appointment {
  return {
    id: row.id,
    reference: row.reference,
    customer: row.customerName,
    email: row.email,
    phone: row.phone ?? "",
    service: row.service,
    serviceId: row.serviceId ?? undefined,
    staff: row.staff ?? "",
    staffId: row.staffId ?? undefined,
    date: row.date.toISOString().slice(0, 10),
    time: row.time,
    duration: row.duration ?? row.serviceRef?.duration ?? 0,
    price: row.price ?? row.serviceRef?.price ?? 0,
    status: ENUM_TO_VIEW[row.status],
    paymentStatus: row.payments[0]?.status ?? undefined,
  };
}

export interface ListAppointmentsParams {
  q?: string;
  status?: BookingStatus;
  limit?: number;
  offset?: number;
}

export const appointmentRepository = {
  async list(params: ListAppointmentsParams = {}): Promise<AppointmentRow[]> {
    const db = await getTenantDb();
    const where: Prisma.BookingWhereInput = {
      ...(params.status ? { status: params.status } : {}),
      ...(params.q
        ? {
            OR: [
              { customerName: { contains: params.q, mode: "insensitive" } },
              { service: { contains: params.q, mode: "insensitive" } },
              { email: { contains: params.q, mode: "insensitive" } },
            ],
          }
        : {}),
    };
    return db.booking.findMany({
      where,
      orderBy: [{ date: "desc" }, { time: "asc" }],
      ...(params.offset ? { skip: params.offset } : {}),
      ...(params.limit ? { take: params.limit } : {}),
      ...withRefs,
    });
  },

  async findById(id: string): Promise<AppointmentRow | null> {
    const db = await getTenantDb();
    return db.booking.findUnique({ where: { id }, ...withRefs });
  },

  async create(
    data: Prisma.BookingUncheckedCreateInput,
  ): Promise<AppointmentRow> {
    const db = await getTenantDb();
    return db.booking.create({ data, ...withRefs });
  },

  async update(
    id: string,
    data: Prisma.BookingUncheckedUpdateInput,
  ): Promise<AppointmentRow> {
    const db = await getTenantDb();
    return db.booking.update({ where: { id }, data, ...withRefs });
  },

  async remove(id: string): Promise<AppointmentRow> {
    const db = await getTenantDb();
    return db.booking.delete({ where: { id }, ...withRefs });
  },
};
