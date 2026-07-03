/** Roles mirror the Prisma `UserRole` enum. */
export type UserRole = "master" | "tenant" | "customer";

/** Safe user shape returned to clients (never includes the password). */
export interface UserDto {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  /** Bound workspace for `tenant` users; null for master/customer. */
  workspaceId: string | null;
}

export interface AuthResult {
  user: UserDto;
  token: string;
}

/**
 * Internal result of a sign-in/refresh. Carries the raw refresh token so the
 * route handler can drop it into the httpOnly cookie; it is never sent in the
 * JSON body (the client only ever sees `{ user, token }`).
 */
export interface SessionResult {
  user: UserDto;
  /** Short-lived access token. */
  token: string;
  /** Opaque refresh token — set as an httpOnly cookie by the route. */
  refreshToken: string;
}
