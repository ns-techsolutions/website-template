import type { UserRole } from "./auth.dto";

/** Full persisted user row (includes the password hash). Repository-level type. */
export interface UserEntity {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  password: string;
  role: UserRole;
  workspaceId: string | null;
  createdAt: Date;
  updatedAt: Date;
}
