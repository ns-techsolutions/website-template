import type { UserRole } from "@prisma/client";

/**
 * The authenticated principal for a request. Resolved either from a salon's
 * tenant database (`tenant`/`customer`, see get-auth-user) or from the
 * control-plane (`master`, see get-master-user).
 */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  /** Bound workspace for `tenant` users; null for master/customer. */
  workspaceId: string | null;
}
