export const paymentGatewayKeys = {
  all: ["payment-gateways"] as const,
  lists: () => [...paymentGatewayKeys.all, "list"] as const,
};
