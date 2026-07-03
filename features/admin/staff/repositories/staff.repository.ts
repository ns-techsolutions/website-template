import { Prisma } from "@prisma/client";

import { getTenantDb } from "@/lib/db/tenant";
import type { StaffMember } from "@/lib/admin/types";
import type {
  CreateStaffInput,
  UpdateStaffInput,
} from "../validations/staff.schema";

type Row = Prisma.StaffGetPayload<object>;

const today = () => new Date().toISOString().slice(0, 10);

export function toStaffDto(row: Row): StaffMember {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone ?? "",
    roleId: row.roleId ?? "",
    role: row.role,
    specialties: row.specialties,
    status: row.status,
    image: row.image ?? "",
    joinedDate: row.joinedDate,
  };
}

export const staffRepository = {
  async list(workspaceId: string): Promise<Row[]> {
    const db = await getTenantDb();
    return db.staff.findMany({
      where: { workspaceId },
      orderBy: { name: "asc" },
    });
  },

  async listActive(workspaceId: string): Promise<Row[]> {
    const db = await getTenantDb();
    return db.staff.findMany({
      where: { workspaceId, status: "active" },
      orderBy: { name: "asc" },
    });
  },

  async findById(workspaceId: string, id: string): Promise<Row | null> {
    const db = await getTenantDb();
    return db.staff.findFirst({ where: { id, workspaceId } });
  },

  async create(workspaceId: string, input: CreateStaffInput): Promise<Row> {
    const db = await getTenantDb();
    return db.staff.create({
      data: {
        workspaceId,
        name: input.name,
        email: input.email,
        phone: input.phone ?? null,
        role: input.role ?? "",
        roleId: input.roleId ?? null,
        specialties: input.specialties ?? [],
        status: input.status ?? "active",
        image: input.image ?? "",
        joinedDate: input.joinedDate ?? today(),
      },
    });
  },

  async update(id: string, input: UpdateStaffInput): Promise<Row> {
    const db = await getTenantDb();
    return db.staff.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.email !== undefined && { email: input.email }),
        ...(input.phone !== undefined && { phone: input.phone || null }),
        ...(input.role !== undefined && { role: input.role }),
        ...(input.roleId !== undefined && { roleId: input.roleId || null }),
        ...(input.specialties !== undefined && {
          specialties: input.specialties,
        }),
        ...(input.status !== undefined && { status: input.status }),
        ...(input.image !== undefined && { image: input.image }),
        ...(input.joinedDate !== undefined && { joinedDate: input.joinedDate }),
      },
    });
  },

  async remove(id: string): Promise<Row> {
    const db = await getTenantDb();
    return db.staff.delete({ where: { id } });
  },
};
