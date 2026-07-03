import { z } from "zod";

export const emailOtpPurposeSchema = z.enum(["signup", "booking"]);

/** A 6-digit numeric code. Reused by the register and booking payloads. */
export const otpCodeSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, "Enter the 6-digit code");

export const requestEmailOtpSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  purpose: emailOtpPurposeSchema,
});

export type RequestEmailOtpInput = z.infer<typeof requestEmailOtpSchema>;
