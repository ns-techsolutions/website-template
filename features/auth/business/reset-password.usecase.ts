import { BadRequestError } from "@/lib/api/errors";
import { hashPassword } from "@/lib/auth/password";

import { resetTokenRepository } from "../repositories/reset-token.repository";
import { userRepository } from "../repositories/user.repository";
import type { ResetPasswordInput } from "../validations/auth.schema";
import { hashToken } from "@/lib/auth/hash-token";

export async function resetPasswordUseCase(
  input: ResetPasswordInput,
): Promise<void> {
  const row = await resetTokenRepository.findValid(hashToken(input.token));
  if (!row) {
    throw new BadRequestError("This reset link is invalid or has expired.");
  }
  await userRepository.updatePassword(
    row.userId,
    await hashPassword(input.newPassword),
  );
  await resetTokenRepository.markUsed(row.id);
}
