import { Prisma } from "@prisma/client";

import { getTenantDb } from "@/lib/db/tenant";
import type { MediaAsset } from "@/lib/admin/types";

type Row = Prisma.MediaAssetGetPayload<object>;

export function toMediaDto(row: Row): MediaAsset {
  return {
    id: row.id,
    name: row.name,
    url: row.url,
    sizeKb: row.sizeKb,
    width: row.width,
    height: row.height,
    uploadedAt: row.uploadedAt.toISOString(),
  };
}

export const mediaRepository = {
  async list(workspaceId: string): Promise<Row[]> {
    const db = await getTenantDb();
    return db.mediaAsset.findMany({
      where: { workspaceId },
      orderBy: { uploadedAt: "desc" },
    });
  },

  async findById(workspaceId: string, id: string): Promise<Row | null> {
    const db = await getTenantDb();
    return db.mediaAsset.findFirst({ where: { id, workspaceId } });
  },

  async create(data: {
    workspaceId: string;
    name: string;
    url: string;
    path: string;
    sizeKb: number;
    width: number;
    height: number;
  }): Promise<Row> {
    const db = await getTenantDb();
    return db.mediaAsset.create({ data });
  },

  async remove(id: string): Promise<Row> {
    const db = await getTenantDb();
    return db.mediaAsset.delete({ where: { id } });
  },
};
