import type { NextRequest } from "next/server";

import { BadRequestError } from "@/lib/api/errors";
import { withApi } from "@/lib/api/handler";
import { successJson } from "@/lib/api/response";
import { requireStaff } from "@/lib/auth/get-auth-user";
import { getActiveWorkspaceId } from "@/lib/auth/workspace";
import { mediaService } from "@/features/admin/cms-media/services/media.service";

export const GET = withApi(async (req: NextRequest) => {
  const user = await requireStaff(req);
  const workspaceId = await getActiveWorkspaceId(req, user);
  return successJson(await mediaService.list(workspaceId));
});

export const POST = withApi(async (req: NextRequest) => {
  const user = await requireStaff(req);
  const workspaceId = await getActiveWorkspaceId(req, user);

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    throw new BadRequestError("No file was provided.");
  }

  const asset = await mediaService.create(workspaceId, {
    buffer: await file.arrayBuffer(),
    name: file.name,
    type: file.type || "application/octet-stream",
    size: file.size,
    width: Number(form.get("width") ?? 0) || 0,
    height: Number(form.get("height") ?? 0) || 0,
  });

  return successJson(asset, { status: 201, message: "File uploaded" });
});
