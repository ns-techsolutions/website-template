import { Prisma } from "@prisma/client";

import { getTenantDb } from "@/lib/db/tenant";
import {
  DEFAULT_NOTIFICATION_PREFS,
  type NotificationPrefs,
  type SalonProfile,
} from "../types/salon-settings.dto";
import type { UpdateSalonSettingsInput } from "../validations/salon-settings.schema";

const json = (v: unknown) => v as unknown as Prisma.InputJsonValue;

function mergePrefs(stored: unknown): NotificationPrefs {
  return {
    ...DEFAULT_NOTIFICATION_PREFS,
    ...((stored as Partial<NotificationPrefs> | null) ?? {}),
  };
}

export const salonSettingsRepository = {
  async get(workspaceId: string): Promise<SalonProfile> {
    const db = await getTenantDb();
    const [ws, s] = await Promise.all([
      db.workspace.findUnique({ where: { id: workspaceId }, select: { name: true } }),
      db.salonSettings.findUnique({ where: { workspaceId } }),
    ]);
    return {
      name: ws?.name ?? "",
      tagline: s?.tagline ?? "",
      contactEmail: s?.contactEmail ?? "",
      contactPhone: s?.contactPhone ?? "",
      address: s?.address ?? "",
      currency: s?.currency ?? "gbp",
      timezone: s?.timezone ?? "Europe/London",
      defaultCountry: s?.defaultCountry ?? "GB",
      notificationPrefs: mergePrefs(s?.notificationPrefs),
    };
  },

  async update(
    workspaceId: string,
    input: UpdateSalonSettingsInput,
  ): Promise<SalonProfile> {
    const db = await getTenantDb();

    if (input.name !== undefined) {
      await db.workspace.update({
        where: { id: workspaceId },
        data: { name: input.name },
      });
    }

    const { name: _name, notificationPrefs, ...business } = input;
    const settingsData: Prisma.SalonSettingsUncheckedUpdateInput = { ...business };

    if (notificationPrefs !== undefined) {
      const current = await db.salonSettings.findUnique({
        where: { workspaceId },
        select: { notificationPrefs: true },
      });
      settingsData.notificationPrefs = json({
        ...mergePrefs(current?.notificationPrefs),
        ...notificationPrefs,
      });
    }

    if (Object.keys(settingsData).length > 0) {
      await db.salonSettings.upsert({
        where: { workspaceId },
        update: settingsData,
        create: {
          workspaceId,
          tagline: business.tagline ?? "",
          contactEmail: business.contactEmail ?? "",
          contactPhone: business.contactPhone ?? "",
          address: business.address ?? "",
          currency: business.currency ?? "gbp",
          timezone: business.timezone ?? "Europe/London",
          defaultCountry: business.defaultCountry ?? "GB",
          notificationPrefs: json(
            notificationPrefs
              ? { ...DEFAULT_NOTIFICATION_PREFS, ...notificationPrefs }
              : DEFAULT_NOTIFICATION_PREFS,
          ),
        },
      });
    }

    return this.get(workspaceId);
  },
};
