import "server-only";

import { cache } from "react";

import { getTenantDb } from "@/lib/db/tenant";
import type {
  Block,
  CmsPageSeo,
  OpeningHour,
  Review,
  Service,
  StaffMember,
} from "@/lib/admin/types";
import {
  DEFAULT_SETTINGS,
  normalizeFooterColumns,
  normalizeHeaderMenu,
  type SettingsDto,
} from "@/features/admin/cms-appearance/types/settings.dto";
import { openingHoursService } from "@/features/admin/opening-hours/services/opening-hours.service";
import { serviceService } from "@/features/admin/services/services/service.service";
import { staffService } from "@/features/admin/staff/services/staff.service";
import { salonSettingsRepository } from "@/features/admin/salon-settings/repositories/salon-settings.repository";
import { reviewService } from "@/features/admin/reviews/services/review.service";

/**
 * The workspace the public site renders. Each salon's database holds exactly one
 * workspace, and the database is chosen from the request host (see getTenantDb),
 * so this returns whichever salon the visitor's domain maps to. `cache()` keeps
 * it to a single query per request.
 */
const getTenantWorkspaceId = cache(async (): Promise<string | null> => {
  try {
    const db = await getTenantDb();
    const ws = await db.workspace.findFirst({ select: { id: true } });
    return ws?.id ?? null;
  } catch {
    // No salon maps to this host (e.g. the platform host) — render the public
    // pages with defaults rather than 500-ing.
    return null;
  }
});

export interface PublicPage {
  title: string;
  blocks: Block[];
  seo: CmsPageSeo;
}

/** A published page for the primary workspace, or null when none is published. */
export const getPublishedPageBySlug = cache(
  async (slug: string): Promise<PublicPage | null> => {
    const workspaceId = await getTenantWorkspaceId();
    if (!workspaceId) return null;

    const db = await getTenantDb();
    const page = await db.cmsPage.findFirst({
      where: { workspaceId, slug, status: "published" },
    });
    if (!page) return null;

    return {
      title: page.title,
      blocks: (page.blocks ?? []) as unknown as Block[],
      seo: (page.seo ?? {
        title: "",
        description: "",
        ogImage: "",
      }) as unknown as CmsPageSeo,
    };
  },
);

/** Live salon data that data-backed CMS blocks render (hours, services, staff, contact). */
export interface SalonContent {
  openingHours: OpeningHour[];
  services: Service[];
  staff: StaffMember[];
  address: string;
  contactPhone: string;
  contactEmail: string;
  currency: string;
  /** Published customer reviews, newest first (for the reviews block). */
  reviews: Review[];
}

/**
 * The salon's live operational data for the public site, or null when no salon
 * maps to the host. Reuses the admin services so the public site stays in sync
 * with whatever is managed in the admin panel. `cache()` keeps it to a single
 * batch per request even when several data blocks appear on one page.
 */
export const getSalonContent = cache(
  async (): Promise<SalonContent | null> => {
    const workspaceId = await getTenantWorkspaceId();
    if (!workspaceId) return null;

    const [hours, services, staff, salon, reviews] = await Promise.all([
      openingHoursService.get(workspaceId),
      serviceService.listActive(workspaceId),
      staffService.listActive(workspaceId),
      salonSettingsRepository.get(workspaceId),
      reviewService.listPublished(workspaceId),
    ]);

    return {
      openingHours: hours.openingHours,
      services,
      staff,
      address: salon.address,
      contactPhone: salon.contactPhone,
      contactEmail: salon.contactEmail,
      currency: salon.currency,
      reviews,
    };
  },
);

/** Site settings (branding + navigation) for the primary workspace. */
export const getPrimarySettings = cache(async (): Promise<SettingsDto> => {
  const workspaceId = await getTenantWorkspaceId();
  if (!workspaceId) return DEFAULT_SETTINGS;

  const db = await getTenantDb();
  const row = await db.siteSettings.findUnique({ where: { workspaceId } });
  if (!row) return DEFAULT_SETTINGS;

  return {
    appearance: row.appearance as unknown as SettingsDto["appearance"],
    headerMenu: normalizeHeaderMenu(row.headerMenu),
    footerColumns: normalizeFooterColumns(row.footerColumns),
    socialLinks: row.socialLinks as unknown as SettingsDto["socialLinks"],
  };
});
