import { BadRequestError, ConflictError } from "@/lib/api/errors";
import { hashToken } from "@/lib/auth/hash-token";
import { generateOtpCode } from "@/lib/auth/otp";
import { isTenantEmailEnabled, sendEmailOtp } from "@/lib/mail";
import { userRepository } from "@/features/auth/repositories/user.repository";

import { emailOtpRepository } from "../repositories/email-otp.repository";
import type { RequestEmailOtpResult } from "../types/email-otp.api";
import type { RequestEmailOtpInput } from "../validations/email-otp.schema";

const TEN_MINUTES_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;

/**
 * Issues a one-time passcode for an email + flow and emails it. Returns
 * `{ required: false }` (no code sent) when the salon can't deliver email, so the
 * client degrades to the unverified flow. Mirrors request-password-reset.usecase.
 */
export async function requestEmailOtpUseCase(
  input: RequestEmailOtpInput,
): Promise<RequestEmailOtpResult> {
  // Surface a taken email early so signup doesn't waste a verification round-trip.
  // registerUseCase re-checks at create time, so this is purely UX.
  if (input.purpose === "signup") {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictError("An account with this email already exists.");
    }
  }

  if (!(await isTenantEmailEnabled())) {
    return { required: false };
  }

  const latest = await emailOtpRepository.findLatestActive(
    input.email,
    input.purpose,
  );
  if (latest && Date.now() - latest.createdAt.getTime() < RESEND_COOLDOWN_MS) {
    throw new BadRequestError(
      "Please wait a moment before requesting another code.",
    );
  }

  await emailOtpRepository.deleteActiveFor(input.email, input.purpose);

  const code = generateOtpCode();
  await emailOtpRepository.create(
    input.email,
    input.purpose,
    hashToken(code),
    new Date(Date.now() + TEN_MINUTES_MS),
  );
  await sendEmailOtp(input.email, code, input.purpose);

  return { required: true };
}
