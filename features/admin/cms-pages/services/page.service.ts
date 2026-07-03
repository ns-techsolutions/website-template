import { Prisma } from "@prisma/client";

import { ConflictError, NotFoundError } from "@/lib/api/errors";
import type { CmsPage } from "@/lib/admin/types";

import { pageRepository, toPageDto } from "../repositories/page.repository";
import { createPageSchema, updatePageSchema } from "../validations/page.schema";

function mapError(e: unknown): unknown {
  if (
    e instanceof Prisma.PrismaClientKnownRequestError &&
    e.code === "P2002"
  ) {
    return new ConflictError("A page with this URL path already exists.");
  }
  return e;
}

/** Server orchestration for CMS pages. All methods are scoped to a workspace. */
export const pageService = {
  async list(workspaceId: string): Promise<CmsPage[]> {
    const rows = await pageRepository.list(workspaceId);
    return rows.map(toPageDto);
  },

  async get(workspaceId: string, id: string): Promise<CmsPage> {
    const row = await pageRepository.findById(workspaceId, id);
    if (!row) throw new NotFoundError("Page not found.");
    return toPageDto(row);
  },

  async create(workspaceId: string, raw: unknown): Promise<CmsPage> {
    const input = createPageSchema.parse(raw);
    try {
      return toPageDto(await pageRepository.create(workspaceId, input));
    } catch (e) {
      throw mapError(e);
    }
  },

  async update(workspaceId: string, id: string, raw: unknown): Promise<CmsPage> {
    const input = updatePageSchema.parse(raw);
    const existing = await pageRepository.findById(workspaceId, id);
    if (!existing) throw new NotFoundError("Page not found.");
    try {
      return toPageDto(await pageRepository.update(id, input));
    } catch (e) {
      throw mapError(e);
    }
  },

  async remove(workspaceId: string, id: string): Promise<CmsPage> {
    const existing = await pageRepository.findById(workspaceId, id);
    if (!existing) throw new NotFoundError("Page not found.");
    return toPageDto(await pageRepository.remove(id));
  },
};
