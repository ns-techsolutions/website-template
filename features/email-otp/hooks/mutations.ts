"use client";

import { useAppMutation } from "@/lib/query/use-app-mutation";

import { emailOtpApi } from "../services/email-otp-query.service";
import type { RequestEmailOtpRequest } from "../types/email-otp.api";

/**
 * Requests a verification code. The forms drive their own messaging (inline step
 * transitions), so this opts out of the generic success toast.
 */
export function useRequestEmailOtp() {
  return useAppMutation({
    mutationFn: (input: RequestEmailOtpRequest) => emailOtpApi.request(input),
    showSuccessToast: false,
  });
}
