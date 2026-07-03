import type { User } from "@prisma/client";

import { getTenantDb } from "@/lib/db/tenant";
import type { Customer, Status } from "@/lib/admin/types";

interface BookingAgg {
  visits: number;
  totalSpent: number;
  lastVisit: Date | null;
}

const ACTIVE_WINDOW_MS = 1000 * 60 * 60 * 24 * 183; // ~6 months

function toCustomerDto(user: User, agg: BookingAgg | undefined): Customer {
  const lastVisit = agg?.lastVisit ?? null;
  const isActive =
    lastVisit !== null && Date.now() - lastVisit.getTime() <= ACTIVE_WINDOW_MS;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone ?? "",
    visits: agg?.visits ?? 0,
    totalSpent: agg?.totalSpent ?? 0,
    lastVisit: lastVisit ? lastVisit.toISOString().slice(0, 10) : "",
    status: (isActive ? "active" : "inactive") satisfies Status,
    notes: user.notes,
  };
}

/** Aggregates non-cancelled bookings per (lowercased) customer email. */
async function aggregateByEmail(): Promise<Map<string, BookingAgg>> {
  const db = await getTenantDb();
  const grouped = await db.booking.groupBy({
    by: ["email"],
    where: { status: { not: "cancelled" } },
    _count: { _all: true },
    _sum: { price: true },
    _max: { date: true },
  });
  return new Map(
    grouped.map((g) => [
      g.email.toLowerCase(),
      {
        visits: g._count._all,
        totalSpent: g._sum.price ?? 0,
        lastVisit: g._max.date,
      },
    ]),
  );
}

export const customerRepository = {
  async list(q?: string): Promise<Customer[]> {
    const db = await getTenantDb();
    const where = {
      role: "customer" as const,
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" as const } },
              { email: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };
    const [users, agg] = await Promise.all([
      db.user.findMany({ where, orderBy: { name: "asc" } }),
      aggregateByEmail(),
    ]);
    return users.map((u) => toCustomerDto(u, agg.get(u.email.toLowerCase())));
  },

  async findById(id: string): Promise<Customer | null> {
    const db = await getTenantDb();
    const user = await db.user.findFirst({ where: { id, role: "customer" } });
    if (!user) return null;
    const agg = await aggregateByEmail();
    return toCustomerDto(user, agg.get(user.email.toLowerCase()));
  },

  async create(data: {
    name: string;
    email: string;
    phone?: string;
    notes?: string;
    password: string;
  }): Promise<Customer> {
    const db = await getTenantDb();
    const user = await db.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        notes: data.notes ?? "",
        password: data.password,
        role: "customer",
      },
    });
    return toCustomerDto(user, undefined);
  },

  async update(
    id: string,
    data: { name?: string; phone?: string; notes?: string },
  ): Promise<Customer | null> {
    const db = await getTenantDb();
    const existing = await db.user.findFirst({ where: { id, role: "customer" } });
    if (!existing) return null;
    const user = await db.user.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.phone !== undefined && { phone: data.phone || null }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
    });
    const agg = await aggregateByEmail();
    return toCustomerDto(user, agg.get(user.email.toLowerCase()));
  },
};
