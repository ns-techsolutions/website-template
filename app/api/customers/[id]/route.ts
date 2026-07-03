import type { NextRequest } from "next/server";

import { withApi } from "@/lib/api/handler";
import { successJson } from "@/lib/api/response";
import { requireStaff } from "@/lib/auth/get-auth-user";
import { requirePermission } from "@/lib/auth/require-permission";
import { customerService } from "@/features/admin/customers/services/customer.service";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withApi<Ctx>(async (req: NextRequest, ctx) => {
  await requireStaff(req);
  const { id } = await ctx.params;
  return successJson(await customerService.get(id));
});

export const PATCH = withApi<Ctx>(async (req: NextRequest, ctx) => {
  await requirePermission(req, "customers.manage");
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const customer = await customerService.update(id, body);
  return successJson(customer, { message: "Customer saved" });
});
