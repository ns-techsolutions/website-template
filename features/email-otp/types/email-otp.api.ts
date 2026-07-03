/** The flow an OTP belongs to. Mirrors the `EmailOtpPurpose` Prisma enum. */
export type EmailOtpPurpose = "signup" | "booking";

/** Client -> server payload to request a verification code. */
export interface RequestEmailOtpRequest {
  email: string;
  purpose: EmailOtpPurpose;
}

/**
 * `required` is false when the salon can't deliver email — the client then skips
 * the code step and performs the real action (register / book) unverified.
 */
export interface RequestEmailOtpResult {
  required: boolean;
}
