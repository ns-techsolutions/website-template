import { signAccessToken, type AuthScope } from "@/lib/auth/jwt";
import { generateOpaqueToken, hashToken } from "@/lib/auth/hash-token";
import { refreshExpiresAt } from "@/lib/auth/refresh-ttl";

import { refreshTokenRepository } from "../repositories/refresh-token.repository";

/**
 * Mints an access token + a persisted, rotating refresh token for a tenant-DB
 * user (customer or tenant admin). The raw refresh token is returned for the
 * route to set as an httpOnly cookie; only its hash is stored.
 */
export async function issueTenantSession(
  user: { id: string; email: string },
  scope: AuthScope,
): Promise<{ token: string; refreshToken: string }> {
  const token = await signAccessToken({ sub: user.id, email: user.email, scope });
  const refreshToken = generateOpaqueToken();
  await refreshTokenRepository.create(
    user.id,
    hashToken(refreshToken),
    scope,
    refreshExpiresAt(),
  );
  return { token, refreshToken };
}
