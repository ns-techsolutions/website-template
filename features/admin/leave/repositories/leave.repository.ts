import type {
  LeaveRequest as LeaveRequestModel,
  LeaveStatusDb,
  LeaveTypeDb,
} from "@prisma/client";

import { getTenantDb } from "@/lib/db/tenant";
import type { LeaveRequest, LeaveStatus, LeaveType } from "@/lib/admin/types";

const DAY_MS = 86_400_000;

// Inclusive day count between two date-only values (min 1).
function daysBetween(from: Date, to: Date): number {
  return Math.max(1, Math.round((to.getTime() - from.getTime()) / DAY_MS) + 1);
}

export function toLeaveDto(row: LeaveRequestModel): LeaveRequest {
  return {
    id: row.id,
    staff: row.staff,
    staffId: row.staffId,
    type: row.type as LeaveType,
    from: row.from.toISOString().slice(0, 10),
    to: row.to.toISOString().slice(0, 10),
    days: daysBetween(row.from, row.to),
    reason: row.reason,
    appliedOn: row.appliedOn.toISOString().slice(0, 10),
    status: row.status as LeaveStatus,
  };
}

export interface CreateLeaveData {
  staffId: string;
  staff: string;
  type: LeaveTypeDb;
  from: Date;
  to: Date;
  reason: string;
}

export const leaveRepository = {
  async list(
    workspaceId: string,
    status?: LeaveStatusDb,
  ): Promise<LeaveRequestModel[]> {
    const db = await getTenantDb();
    return db.leaveRequest.findMany({
      where: { workspaceId, ...(status ? { status } : {}) },
      orderBy: { appliedOn: "desc" },
    });
  },

  async findById(
    workspaceId: string,
    id: string,
  ): Promise<LeaveRequestModel | null> {
    const db = await getTenantDb();
    return db.leaveRequest.findFirst({ where: { id, workspaceId } });
  },

  async create(
    workspaceId: string,
    data: CreateLeaveData,
  ): Promise<LeaveRequestModel> {
    const db = await getTenantDb();
    return db.leaveRequest.create({ data: { workspaceId, ...data } });
  },

  async update(id: string, status: LeaveStatusDb): Promise<LeaveRequestModel> {
    const db = await getTenantDb();
    return db.leaveRequest.update({ where: { id }, data: { status } });
  },

  async remove(id: string): Promise<LeaveRequestModel> {
    const db = await getTenantDb();
    return db.leaveRequest.delete({ where: { id } });
  },
};
