import type { RefreshToken } from "@prisma/client";

import { getTenantDb } from "@/lib/db/tenant";
import type { AuthScope } from "@/lib/auth/jwt";

/** Refresh tokens for tenant-DB users (customers and tenant admins). Only hashes
 *  are stored; see lib/auth/hash-token.ts. */
export const refreshTokenRepository = {
  async create(
    userId: string,
    tokenHash: string,
    scope: AuthScope,
    expiresAt: Date,
  ): Promise<void> {
    const db = await getTenantDb();
    await db.refreshToken.create({
      data: { userId, tokenHash, scope, expiresAt },
    });
  },

  /** A token that exists, is unexpired, and has not been revoked. */
  async findValid(tokenHash: string): Promise<RefreshToken | null> {
    const db = await getTenantDb();
    return db.refreshToken.findFirst({
      where: { tokenHash, revokedAt: null, expiresAt: { gt: new Date() } },
    });
  },

  /** Looks up by hash regardless of state — used to detect reuse of a revoked token. */
  async findByHash(tokenHash: string): Promise<RefreshToken | null> {
    const db = await getTenantDb();
    return db.refreshToken.findUnique({ where: { tokenHash } });
  },

  async revoke(id: string): Promise<void> {
    const db = await getTenantDb();
    await db.refreshToken.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  },

  /** Revokes every live token for a user — logout-everywhere / theft response. */
  async revokeAllForUser(userId: string): Promise<void> {
    const db = await getTenantDb();
    await db.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  },
};
