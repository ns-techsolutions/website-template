import type { NextRequest } from "next/server";

import { withApi } from "@/lib/api/handler";
import { successJson } from "@/lib/api/response";
import { requireMaster } from "@/lib/auth/get-master-user";
import { paymentGatewayService } from "@/features/admin/payment-gateways/services/payment-gateway.service";

type Ctx = { params: Promise<{ provider: string }> };

export const PATCH = withApi<Ctx>(async (req: NextRequest, ctx) => {
  await requireMaster(req);
  const { provider } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const gateway = await paymentGatewayService.setEnabled(provider, body);
  return successJson(gateway, { message: "Gateway updated" });
});
