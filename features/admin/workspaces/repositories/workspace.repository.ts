import { Prisma as TenantPrisma } from "@prisma/client";

import { AppError, NotFoundError } from "@/lib/api/errors";
import { controlDb } from "@/lib/db/control";
import { Prisma } from "@/lib/db/generated/control";
import { decryptSecret, encryptSecret } from "@/lib/crypto/secret";
import { getTenantClient } from "@/lib/db/tenant-client";
import { seedTenantDatabase } from "@/lib/db/tenant-provision";
import type { Workspace } from "@/lib/admin/types";
import type { CreateWorkspaceInput, UpdateWorkspaceInput } from "../validations/workspace.schema";

// The "workspaces" admin feature is the master's registry of salons. It operates
// on the CONTROL-PLANE Tenant table (which salon → which private database), never
// on per-salon data. Each salon's own content lives in its own database.

type Row = Prisma.TenantGetPayload<object>;

export function toWorkspaceDto(row: Row): Workspace {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    domain: row.domain,
    plan: row.plan as Workspace["plan"],
    status: row.status as Workspace["status"],
    owner: row.owner,
    // Member counts live in each salon's own DB; not surfaced in the registry list.
    members: 0,
    createdAt: row.createdAt.toISOString(),
    accent: row.accent,
  };
}

export const workspaceRepository = {
  listAll(): Promise<Row[]> {
    return controlDb.tenant.findMany({ orderBy: { createdAt: "asc" } });
  },

  listByIds(ids: string[]): Promise<Row[]> {
    return controlDb.tenant.findMany({
      where: { id: { in: ids } },
      orderBy: { createdAt: "asc" },
    });
  },

  /**
   * Registers a salon in the control-plane and seeds its (already-migrated)
   * private database with the workspace, settings and bound tenant admin. If
   * seeding fails the registry row is rolled back so the operator can retry.
   */
  async provision(
    input: CreateWorkspaceInput & { passwordHash: string },
  ): Promise<Row> {
    const tenant = await controlDb.tenant.create({
      data: {
        name: input.name,
        slug: input.slug,
        domain: input.domain,
        databaseUrl: encryptSecret(input.databaseUrl),
        plan: input.plan ?? "starter",
        accent: input.accent ?? "#2d3b64",
        owner: input.adminName,
        status: "active",
      },
    });

    try {
      const db = getTenantClient(input.databaseUrl);
      await seedTenantDatabase(db, {
        name: input.name,
        slug: input.slug,
        domain: input.domain,
        plan: input.plan,
        accent: input.accent,
        adminName: input.adminName,
        adminEmail: input.adminEmail,
        adminPasswordHash: input.passwordHash,
      });
    } catch (e) {
      await controlDb.tenant.delete({ where: { id: tenant.id } }).catch(() => {});
      if (
        e instanceof TenantPrisma.PrismaClientKnownRequestError &&
        e.code === "P2021"
      ) {
        throw new AppError(
          400,
          "The salon database has no tables yet. Push the tenant schema to it first (npm run provision:tenant).",
          "TENANT_DB_NOT_MIGRATED",
        );
      }
      if (
        e instanceof TenantPrisma.PrismaClientInitializationError ||
        (e instanceof Error && /connect|ECONNREFUSED|ENOTFOUND/i.test(e.message))
      ) {
        throw new AppError(
          400,
          "Could not connect to the salon database. Check the connection string.",
          "TENANT_DB_UNREACHABLE",
        );
      }
      throw e;
    }

    return tenant;
  },

  /**
   * Master-only edit of a salon's identity (name/slug/domain/plan/accent) in
   * the control-plane registry. Mirrors the same fields onto the tenant's own
   * `Workspace` row so a tenant-role admin (who reads its own DB, not the
   * registry — see `workspaceService.listForUser`) sees the change too.
   */
  async update(id: string, input: UpdateWorkspaceInput): Promise<Row> {
    const existing = await controlDb.tenant.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Workspace not found");

    // Registry is the source of truth for routing — update it first so a
    // unique-constraint conflict (slug/domain already taken) fails loud
    // without ever touching the salon's own database.
    const updated = await controlDb.tenant.update({ where: { id }, data: input });

    const tenantFields: Record<string, string> = {};
    if (input.name !== undefined) tenantFields.name = input.name;
    if (input.slug !== undefined) tenantFields.slug = input.slug;
    if (input.domain !== undefined) tenantFields.domain = input.domain;
    if (input.plan !== undefined) tenantFields.plan = input.plan;
    if (input.accent !== undefined) tenantFields.accent = input.accent;

    if (Object.keys(tenantFields).length > 0) {
      try {
        const db = getTenantClient(decryptSecret(existing.databaseUrl));
        const ws = await db.workspace.findFirst();
        if (ws) await db.workspace.update({ where: { id: ws.id }, data: tenantFields });
      } catch (e) {
        // Best-effort mirror — the registry (source of truth for routing) is
        // already updated; a salon DB that's temporarily unreachable shouldn't
        // block the edit. Logged for follow-up if the mirror falls out of sync.
        console.error(`Failed to mirror workspace update onto tenant DB for ${id}:`, e);
      }
    }

    return updated;
  },

  /**
   * Repoints a salon at a different private database. Validates the new
   * database is reachable and already has the tenant schema before swapping
   * the registry pointer — otherwise the salon goes dark on its next request.
   */
  async updateDatabaseUrl(id: string, databaseUrl: string): Promise<Row> {
    const existing = await controlDb.tenant.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Workspace not found");

    try {
      const db = getTenantClient(databaseUrl);
      await db.workspace.findFirst();
    } catch (e) {
      if (
        e instanceof TenantPrisma.PrismaClientKnownRequestError &&
        e.code === "P2021"
      ) {
        throw new AppError(
          400,
          "The new database has no tables yet. Push the tenant schema to it first.",
          "TENANT_DB_NOT_MIGRATED",
        );
      }
      if (
        e instanceof TenantPrisma.PrismaClientInitializationError ||
        (e instanceof Error && /connect|ECONNREFUSED|ENOTFOUND/i.test(e.message))
      ) {
        throw new AppError(
          400,
          "Could not connect to the new database. Check the connection string.",
          "TENANT_DB_UNREACHABLE",
        );
      }
      throw e;
    }

    return controlDb.tenant.update({
      where: { id },
      data: { databaseUrl: encryptSecret(databaseUrl) },
    });
  },
};
