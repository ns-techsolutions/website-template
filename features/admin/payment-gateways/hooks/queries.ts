"use client";

import { useQuery } from "@tanstack/react-query";

import { paymentGatewayKeys } from "../queries/payment-gateway.keys";
import { paymentGatewayApi } from "../services/payment-gateway-query.service";

export function usePaymentGateways() {
  return useQuery({
    queryKey: paymentGatewayKeys.lists(),
    queryFn: () => paymentGatewayApi.list(),
  });
}
