import type { NextRequest } from "next/server";

import { withApi } from "@/lib/api/handler";
import { successJson } from "@/lib/api/response";
import { requireStaff } from "@/lib/auth/get-auth-user";
import { requirePermission } from "@/lib/auth/require-permission";
import { customerService } from "@/features/admin/customers/services/customer.service";

export const GET = withApi(async (req: NextRequest) => {
  await requireStaff(req);
  const q = req.nextUrl.searchParams.get("q")?.trim() || undefined;
  return successJson(await customerService.list(q));
});

export const POST = withApi(async (req: NextRequest) => {
  await requirePermission(req, "customers.manage");
  const body = await req.json().catch(() => ({}));
  const customer = await customerService.create(body);
  return successJson(customer, { status: 201, message: "Customer created" });
});
