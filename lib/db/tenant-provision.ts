import { Prisma, type PrismaClient } from "@prisma/client";

import { DEFAULT_SETTINGS } from "@/features/admin/cms-appearance/types/settings.dto";
import { systemCmsPages } from "@/lib/admin/cms-data";
import { DEFAULT_ROLES } from "@/lib/auth/permissions";

const json = (v: unknown) => v as unknown as Prisma.InputJsonValue;

export interface SeedTenantInput {
  name: string;
  slug: string;
  domain: string;
  plan?: string;
  accent?: string;
  adminName: string;
  adminEmail: string;
  /** Already-hashed admin password. */
  adminPasswordHash: string;
}

/**
 * Seeds a freshly-migrated salon database with its single workspace row, default
 * site settings, and the bound `tenant` admin who can sign into only this salon.
 * Shared by the create-workspace API flow and the provisioning CLI script. The
 * target database schema must already exist (`db push`); a missing-table error
 * (P2021) surfaces to the caller to handle.
 */
export async function seedTenantDatabase(
  db: PrismaClient,
  input: SeedTenantInput,
) {
  return db.$transaction(async (tx) => {
    const workspace = await tx.workspace.create({
      data: {
        name: input.name,
        slug: input.slug,
        domain: input.domain,
        plan: input.plan ?? "starter",
        accent: input.accent ?? "#2d3b64",
        owner: input.adminName,
        // Each salon database holds exactly one workspace.
        isPrimary: true,
      },
    });

    await tx.siteSettings.create({
      data: {
        workspaceId: workspace.id,
        appearance: json(DEFAULT_SETTINGS.appearance),
        headerMenu: json(DEFAULT_SETTINGS.headerMenu),
        footerColumns: json(DEFAULT_SETTINGS.footerColumns),
        socialLinks: json(DEFAULT_SETTINGS.socialLinks),
      },
    });

    // Transactional pages (booking success / cancelled) the payment flow needs.
    // A salon otherwise starts with a blank CMS, so these must be seeded or the
    // post-payment redirect would 404.
    await tx.cmsPage.createMany({
      data: systemCmsPages.map((page) => ({
        workspaceId: workspace.id,
        title: page.title,
        slug: page.slug,
        status: page.status,
        blocks: json(page.blocks),
        seo: json(page.seo),
      })),
    });

    await tx.role.createMany({
      data: DEFAULT_ROLES.map((role) => ({
        workspaceId: workspace.id,
        name: role.name,
        description: role.description,
        permissions: role.permissions,
      })),
    });

    // Bind the salon admin to the full-access Administrator role.
    const adminRole = await tx.role.findFirst({
      where: { workspaceId: workspace.id, name: "Administrator" },
      select: { id: true },
    });

    await tx.user.create({
      data: {
        name: input.adminName,
        email: input.adminEmail,
        password: input.adminPasswordHash,
        role: "tenant",
        workspaceId: workspace.id,
        roleId: adminRole?.id ?? null,
      },
    });

    return workspace;
  });
}
