import { createHash, randomBytes } from "node:crypto";

/**
 * Hashes an opaque token (password-reset, refresh) for storage. We persist only
 * the hash so a database leak never exposes a usable token. SHA-256 is fine here
 * because the input is high-entropy random bytes (not a low-entropy password).
 */
export const hashToken = (token: string): string =>
  createHash("sha256").update(token).digest("hex");

/** Generates a high-entropy opaque token (32 random bytes, hex-encoded). */
export const generateOpaqueToken = (): string =>
  randomBytes(32).toString("hex");
