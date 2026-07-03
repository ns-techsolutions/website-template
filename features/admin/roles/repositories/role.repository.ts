import { Prisma } from "@prisma/client";

import { getTenantDb } from "@/lib/db/tenant";
import type { Role } from "@/lib/admin/types";
import type {
  CreateRoleInput,
  UpdateRoleInput,
} from "../validations/role.schema";

const withCount = {
  include: { _count: { select: { staff: true } } },
} satisfies Prisma.RoleDefaultArgs;

type Row = Prisma.RoleGetPayload<typeof withCount>;

export function toRoleDto(row: Row): Role {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    staffCount: row._count.staff,
    permissions: row.permissions,
  };
}

export const roleRepository = {
  async list(workspaceId: string): Promise<Row[]> {
    const db = await getTenantDb();
    return db.role.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "asc" },
      ...withCount,
    });
  },

  async findById(workspaceId: string, id: string): Promise<Row | null> {
    const db = await getTenantDb();
    return db.role.findFirst({ where: { id, workspaceId }, ...withCount });
  },

  async create(workspaceId: string, input: CreateRoleInput): Promise<Row> {
    const db = await getTenantDb();
    return db.role.create({
      data: {
        workspaceId,
        name: input.name,
        description: input.description ?? "",
        permissions: input.permissions ?? [],
      },
      ...withCount,
    });
  },

  async update(id: string, input: UpdateRoleInput): Promise<Row> {
    const db = await getTenantDb();
    return db.role.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.permissions !== undefined && { permissions: input.permissions }),
      },
      ...withCount,
    });
  },

  async remove(id: string): Promise<Row> {
    // Staff.roleId is `onDelete: SetNull`, so assigned staff are simply unassigned.
    const db = await getTenantDb();
    return db.role.delete({ where: { id }, ...withCount });
  },
};
