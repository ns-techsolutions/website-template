import { AppError } from "@/lib/api/errors";
import { verifyPassword } from "@/lib/auth/password";
import { controlDb } from "@/lib/db/control";

import type { SessionResult } from "@/features/auth/types/auth.dto";
import type { LoginInput } from "@/features/auth/validations/auth.schema";

import { issueMasterSession } from "./issue-master-session";

const invalidCredentials = () =>
  new AppError(401, "Invalid email or password.", "INVALID_CREDENTIALS");

/**
 * Signs a platform super-admin in against the CONTROL-PLANE database. Used on the
 * platform host; tenant admins sign in on their own salon domain (see
 * admin-login.usecase, which authenticates against that salon's database).
 */
export async function masterLoginUseCase(input: LoginInput): Promise<SessionResult> {
  const admin = await controlDb.masterAdmin.findUnique({
    where: { email: input.email },
  });
  if (!admin) throw invalidCredentials();

  const ok = await verifyPassword(input.password, admin.password);
  if (!ok) throw invalidCredentials();

  const session = await issueMasterSession(admin);
  return {
    user: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      phone: null,
      role: "master",
      workspaceId: null,
    },
    ...session,
  };
}
