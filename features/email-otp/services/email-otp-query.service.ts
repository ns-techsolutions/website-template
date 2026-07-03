"use client";

import { apiFetch } from "@/lib/api/client";

import type {
  RequestEmailOtpRequest,
  RequestEmailOtpResult,
} from "../types/email-otp.api";

/** Client-side fetcher for the email-otp endpoint (consumed by the hooks). */
export const emailOtpApi = {
  request: (body: RequestEmailOtpRequest) =>
    apiFetch<RequestEmailOtpResult>("/api/email-otp", { method: "POST", body }),
};
