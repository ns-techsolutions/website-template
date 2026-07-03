import { UnauthorizedError } from "@/lib/api/errors";
import { hashToken } from "@/lib/auth/hash-token";
import type { AuthScope } from "@/lib/auth/jwt";

import { issueTenantSession } from "./issue-tenant-session";
import { toUserDto } from "../mappers/user.mapper";
import { refreshTokenRepository } from "../repositories/refresh-token.repository";
import { userRepository } from "../repositories/user.repository";
import type { SessionResult } from "../types/auth.dto";

/**
 * Exchanges a tenant-DB user's refresh token (customer or tenant admin) for a
 * fresh access token + a rotated refresh token. The presented token is revoked
 * and a new one issued. Presenting an already-revoked token is treated as theft:
 * every live token for that user is revoked. Throws `UnauthorizedError` on any
 * invalid/expired/scope-mismatched token.
 */
export async function refreshTenantSessionUseCase(
  rawToken: string,
  scope: AuthScope,
): Promise<SessionResult> {
  const existing = await refreshTokenRepository.findByHash(hashToken(rawToken));

  if (existing?.revokedAt) {
    await refreshTokenRepository.revokeAllForUser(existing.userId);
    throw new UnauthorizedError();
  }
  if (
    !existing ||
    existing.scope !== scope ||
    existing.expiresAt <= new Date()
  ) {
    throw new UnauthorizedError();
  }

  const user = await userRepository.findById(existing.userId);
  if (!user) throw new UnauthorizedError();

  await refreshTokenRepository.revoke(existing.id);
  const session = await issueTenantSession(user, scope);
  return { user: toUserDto(user), ...session };
}

/** Revokes the presented refresh token on logout (no-op if absent/unknown). */
export async function logoutTenantUseCase(
  rawToken: string | null,
): Promise<void> {
  if (!rawToken) return;
  const existing = await refreshTokenRepository.findByHash(hashToken(rawToken));
  if (existing && !existing.revokedAt) {
    await refreshTokenRepository.revoke(existing.id);
  }
}
