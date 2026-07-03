import { Prisma } from "@prisma/client";

import { getTenantDb } from "@/lib/db/tenant";
import type { ServiceCategory } from "@/lib/admin/types";
import type {
  CreateServiceCategoryInput,
  UpdateServiceCategoryInput,
} from "../validations/service-category.schema";

const withCount = {
  include: { _count: { select: { services: true } } },
} satisfies Prisma.ServiceCategoryDefaultArgs;

type Row = Prisma.ServiceCategoryGetPayload<typeof withCount>;

export function toServiceCategoryDto(row: Row): ServiceCategory {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    serviceCount: row._count.services,
    status: row.status,
  };
}

export const serviceCategoryRepository = {
  async list(workspaceId: string): Promise<Row[]> {
    const db = await getTenantDb();
    return db.serviceCategory.findMany({
      where: { workspaceId },
      orderBy: { name: "asc" },
      ...withCount,
    });
  },

  async findById(workspaceId: string, id: string): Promise<Row | null> {
    const db = await getTenantDb();
    return db.serviceCategory.findFirst({
      where: { id, workspaceId },
      ...withCount,
    });
  },

  async create(
    workspaceId: string,
    input: CreateServiceCategoryInput,
  ): Promise<Row> {
    const db = await getTenantDb();
    return db.serviceCategory.create({
      data: {
        workspaceId,
        name: input.name,
        description: input.description ?? "",
        status: input.status ?? "active",
      },
      ...withCount,
    });
  },

  async update(id: string, input: UpdateServiceCategoryInput): Promise<Row> {
    const db = await getTenantDb();
    return db.serviceCategory.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.description !== undefined && {
          description: input.description,
        }),
        ...(input.status !== undefined && { status: input.status }),
      },
      ...withCount,
    });
  },

  async remove(id: string): Promise<Row> {
    const db = await getTenantDb();
    return db.serviceCategory.delete({ where: { id }, ...withCount });
  },
};
