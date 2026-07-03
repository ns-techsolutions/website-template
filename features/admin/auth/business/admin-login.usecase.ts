import { AppError } from "@/lib/api/errors";
import { verifyPassword } from "@/lib/auth/password";

import { issueTenantSession } from "@/features/auth/business/issue-tenant-session";
import { toUserDto } from "@/features/auth/mappers/user.mapper";
import { userRepository } from "@/features/auth/repositories/user.repository";
import type { SessionResult } from "@/features/auth/types/auth.dto";
import type { LoginInput } from "@/features/auth/validations/auth.schema";

const invalidCredentials = () =>
  new AppError(401, "Invalid email or password.", "INVALID_CREDENTIALS");

/**
 * Signs a panel user in. Only `master` and `tenant` accounts may use the admin
 * panel — `customer` accounts are rejected with the same generic error so the
 * login form never reveals which accounts exist. Issues an `admin`-scope session.
 */
export async function adminLoginUseCase(input: LoginInput): Promise<SessionResult> {
  const user = await userRepository.findByEmail(input.email);
  if (!user) throw invalidCredentials();

  const ok = await verifyPassword(input.password, user.password);
  if (!ok) throw invalidCredentials();

  if (user.role === "customer") throw invalidCredentials();

  const session = await issueTenantSession(user, "admin");
  return { user: toUserDto(user), ...session };
}
