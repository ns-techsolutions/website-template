import { AppError } from "@/lib/api/errors";
import { verifyPassword } from "@/lib/auth/password";

import { issueTenantSession } from "./issue-tenant-session";
import { toUserDto } from "../mappers/user.mapper";
import { userRepository } from "../repositories/user.repository";
import type { SessionResult } from "../types/auth.dto";
import type { LoginInput } from "../validations/auth.schema";

const invalidCredentials = () =>
  new AppError(401, "Invalid email or password.", "INVALID_CREDENTIALS");

export async function loginUseCase(input: LoginInput): Promise<SessionResult> {
  const user = await userRepository.findByEmail(input.email);
  if (!user) throw invalidCredentials();

  const ok = await verifyPassword(input.password, user.password);
  if (!ok) throw invalidCredentials();

  const session = await issueTenantSession(user, "customer");
  return { user: toUserDto(user), ...session };
}
