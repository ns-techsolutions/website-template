import { Prisma } from "@prisma/client";

import { BadRequestError, NotFoundError } from "@/lib/api/errors";
import type { Service } from "@/lib/admin/types";

import {
  serviceRepository,
  toServiceDto,
} from "../repositories/service.repository";
import {
  createServiceSchema,
  updateServiceSchema,
} from "../validations/service.schema";

function mapError(e: unknown): unknown {
  // FK violation — the chosen category does not exist in this workspace.
  if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2003") {
    return new BadRequestError("The selected category does not exist.");
  }
  return e;
}

export const serviceService = {
  async list(workspaceId: string, categoryId?: string): Promise<Service[]> {
    return (await serviceRepository.list(workspaceId, categoryId)).map(
      toServiceDto,
    );
  },

  async listActive(workspaceId: string): Promise<Service[]> {
    return (await serviceRepository.listActive(workspaceId)).map(toServiceDto);
  },

  async get(workspaceId: string, id: string): Promise<Service> {
    const row = await serviceRepository.findById(workspaceId, id);
    if (!row) throw new NotFoundError("Service not found.");
    return toServiceDto(row);
  },

  async create(workspaceId: string, raw: unknown): Promise<Service> {
    const input = createServiceSchema.parse(raw);
    try {
      return toServiceDto(await serviceRepository.create(workspaceId, input));
    } catch (e) {
      throw mapError(e);
    }
  },

  async update(workspaceId: string, id: string, raw: unknown): Promise<Service> {
    const input = updateServiceSchema.parse(raw);
    const existing = await serviceRepository.findById(workspaceId, id);
    if (!existing) throw new NotFoundError("Service not found.");
    try {
      return toServiceDto(await serviceRepository.update(id, input));
    } catch (e) {
      throw mapError(e);
    }
  },

  async remove(workspaceId: string, id: string): Promise<Service> {
    const existing = await serviceRepository.findById(workspaceId, id);
    if (!existing) throw new NotFoundError("Service not found.");
    return toServiceDto(await serviceRepository.remove(id));
  },
};
