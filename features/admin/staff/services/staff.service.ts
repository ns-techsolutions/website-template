import { NotFoundError } from "@/lib/api/errors";
import type { StaffMember } from "@/lib/admin/types";

import { staffRepository, toStaffDto } from "../repositories/staff.repository";
import {
  createStaffSchema,
  updateStaffSchema,
} from "../validations/staff.schema";

export const staffService = {
  async list(workspaceId: string): Promise<StaffMember[]> {
    return (await staffRepository.list(workspaceId)).map(toStaffDto);
  },

  async listActive(workspaceId: string): Promise<StaffMember[]> {
    return (await staffRepository.listActive(workspaceId)).map(toStaffDto);
  },

  async get(workspaceId: string, id: string): Promise<StaffMember> {
    const row = await staffRepository.findById(workspaceId, id);
    if (!row) throw new NotFoundError("Staff member not found.");
    return toStaffDto(row);
  },

  async create(workspaceId: string, raw: unknown): Promise<StaffMember> {
    const input = createStaffSchema.parse(raw);
    return toStaffDto(await staffRepository.create(workspaceId, input));
  },

  async update(
    workspaceId: string,
    id: string,
    raw: unknown,
  ): Promise<StaffMember> {
    const input = updateStaffSchema.parse(raw);
    const existing = await staffRepository.findById(workspaceId, id);
    if (!existing) throw new NotFoundError("Staff member not found.");
    return toStaffDto(await staffRepository.update(id, input));
  },

  async remove(workspaceId: string, id: string): Promise<StaffMember> {
    const existing = await staffRepository.findById(workspaceId, id);
    if (!existing) throw new NotFoundError("Staff member not found.");
    return toStaffDto(await staffRepository.remove(id));
  },
};
