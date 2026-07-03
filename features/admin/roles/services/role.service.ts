import { NotFoundError } from "@/lib/api/errors";
import type { Role } from "@/lib/admin/types";

import { roleRepository, toRoleDto } from "../repositories/role.repository";
import {
  createRoleSchema,
  updateRoleSchema,
} from "../validations/role.schema";

export const roleService = {
  async list(workspaceId: string): Promise<Role[]> {
    return (await roleRepository.list(workspaceId)).map(toRoleDto);
  },

  async create(workspaceId: string, raw: unknown): Promise<Role> {
    const input = createRoleSchema.parse(raw);
    return toRoleDto(await roleRepository.create(workspaceId, input));
  },

  async update(workspaceId: string, id: string, raw: unknown): Promise<Role> {
    const input = updateRoleSchema.parse(raw);
    const existing = await roleRepository.findById(workspaceId, id);
    if (!existing) throw new NotFoundError("Role not found.");
    return toRoleDto(await roleRepository.update(id, input));
  },

  async remove(workspaceId: string, id: string): Promise<Role> {
    const existing = await roleRepository.findById(workspaceId, id);
    if (!existing) throw new NotFoundError("Role not found.");
    return toRoleDto(await roleRepository.remove(id));
  },
};
