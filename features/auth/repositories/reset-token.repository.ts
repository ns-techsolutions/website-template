import type { PasswordResetToken } from "@prisma/client";

import { getTenantDb } from "@/lib/db/tenant";

export const resetTokenRepository = {
  async create(
    userId: string,
    tokenHash: string,
    expiresAt: Date,
  ): Promise<void> {
    const db = await getTenantDb();
    await db.passwordResetToken.create({ data: { userId, tokenHash, expiresAt } });
  },

  async findValid(tokenHash: string): Promise<PasswordResetToken | null> {
    const db = await getTenantDb();
    return db.passwordResetToken.findFirst({
      where: { tokenHash, usedAt: null, expiresAt: { gt: new Date() } },
    });
  },

  async markUsed(id: string): Promise<void> {
    const db = await getTenantDb();
    await db.passwordResetToken.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  },
};
