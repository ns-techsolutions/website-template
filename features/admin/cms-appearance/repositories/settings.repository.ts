import { Prisma } from "@prisma/client";

import { getTenantDb } from "@/lib/db/tenant";
import {
  DEFAULT_SETTINGS,
  normalizeFooterColumns,
  normalizeHeaderMenu,
  type SettingsDto,
} from "../types/settings.dto";
import type { SiteAppearance, SocialLink } from "@/lib/admin/types";
import type { UpdateSettingsInput } from "../validations/settings.schema";

type Row = Prisma.SiteSettingsGetPayload<object>;

const json = (v: unknown) => v as unknown as Prisma.InputJsonValue;

export function toSettingsDto(row: Row): SettingsDto {
  return {
    appearance: row.appearance as unknown as SiteAppearance,
    headerMenu: normalizeHeaderMenu(row.headerMenu),
    footerColumns: normalizeFooterColumns(row.footerColumns),
    socialLinks: row.socialLinks as unknown as SocialLink[],
  };
}

export const settingsRepository = {
  async get(workspaceId: string): Promise<Row | null> {
    const db = await getTenantDb();
    return db.siteSettings.findUnique({ where: { workspaceId } });
  },

  /** Creates a settings row seeded with sensible defaults. */
  async createDefault(workspaceId: string): Promise<Row> {
    const db = await getTenantDb();
    return db.siteSettings.create({
      data: {
        workspaceId,
        appearance: json(DEFAULT_SETTINGS.appearance),
        headerMenu: json(DEFAULT_SETTINGS.headerMenu),
        footerColumns: json(DEFAULT_SETTINGS.footerColumns),
        socialLinks: json(DEFAULT_SETTINGS.socialLinks),
      },
    });
  },

  async upsert(workspaceId: string, input: UpdateSettingsInput): Promise<Row> {
    const db = await getTenantDb();
    const update: Prisma.SiteSettingsUpdateInput = {
      ...(input.appearance !== undefined && {
        appearance: json(input.appearance),
      }),
      ...(input.headerMenu !== undefined && {
        headerMenu: json(input.headerMenu),
      }),
      ...(input.footerColumns !== undefined && {
        footerColumns: json(input.footerColumns),
      }),
      ...(input.socialLinks !== undefined && {
        socialLinks: json(input.socialLinks),
      }),
    };
    return db.siteSettings.upsert({
      where: { workspaceId },
      update,
      create: {
        workspaceId,
        appearance: json(input.appearance ?? DEFAULT_SETTINGS.appearance),
        headerMenu: json(input.headerMenu ?? DEFAULT_SETTINGS.headerMenu),
        footerColumns: json(
          input.footerColumns ?? DEFAULT_SETTINGS.footerColumns,
        ),
        socialLinks: json(input.socialLinks ?? DEFAULT_SETTINGS.socialLinks),
      },
    });
  },
};
