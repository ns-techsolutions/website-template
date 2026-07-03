import { controlDb } from "@/lib/db/control";
import type { PaymentGatewayDto } from "../types/payment-gateway.dto";

const select = { provider: true, label: true, enabled: true } as const;

export const paymentGatewayRepository = {
  listAll(): Promise<PaymentGatewayDto[]> {
    return controlDb.paymentGateway.findMany({
      orderBy: { provider: "asc" },
      select,
    });
  },

  setEnabled(provider: string, enabled: boolean): Promise<PaymentGatewayDto> {
    return controlDb.paymentGateway.update({
      where: { provider },
      data: { enabled },
      select,
    });
  },
};
