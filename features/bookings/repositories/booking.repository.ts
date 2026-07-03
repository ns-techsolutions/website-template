import type { Prisma } from "@prisma/client";

import { getTenantDb } from "@/lib/db/tenant";
import type { BookingEntity } from "../types/booking.entity";

export const bookingRepository = {
  async create(data: Prisma.BookingUncheckedCreateInput): Promise<BookingEntity> {
    const db = await getTenantDb();
    return db.booking.create({ data });
  },

  async findById(id: string): Promise<BookingEntity | null> {
    const db = await getTenantDb();
    return db.booking.findUnique({ where: { id } });
  },

  async findByReference(reference: string): Promise<BookingEntity | null> {
    const db = await getTenantDb();
    return db.booking.findUnique({ where: { reference } });
  },

  /**
   * Bookings owned by the user, OR made as a guest with the same email before
   * they signed in (preserves the old email-matching behaviour).
   */
  async listForUser(params: {
    userId: string;
    email: string;
  }): Promise<BookingEntity[]> {
    const db = await getTenantDb();
    return db.booking.findMany({
      where: {
        OR: [{ userId: params.userId }, { email: params.email }],
      },
      orderBy: { date: "desc" },
    });
  },

  async update(
    id: string,
    data: Prisma.BookingUpdateInput,
  ): Promise<BookingEntity> {
    const db = await getTenantDb();
    return db.booking.update({ where: { id }, data });
  },
};
