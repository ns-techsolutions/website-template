import type { NextRequest } from "next/server";

import { withApi } from "@/lib/api/handler";
import { successJson } from "@/lib/api/response";
import { requireStaff } from "@/lib/auth/get-auth-user";
import { getActiveWorkspaceId } from "@/lib/auth/workspace";
import type { LeaveStatus } from "@/lib/admin/types";
import { leaveService } from "@/features/admin/leave/services/leave.service";

const STATUSES = ["pending", "approved", "rejected"] as const;

export const GET = withApi(async (req: NextRequest) => {
  const user = await requireStaff(req);
  const workspaceId = await getActiveWorkspaceId(req, user);
  const raw = req.nextUrl.searchParams.get("status") ?? "";
  const status = (STATUSES as readonly string[]).includes(raw)
    ? (raw as LeaveStatus)
    : undefined;
  return successJson(await leaveService.list(workspaceId, status));
});

export const POST = withApi(async (req: NextRequest) => {
  const user = await requireStaff(req);
  const workspaceId = await getActiveWorkspaceId(req, user);
  const body = await req.json().catch(() => ({}));
  const leave = await leaveService.create(workspaceId, body);
  return successJson(leave, { status: 201, message: "Leave request submitted" });
});
