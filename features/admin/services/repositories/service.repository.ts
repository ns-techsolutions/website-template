import { Prisma } from "@prisma/client";

import { getTenantDb } from "@/lib/db/tenant";
import type { Service } from "@/lib/admin/types";
import type {
  CreateServiceInput,
  UpdateServiceInput,
} from "../validations/service.schema";

const withCategory = {
  include: { category: { select: { name: true } } },
} satisfies Prisma.ServiceDefaultArgs;

type Row = Prisma.ServiceGetPayload<typeof withCategory>;

export function toServiceDto(row: Row): Service {
  return {
    id: row.id,
    name: row.name,
    categoryId: row.categoryId,
    category: row.category.name,
    description: row.description,
    price: row.price,
    duration: row.duration,
    status: row.status,
    requiresDeposit: row.requiresDeposit,
    depositAmount: row.depositAmount,
  };
}

export const serviceRepository = {
  async list(workspaceId: string, categoryId?: string): Promise<Row[]> {
    const db = await getTenantDb();
    return db.service.findMany({
      where: { workspaceId, ...(categoryId ? { categoryId } : {}) },
      orderBy: { name: "asc" },
      ...withCategory,
    });
  },

  async listActive(workspaceId: string): Promise<Row[]> {
    const db = await getTenantDb();
    return db.service.findMany({
      where: { workspaceId, status: "active" },
      orderBy: { name: "asc" },
      ...withCategory,
    });
  },

  async findById(workspaceId: string, id: string): Promise<Row | null> {
    const db = await getTenantDb();
    return db.service.findFirst({ where: { id, workspaceId }, ...withCategory });
  },

  async create(workspaceId: string, input: CreateServiceInput): Promise<Row> {
    const db = await getTenantDb();
    return db.service.create({
      data: {
        workspaceId,
        categoryId: input.categoryId,
        name: input.name,
        description: input.description ?? "",
        price: input.price,
        duration: input.duration,
        status: input.status ?? "active",
        requiresDeposit: input.requiresDeposit ?? false,
        depositAmount: input.depositAmount ?? null,
      },
      ...withCategory,
    });
  },

  async update(id: string, input: UpdateServiceInput): Promise<Row> {
    const db = await getTenantDb();
    return db.service.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.categoryId !== undefined && { categoryId: input.categoryId }),
        ...(input.description !== undefined && {
          description: input.description,
        }),
        ...(input.price !== undefined && { price: input.price }),
        ...(input.duration !== undefined && { duration: input.duration }),
        ...(input.status !== undefined && { status: input.status }),
        ...(input.requiresDeposit !== undefined && {
          requiresDeposit: input.requiresDeposit,
        }),
        ...(input.depositAmount !== undefined && {
          depositAmount: input.depositAmount,
        }),
      },
      ...withCategory,
    });
  },

  async remove(id: string): Promise<Row> {
    const db = await getTenantDb();
    return db.service.delete({ where: { id }, ...withCategory });
  },
};
