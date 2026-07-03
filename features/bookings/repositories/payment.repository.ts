import type { Prisma, PaymentStatus } from "@prisma/client";

import { getTenantDb } from "@/lib/db/tenant";

export type PaymentRow = {
  id: string;
  workspaceId: string;
  bookingId: string;
  provider: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  providerRef: string | null;
  refundRef: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export const paymentRepository = {
  async create(
    data: Prisma.PaymentUncheckedCreateInput,
  ): Promise<PaymentRow> {
    const db = await getTenantDb();
    return db.payment.create({ data }) as Promise<PaymentRow>;
  },

  async findByProviderRef(providerRef: string): Promise<PaymentRow | null> {
    const db = await getTenantDb();
    return db.payment.findFirst({
      where: { providerRef },
    }) as Promise<PaymentRow | null>;
  },

  async findByBookingId(bookingId: string): Promise<PaymentRow[]> {
    const db = await getTenantDb();
    return db.payment.findMany({ where: { bookingId } }) as Promise<PaymentRow[]>;
  },

  async updateStatus(
    id: string,
    status: PaymentStatus,
  ): Promise<PaymentRow> {
    const db = await getTenantDb();
    return db.payment.update({
      where: { id },
      data: { status },
    }) as Promise<PaymentRow>;
  },

  async markRefunded(id: string, refundRef: string): Promise<PaymentRow> {
    const db = await getTenantDb();
    return db.payment.update({
      where: { id },
      data: { status: "refunded", refundRef },
    }) as Promise<PaymentRow>;
  },
};
