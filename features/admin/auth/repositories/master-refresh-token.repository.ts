import type { MasterRefreshToken } from "@/lib/db/generated/control";

import { controlDb } from "@/lib/db/control";

/** Refresh tokens for platform super-admins (control plane). Only hashes stored. */
export const masterRefreshTokenRepository = {
  async create(
    adminId: string,
    tokenHash: string,
    expiresAt: Date,
  ): Promise<void> {
    await controlDb.masterRefreshToken.create({
      data: { adminId, tokenHash, expiresAt },
    });
  },

  async findValid(tokenHash: string): Promise<MasterRefreshToken | null> {
    return controlDb.masterRefreshToken.findFirst({
      where: { tokenHash, revokedAt: null, expiresAt: { gt: new Date() } },
    });
  },

  async findByHash(tokenHash: string): Promise<MasterRefreshToken | null> {
    return controlDb.masterRefreshToken.findUnique({ where: { tokenHash } });
  },

  async revoke(id: string): Promise<void> {
    await controlDb.masterRefreshToken.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  },

  async revokeAllForAdmin(adminId: string): Promise<void> {
    await controlDb.masterRefreshToken.updateMany({
      where: { adminId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  },
};
