import type { NextRequest } from "next/server";

import { withApi } from "@/lib/api/handler";
import { successJson } from "@/lib/api/response";
import { requireStaff } from "@/lib/auth/get-auth-user";
import { getActiveWorkspaceId } from "@/lib/auth/workspace";
import { pageService } from "@/features/admin/cms-pages/services/page.service";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withApi<Ctx>(async (req: NextRequest, ctx) => {
  const user = await requireStaff(req);
  const workspaceId = await getActiveWorkspaceId(req, user);
  const { id } = await ctx.params;
  const page = await pageService.get(workspaceId, id);
  return successJson(page);
});

export const PATCH = withApi<Ctx>(async (req: NextRequest, ctx) => {
  const user = await requireStaff(req);
  const workspaceId = await getActiveWorkspaceId(req, user);
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const page = await pageService.update(workspaceId, id, body);
  return successJson(page, { message: "Page saved" });
});

export const DELETE = withApi<Ctx>(async (req: NextRequest, ctx) => {
  const user = await requireStaff(req);
  const workspaceId = await getActiveWorkspaceId(req, user);
  const { id } = await ctx.params;
  const page = await pageService.remove(workspaceId, id);
  return successJson(page, { message: "Page deleted" });
});
