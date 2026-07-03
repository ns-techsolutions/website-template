"use client";

import { useAppMutation } from "@/lib/query/use-app-mutation";
import { paymentGatewayKeys } from "../queries/payment-gateway.keys";
import { paymentGatewayApi } from "../services/payment-gateway-query.service";

export function useSetGatewayEnabled() {
  return useAppMutation({
    mutationFn: ({ provider, enabled }: { provider: string; enabled: boolean }) =>
      paymentGatewayApi.setEnabled(provider, enabled),
    invalidateKeys: [paymentGatewayKeys.lists()],
    successMessage: "Payment gateway updated",
  });
}
