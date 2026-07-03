import type { NextRequest } from "next/server";

import { withApi } from "@/lib/api/handler";
import { successJson } from "@/lib/api/response";
import { requireMaster } from "@/lib/auth/get-master-user";
import { paymentGatewayService } from "@/features/admin/payment-gateways/services/payment-gateway.service";

// Master-only: the platform-wide payment-gateway registry.
export const GET = withApi(async (req: NextRequest) => {
  await requireMaster(req);
  return successJson(await paymentGatewayService.list());
});
