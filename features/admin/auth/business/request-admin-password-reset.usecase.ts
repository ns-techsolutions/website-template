import { sendPasswordReset } from "@/lib/mail";
import { generateOpaqueToken, hashToken } from "@/lib/auth/hash-token";

import { resetTokenRepository } from "@/features/auth/repositories/reset-token.repository";
import { userRepository } from "@/features/auth/repositories/user.repository";
import type { ForgotPasswordInput } from "@/features/auth/validations/auth.schema";

const ONE_HOUR_MS = 60 * 60 * 1000;

/**
 * Issues a password-reset token for a salon (tenant) admin and emails the link,
 * pointing at the admin reset page. Mirrors the customer flow
 * (request-password-reset.usecase) but only acts on staff accounts — a
 * `customer` email gets no admin link. Intentionally silent about whether the
 * email exists so the route can always return a generic response.
 */
export async function requestAdminPasswordResetUseCase(
  input: ForgotPasswordInput,
  baseUrl: string,
): Promise<void> {
  const user = await userRepository.findByEmail(input.email);
  if (!user || user.role === "customer") return;

  const token = generateOpaqueToken();
  await resetTokenRepository.create(
    user.id,
    hashToken(token),
    new Date(Date.now() + ONE_HOUR_MS),
  );
  await sendPasswordReset(
    user.email,
    `${baseUrl}/admin/reset-password?token=${token}`,
  );
}
