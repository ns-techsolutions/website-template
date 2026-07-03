import { BadRequestError, ConflictError } from "@/lib/api/errors";
import { hashPassword } from "@/lib/auth/password";
import type { AuthUser } from "@/lib/auth/types";
import { getTenantDb, invalidateTenantHostCache, isPlatformHost } from "@/lib/db/tenant";
import { Prisma } from "@/lib/db/generated/control";
import type { Workspace } from "@/lib/admin/types";

import {
  toWorkspaceDto,
  workspaceRepository
} from "../repositories/workspace.repository";
import {
  createWorkspaceSchema,
  updateDatabaseUrlSchema,
  updateWorkspaceSchema
} from "../validations/workspace.schema";

export const workspaceService = {
  /**
   * Lists workspaces visible to the user:
   *   - master -> every salon in the control-plane registry
   *   - tenant -> the single workspace inside their own salon database
   */
  async listForUser(user: AuthUser): Promise<Workspace[]> {
    if (user.role === "master") {
      return (await workspaceRepository.listAll()).map(toWorkspaceDto);
    }
    if (user.role === "tenant") {
      const db = await getTenantDb();
      const ws = await db.workspace.findFirst();
      if (!ws) return [];
      const members = await db.user.count({ where: { workspaceId: ws.id } });
      return [
        {
          id: ws.id,
          name: ws.name,
          slug: ws.slug,
          domain: ws.domain,
          plan: ws.plan as Workspace["plan"],
          status: ws.status as Workspace["status"],
          owner: ws.owner,
          members,
          createdAt: ws.createdAt.toISOString(),
          accent: ws.accent
        }
      ];
    }
    return [];
  },

  /** Master-only: registers a salon and seeds its private database. */
  async create(raw: unknown): Promise<Workspace> {
    const input = createWorkspaceSchema.parse(raw);

    // A salon cannot live on the platform host — that host serves the master
    // console, so the salon would be unreachable. Use a subdomain instead.
    if (isPlatformHost(input.domain)) {
      throw new BadRequestError(
        `"${input.domain}" is reserved for the platform console. ` +
          "Use a distinct host for the salon, e.g. rein.localhost or salon.example.com.",
      );
    }

    const passwordHash = await hashPassword(input.adminPassword);
    try {
      const row = await workspaceRepository.provision({
        ...input,
        passwordHash
      });
      return toWorkspaceDto(row);
    } catch (e) {
      console.error("Error provisioning workspace:", e);
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2002"
      ) {
        const target =
          (e.meta?.target as string[] | undefined)?.join(",") ?? "";
        throw new ConflictError(
          target.includes("domain")
            ? "A salon with that custom domain already exists."
            : "A salon with that slug already exists."
        );
      }
      throw e;
    }
  },

  /** Master-only: edits a salon's name/slug/domain/plan/accent. */
  async update(id: string, raw: unknown): Promise<Workspace> {
    const input = updateWorkspaceSchema.parse(raw);

    if (input.domain !== undefined && isPlatformHost(input.domain)) {
      throw new BadRequestError(
        `"${input.domain}" is reserved for the platform console. ` +
          "Use a distinct host for the salon, e.g. rein.localhost or salon.example.com.",
      );
    }

    try {
      const row = await workspaceRepository.update(id, input);
      // The old domain (if changed) must drop out of the cache too, or it
      // keeps resolving to this tenant until the TTL expires.
      invalidateTenantHostCache();
      return toWorkspaceDto(row);
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2002"
      ) {
        const target =
          (e.meta?.target as string[] | undefined)?.join(",") ?? "";
        throw new ConflictError(
          target.includes("domain")
            ? "A salon with that custom domain already exists."
            : "A salon with that slug already exists."
        );
      }
      throw e;
    }
  },

  /** Master-only: repoints a salon at a different private database. */
  async updateDatabaseUrl(id: string, raw: unknown): Promise<Workspace> {
    const { databaseUrl } = updateDatabaseUrlSchema.parse(raw);
    const row = await workspaceRepository.updateDatabaseUrl(id, databaseUrl);
    // Drop the cached host->tenant entry so the next request picks up the new URL
    // immediately instead of waiting out the short-TTL registry cache.
    invalidateTenantHostCache();
    return toWorkspaceDto(row);
  }
};
