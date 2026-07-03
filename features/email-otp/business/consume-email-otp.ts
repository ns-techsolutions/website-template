import { BadRequestError } from "@/lib/api/errors";
import { hashToken } from "@/lib/auth/hash-token";
import { isTenantEmailEnabled } from "@/lib/mail";

import { emailOtpRepository } from "../repositories/email-otp.repository";
import type { EmailOtpPurpose } from "../types/email-otp.api";

const MAX_ATTEMPTS = 5;

/**
 * Verifies and consumes a one-time passcode, throwing a 400 on any failure.
 * Called from registerUseCase (signup) and createBookingUseCase (guest booking).
 *
 * Degrades in lockstep with the request side: when the salon can't deliver email
 * no code was ever issued, so verification is skipped. `email` must be lowercased
 * (the register/booking schemas normalize it) to match the stored row.
 */
export async function consumeEmailOtp(
  email: string,
  purpose: EmailOtpPurpose,
  code?: string,
): Promise<void> {
  if (!(await isTenantEmailEnabled())) return;

  if (!code) {
    throw new BadRequestError("Enter the verification code we emailed you.");
  }

  const row = await emailOtpRepository.findLatestActive(email, purpose);
  if (!row) {
    throw new BadRequestError("Your code has expired. Request a new one.");
  }
  if (row.attempts >= MAX_ATTEMPTS) {
    throw new BadRequestError("Too many attempts. Request a new code.");
  }
  if (hashToken(code) !== row.codeHash) {
    await emailOtpRepository.incrementAttempts(row.id);
    throw new BadRequestError("Incorrect code. Please try again.");
  }

  await emailOtpRepository.markConsumed(row.id);
}
