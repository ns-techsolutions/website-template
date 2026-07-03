import { UnauthorizedError } from "@/lib/api/errors";
import { hashToken } from "@/lib/auth/hash-token";
import { controlDb } from "@/lib/db/control";

import type { SessionResult } from "@/features/auth/types/auth.dto";

import { issueMasterSession } from "./issue-master-session";
import { masterRefreshTokenRepository } from "../repositories/master-refresh-token.repository";

/**
 * Exchanges a platform super-admin's refresh token for a fresh access token + a
 * rotated refresh token (control plane). Same rotation/theft-detection semantics
 * as the tenant variant.
 */
export async function refreshMasterSessionUseCase(
  rawToken: string,
): Promise<SessionResult> {
  const existing = await masterRefreshTokenRepository.findByHash(
    hashToken(rawToken),
  );

  if (existing?.revokedAt) {
    await masterRefreshTokenRepository.revokeAllForAdmin(existing.adminId);
    throw new UnauthorizedError();
  }
  if (!existing || existing.expiresAt <= new Date()) {
    throw new UnauthorizedError();
  }

  const admin = await controlDb.masterAdmin.findUnique({
    where: { id: existing.adminId },
  });
  if (!admin) throw new UnauthorizedError();

  await masterRefreshTokenRepository.revoke(existing.id);
  const session = await issueMasterSession(admin);
  return {
    user: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      phone: null,
      role: "master",
      workspaceId: null,
    },
    ...session,
  };
}

/** Revokes the presented master refresh token on logout (no-op if absent). */
export async function logoutMasterUseCase(
  rawToken: string | null,
): Promise<void> {
  if (!rawToken) return;
  const existing = await masterRefreshTokenRepository.findByHash(
    hashToken(rawToken),
  );
  if (existing && !existing.revokedAt) {
    await masterRefreshTokenRepository.revoke(existing.id);
  }
}
