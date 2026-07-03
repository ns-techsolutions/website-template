import { signAccessToken } from "@/lib/auth/jwt";
import { generateOpaqueToken, hashToken } from "@/lib/auth/hash-token";
import { refreshExpiresAt } from "@/lib/auth/refresh-ttl";

import { masterRefreshTokenRepository } from "../repositories/master-refresh-token.repository";

/**
 * Mints an `admin`-scope access token + a persisted, rotating refresh token for
 * a platform super-admin (control plane). Raw refresh token returned for the
 * route to set as an httpOnly cookie.
 */
export async function issueMasterSession(admin: {
  id: string;
  email: string;
}): Promise<{ token: string; refreshToken: string }> {
  const token = await signAccessToken({
    sub: admin.id,
    email: admin.email,
    scope: "admin",
  });
  const refreshToken = generateOpaqueToken();
  await masterRefreshTokenRepository.create(
    admin.id,
    hashToken(refreshToken),
    refreshExpiresAt(),
  );
  return { token, refreshToken };
}
