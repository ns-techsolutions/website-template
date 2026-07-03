import { BadRequestError, UnauthorizedError } from "@/lib/api/errors";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

import { userRepository } from "../repositories/user.repository";
import type { ChangePasswordInput } from "../validations/auth.schema";

export async function changePasswordUseCase(
  userId: string,
  input: ChangePasswordInput,
): Promise<void> {
  const user = await userRepository.findById(userId);
  if (!user) throw new UnauthorizedError();

  const ok = await verifyPassword(input.currentPassword, user.password);
  if (!ok) throw new BadRequestError("Your current password is incorrect.");

  await userRepository.updatePassword(userId, await hashPassword(input.newPassword));
}
