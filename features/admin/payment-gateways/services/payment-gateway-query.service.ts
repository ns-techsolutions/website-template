"use client";

import { apiFetch } from "@/lib/api/client";
import type { PaymentGatewayDto } from "../types/payment-gateway.dto";

// Platform-level (master only) — no workspace headers; reads the control plane.
export const paymentGatewayApi = {
  list: () =>
    apiFetch<PaymentGatewayDto[]>("/api/payment-gateways", {
      method: "GET",
      auth: "admin",
    }),

  setEnabled: (provider: string, enabled: boolean) =>
    apiFetch<PaymentGatewayDto>(`/api/payment-gateways/${provider}`, {
      method: "PATCH",
      body: { enabled },
      auth: "admin",
    }),
};
