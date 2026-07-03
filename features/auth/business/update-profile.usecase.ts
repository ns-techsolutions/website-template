import { ConflictError } from "@/lib/api/errors";

import { toUserDto } from "../mappers/user.mapper";
import { userRepository } from "../repositories/user.repository";
import type { UserDto } from "../types/auth.dto";
import type { UpdateProfileInput } from "../validations/auth.schema";

export async function updateProfileUseCase(
  userId: string,
  input: UpdateProfileInput,
): Promise<UserDto> {
  // Email is unique within the salon DB — reject if another user already has it.
  if (input.email) {
    const existing = await userRepository.findByEmail(input.email);
    if (existing && existing.id !== userId) {
      throw new ConflictError("An account with this email already exists.");
    }
  }

  const user = await userRepository.update(userId, {
    ...(input.name !== undefined && { name: input.name }),
    ...(input.email !== undefined && { email: input.email }),
    ...(input.phone !== undefined && { phone: input.phone || null }),
  });
  return toUserDto(user);
}
