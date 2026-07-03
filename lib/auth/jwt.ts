import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.JWT_ACCESS_SECRET ?? "dev-only-change-me",
);
// Access tokens are short-lived now; the refresh token (httpOnly cookie, DB-backed)
// silently renews them. See lib/auth/refresh-cookie.ts and the refresh routes.
const ttl = process.env.JWT_ACCESS_TTL ?? "15m";

/** Which sign-in surface a token belongs to. Keeps customer and admin tokens
 *  from being usable against each other's endpoints. */
export type AuthScope = "customer" | "admin";

export interface JwtPayload {
  /** User id. */
  sub: string;
  email: string;
  scope: AuthScope;
}

export async function signAccessToken(payload: JwtPayload): Promise<string> {
  return new SignJWT({ email: payload.email, scope: payload.scope })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(ttl)
    .sign(secret);
}

/** Throws if the token is missing, malformed, tampered, or expired. */
export async function verifyAccessToken(token: string): Promise<JwtPayload> {
  const { payload } = await jwtVerify(token, secret);
  if (
    typeof payload.sub !== "string" ||
    typeof payload.email !== "string" ||
    (payload.scope !== "customer" && payload.scope !== "admin")
  ) {
    throw new Error("Malformed token payload");
  }
  return { sub: payload.sub, email: payload.email, scope: payload.scope };
}
