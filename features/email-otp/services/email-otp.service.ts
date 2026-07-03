import { requestEmailOtpUseCase } from "../business/request-email-otp.usecase";
import type { RequestEmailOtpResult } from "../types/email-otp.api";
import { requestEmailOtpSchema } from "../validations/email-otp.schema";

/** Server-side orchestration used by the email-otp route handler. */
export const emailOtpService = {
  requestOtp(raw: unknown): Promise<RequestEmailOtpResult> {
    const input = requestEmailOtpSchema.parse(raw);
    return requestEmailOtpUseCase(input);
  },
};
