import { NotFoundError } from "@/lib/api/errors";
import { deleteMedia, uploadMedia } from "@/lib/storage";
import type { MediaAsset } from "@/lib/admin/types";

import { mediaRepository, toMediaDto } from "../repositories/media.repository";

export interface UploadInput {
  buffer: ArrayBuffer;
  name: string;
  type: string;
  size: number;
  width: number;
  height: number;
}

/** Strips path separators so a filename can't escape the workspace folder. */
function safeName(name: string): string {
  return name.replace(/[^\w.\-]+/g, "-").slice(0, 120) || "file";
}

export const mediaService = {
  async list(workspaceId: string): Promise<MediaAsset[]> {
    return (await mediaRepository.list(workspaceId)).map(toMediaDto);
  },

  async create(workspaceId: string, input: UploadInput): Promise<MediaAsset> {
    const name = safeName(input.name);
    const path = `${workspaceId}/${crypto.randomUUID()}-${name}`;
    const { path: storedPath, publicUrl } = await uploadMedia(
      path,
      input.buffer,
      input.type,
    );

    const row = await mediaRepository.create({
      workspaceId,
      name: input.name,
      url: publicUrl,
      path: storedPath,
      sizeKb: Math.max(1, Math.round(input.size / 1024)),
      width: input.width,
      height: input.height,
    });
    return toMediaDto(row);
  },

  async remove(workspaceId: string, id: string): Promise<MediaAsset> {
    const existing = await mediaRepository.findById(workspaceId, id);
    if (!existing) throw new NotFoundError("Media asset not found.");
    if (existing.path) await deleteMedia(existing.path);
    return toMediaDto(await mediaRepository.remove(id));
  },
};
