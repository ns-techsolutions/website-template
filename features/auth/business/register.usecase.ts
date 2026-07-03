import { ConflictError } from "@/lib/api/errors";
import { hashPassword } from "@/lib/auth/password";

import { issueTenantSession } from "./issue-tenant-session";
import { toUserDto } from "../mappers/user.mapper";
import { userRepository } from "../repositories/user.repository";
import type { SessionResult } from "../types/auth.dto";
import type { RegisterInput } from "../validations/auth.schema";

export async function registerUseCase(input: RegisterInput): Promise<SessionResult> {
  const existing = await userRepository.findByEmail(input.email);
  if (existing) {
    throw new ConflictError("An account with this email already exists.");
  }

  const password = await hashPassword(input.password);
  const user = await userRepository.create({
    name: input.name,
    email: input.email,
    phone: input.phone || null,
    password,
  });

  const session = await issueTenantSession(user, "customer");
  return { user: toUserDto(user), ...session };
}
