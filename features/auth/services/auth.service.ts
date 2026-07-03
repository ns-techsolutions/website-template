import { consumeEmailOtp } from "@/features/email-otp/business/consume-email-otp";

import { changePasswordUseCase } from "../business/change-password.usecase";
import { loginUseCase } from "../business/login.usecase";
import { registerUseCase } from "../business/register.usecase";
import { requestPasswordResetUseCase } from "../business/request-password-reset.usecase";
import { resetPasswordUseCase } from "../business/reset-password.usecase";
import { updateProfileUseCase } from "../business/update-profile.usecase";
import type { SessionResult, UserDto } from "../types/auth.dto";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  registerWithCodeSchema,
  resetPasswordSchema,
  updateProfileSchema,
} from "../validations/auth.schema";

/** Server-side orchestration used by the auth route handlers. */
export const authService = {
  async register(raw: unknown): Promise<SessionResult> {
    const { code, ...input } = registerWithCodeSchema.parse(raw);
    // Prove control of the email before any account row is written (skipped when
    // the salon can't deliver email — see consumeEmailOtp).
    await consumeEmailOtp(input.email, "signup", code);
    return registerUseCase(input);
  },

  login(raw: unknown): Promise<SessionResult> {
    const input = loginSchema.parse(raw);
    return loginUseCase(input);
  },

  updateProfile(userId: string, raw: unknown): Promise<UserDto> {
    const input = updateProfileSchema.parse(raw);
    return updateProfileUseCase(userId, input);
  },

  async changePassword(userId: string, raw: unknown): Promise<void> {
    const input = changePasswordSchema.parse(raw);
    await changePasswordUseCase(userId, input);
  },

  async requestPasswordReset(raw: unknown, baseUrl: string): Promise<void> {
    const input = forgotPasswordSchema.parse(raw);
    await requestPasswordResetUseCase(input, baseUrl);
  },

  async resetPassword(raw: unknown): Promise<void> {
    const input = resetPasswordSchema.parse(raw);
    await resetPasswordUseCase(input);
  },
};
