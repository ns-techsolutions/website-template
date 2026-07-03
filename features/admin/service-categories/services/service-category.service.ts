import { Prisma } from "@prisma/client";

import { ConflictError, NotFoundError } from "@/lib/api/errors";
import type { ServiceCategory } from "@/lib/admin/types";

import {
  serviceCategoryRepository,
  toServiceCategoryDto,
} from "../repositories/service-category.repository";
import {
  createServiceCategorySchema,
  updateServiceCategorySchema,
} from "../validations/service-category.schema";

function mapError(e: unknown): unknown {
  if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
    return new ConflictError("A category with this name already exists.");
  }
  return e;
}

export const serviceCategoryService = {
  async list(workspaceId: string): Promise<ServiceCategory[]> {
    return (await serviceCategoryRepository.list(workspaceId)).map(
      toServiceCategoryDto,
    );
  },

  async get(workspaceId: string, id: string): Promise<ServiceCategory> {
    const row = await serviceCategoryRepository.findById(workspaceId, id);
    if (!row) throw new NotFoundError("Category not found.");
    return toServiceCategoryDto(row);
  },

  async create(workspaceId: string, raw: unknown): Promise<ServiceCategory> {
    const input = createServiceCategorySchema.parse(raw);
    try {
      return toServiceCategoryDto(
        await serviceCategoryRepository.create(workspaceId, input),
      );
    } catch (e) {
      throw mapError(e);
    }
  },

  async update(
    workspaceId: string,
    id: string,
    raw: unknown,
  ): Promise<ServiceCategory> {
    const input = updateServiceCategorySchema.parse(raw);
    const existing = await serviceCategoryRepository.findById(workspaceId, id);
    if (!existing) throw new NotFoundError("Category not found.");
    try {
      return toServiceCategoryDto(
        await serviceCategoryRepository.update(id, input),
      );
    } catch (e) {
      throw mapError(e);
    }
  },

  async remove(workspaceId: string, id: string): Promise<ServiceCategory> {
    const existing = await serviceCategoryRepository.findById(workspaceId, id);
    if (!existing) throw new NotFoundError("Category not found.");
    return toServiceCategoryDto(await serviceCategoryRepository.remove(id));
  },
};
