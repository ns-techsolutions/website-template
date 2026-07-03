import { Prisma } from "@prisma/client";

import { getTenantDb } from "@/lib/db/tenant";
import type { Block, CmsPage, CmsPageSeo } from "@/lib/admin/types";
import type { CreatePageInput, UpdatePageInput } from "../validations/page.schema";

type Row = Prisma.CmsPageGetPayload<object>;

const json = (v: unknown) => v as unknown as Prisma.InputJsonValue;

/** Maps a persisted row to the client-facing CMS page shape. */
export function toPageDto(row: Row): CmsPage {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    status: row.status,
    updatedAt: row.updatedAt.toISOString(),
    blocks: (row.blocks ?? []) as unknown as Block[],
    seo: (row.seo ?? {
      title: "",
      description: "",
      ogImage: "",
    }) as unknown as CmsPageSeo,
  };
}

export const pageRepository = {
  async list(workspaceId: string): Promise<Row[]> {
    const db = await getTenantDb();
    return db.cmsPage.findMany({
      where: { workspaceId },
      orderBy: { updatedAt: "desc" },
    });
  },

  async findById(workspaceId: string, id: string): Promise<Row | null> {
    const db = await getTenantDb();
    return db.cmsPage.findFirst({ where: { id, workspaceId } });
  },

  async findBySlug(workspaceId: string, slug: string): Promise<Row | null> {
    const db = await getTenantDb();
    return db.cmsPage.findFirst({ where: { slug, workspaceId } });
  },

  async create(workspaceId: string, input: CreatePageInput): Promise<Row> {
    const db = await getTenantDb();
    return db.cmsPage.create({
      data: {
        workspaceId,
        title: input.title,
        slug: input.slug,
        status: "draft",
        blocks: json([]),
        seo: json({ title: "", description: "", ogImage: "" }),
      },
    });
  },

  async update(id: string, input: UpdatePageInput): Promise<Row> {
    const db = await getTenantDb();
    return db.cmsPage.update({
      where: { id },
      data: {
        ...(input.title !== undefined && { title: input.title }),
        ...(input.slug !== undefined && { slug: input.slug }),
        ...(input.status !== undefined && { status: input.status }),
        ...(input.blocks !== undefined && { blocks: json(input.blocks) }),
        ...(input.seo !== undefined && { seo: json(input.seo) }),
      },
    });
  },

  async remove(id: string): Promise<Row> {
    const db = await getTenantDb();
    return db.cmsPage.delete({ where: { id } });
  },
};
