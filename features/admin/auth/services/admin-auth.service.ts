import type { NextRequest } from "next/server";

import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
} from "@/features/auth/validations/auth.schema";
import type { SessionResult } from "@/features/auth/types/auth.dto";
import { isPlatformHost } from "@/lib/db/tenant";

import { refreshTenantSessionUseCase } from "@/features/auth/business/refresh-session.usecase";
import { logoutTenantUseCase } from "@/features/auth/business/refresh-session.usecase";
import { resetPasswordUseCase } from "@/features/auth/business/reset-password.usecase";

import { adminLoginUseCase } from "../business/admin-login.usecase";
import { masterLoginUseCase } from "../business/master-login.usecase";
import { requestAdminPasswordResetUseCase } from "../business/request-admin-password-reset.usecase";
import {
  logoutMasterUseCase,
  refreshMasterSessionUseCase,
} from "../business/refresh-master-session.usecase";

function adminHost(req: NextRequest): string | null {
  return req.headers.get("x-forwarded-host") ?? req.headers.get("host");
}

/**
 * Server-side orchestration for the admin login route. The host decides which
 * directory to authenticate against:
 *   - platform host -> master admins (control-plane)
 *   - salon domain  -> that salon's tenant admins (the salon's own database)
 */
export const adminAuthService = {
  login(raw: unknown, req: NextRequest): Promise<SessionResult> {
    const input = loginSchema.parse(raw);
    return isPlatformHost(adminHost(req))
      ? masterLoginUseCase(input)
      : adminLoginUseCase(input);
  },

  /** Rotates the admin refresh token — master on the platform host, otherwise a salon's tenant admin. */
  refresh(rawToken: string, req: NextRequest): Promise<SessionResult> {
    return isPlatformHost(adminHost(req))
      ? refreshMasterSessionUseCase(rawToken)
      : refreshTenantSessionUseCase(rawToken, "admin");
  },

  /** Revokes the presented admin refresh token (host-routed like refresh). */
  logout(rawToken: string | null, req: NextRequest): Promise<void> {
    return isPlatformHost(adminHost(req))
      ? logoutMasterUseCase(rawToken)
      : logoutTenantUseCase(rawToken);
  },

  /**
   * Emails a salon (tenant) admin a reset link. Operates on the request's salon
   * database; only staff accounts receive a link (see the use case).
   */
  async requestPasswordReset(raw: unknown, baseUrl: string): Promise<void> {
    const input = forgotPasswordSchema.parse(raw);
    await requestAdminPasswordResetUseCase(input, baseUrl);
  },

  /** Consumes a reset token and updates the password (reuses the tenant flow). */
  async resetPassword(raw: unknown): Promise<void> {
    const input = resetPasswordSchema.parse(raw);
    await resetPasswordUseCase(input);
  },
};
