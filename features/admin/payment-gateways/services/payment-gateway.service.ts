import { Prisma } from "@/lib/db/generated/control";
import { NotFoundError } from "@/lib/api/errors";

import { paymentGatewayRepository } from "../repositories/payment-gateway.repository";
import type { PaymentGatewayDto } from "../types/payment-gateway.dto";
import { updateGatewaySchema } from "../validations/payment-gateway.schema";

export const paymentGatewayService = {
  list(): Promise<PaymentGatewayDto[]> {
    return paymentGatewayRepository.listAll();
  },

  async setEnabled(provider: string, raw: unknown): Promise<PaymentGatewayDto> {
    const { enabled } = updateGatewaySchema.parse(raw);
    try {
      return await paymentGatewayRepository.setEnabled(provider, enabled);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
        throw new NotFoundError("Payment gateway not found.");
      }
      throw e;
    }
  },
};
