import type { NextRequest } from "next/server";

import { withApi } from "@/lib/api/handler";
import { successJson } from "@/lib/api/response";
import { requireStaff } from "@/lib/auth/get-auth-user";
import { dashboardService } from "@/features/admin/dashboard/services/dashboard.service";

// Admin dashboard summary, aggregated from this salon's database.
export const GET = withApi(async (req: NextRequest) => {
  await requireStaff(req);
  return successJson(await dashboardService.get());
});
