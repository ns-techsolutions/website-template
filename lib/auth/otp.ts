import { randomInt } from "node:crypto";

/**
 * Generates a 6-digit numeric one-time passcode (leading zeros preserved).
 * `randomInt` draws from a cryptographically secure source. The low entropy is
 * acceptable for short-lived email OTPs: delivery is out-of-band and verification
 * is bounded by a short expiry, an attempt cap, and a per-email resend cooldown
 * (see features/email-otp). Hash it with `hashToken` before storing.
 */
export const generateOtpCode = (): string =>
  randomInt(0, 1_000_000).toString().padStart(6, "0");
