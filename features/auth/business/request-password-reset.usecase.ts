import { sendPasswordReset } from "@/lib/mail";
import { generateOpaqueToken, hashToken } from "@/lib/auth/hash-token";

import { resetTokenRepository } from "../repositories/reset-token.repository";
import { userRepository } from "../repositories/user.repository";
import type { ForgotPasswordInput } from "../validations/auth.schema";

const ONE_HOUR_MS = 60 * 60 * 1000;

/**
 * Issues a password-reset token and emails the link. Intentionally silent about
 * whether the email exists — the caller always returns a generic 200.
 */
export async function requestPasswordResetUseCase(
  input: ForgotPasswordInput,
  baseUrl: string,
): Promise<void> {
  const user = await userRepository.findByEmail(input.email);
  if (!user) return;

  const token = generateOpaqueToken();
  await resetTokenRepository.create(
    user.id,
    hashToken(token),
    new Date(Date.now() + ONE_HOUR_MS),
  );
  await sendPasswordReset(
    user.email,
    `${baseUrl}/reset-password?token=${token}`,
  );
}
