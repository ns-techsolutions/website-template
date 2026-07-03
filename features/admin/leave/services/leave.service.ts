import { BadRequestError, NotFoundError } from "@/lib/api/errors";
import type { LeaveRequest, LeaveStatus } from "@/lib/admin/types";
import { staffRepository } from "@/features/admin/staff/repositories/staff.repository";

import { leaveRepository, toLeaveDto } from "../repositories/leave.repository";
import {
  createLeaveSchema,
  updateLeaveSchema,
} from "../validations/leave.schema";

export const leaveService = {
  async list(workspaceId: string, status?: LeaveStatus): Promise<LeaveRequest[]> {
    return (await leaveRepository.list(workspaceId, status)).map(toLeaveDto);
  },

  async create(workspaceId: string, raw: unknown): Promise<LeaveRequest> {
    const input = createLeaveSchema.parse(raw);
    if (input.to < input.from) {
      throw new BadRequestError("End date must be on or after the start date.");
    }
    // Resolve and snapshot the staff name (so the request survives a rename).
    const member = await staffRepository.findById(workspaceId, input.staffId);
    if (!member) {
      throw new BadRequestError("The selected staff member does not exist.");
    }
    return toLeaveDto(
      await leaveRepository.create(workspaceId, {
        staffId: member.id,
        staff: member.name,
        type: input.type,
        from: input.from,
        to: input.to,
        reason: input.reason ?? "",
      }),
    );
  },

  async setStatus(
    workspaceId: string,
    id: string,
    raw: unknown,
  ): Promise<LeaveRequest> {
    const input = updateLeaveSchema.parse(raw);
    const existing = await leaveRepository.findById(workspaceId, id);
    if (!existing) throw new NotFoundError("Leave request not found.");
    return toLeaveDto(await leaveRepository.update(id, input.status));
  },

  async remove(workspaceId: string, id: string): Promise<LeaveRequest> {
    const existing = await leaveRepository.findById(workspaceId, id);
    if (!existing) throw new NotFoundError("Leave request not found.");
    return toLeaveDto(await leaveRepository.remove(id));
  },
};
