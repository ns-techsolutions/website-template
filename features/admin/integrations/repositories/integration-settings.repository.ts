import type { IntegrationSettings, Prisma } from "@prisma/client";

import { getTenantDb } from "@/lib/db/tenant";

export const integrationSettingsRepository = {
  async get(workspaceId: string): Promise<IntegrationSettings | null> {
    const db = await getTenantDb();
    return db.integrationSettings.findUnique({ where: { workspaceId } });
  },

  async upsert(
    workspaceId: string,
    data: Prisma.IntegrationSettingsUncheckedUpdateInput,
  ): Promise<IntegrationSettings> {
    const db = await getTenantDb();
    return db.integrationSettings.upsert({
      where: { workspaceId },
      update: data,
      create: {
        ...(data as Omit<Prisma.IntegrationSettingsUncheckedCreateInput, "workspaceId">),
        workspaceId,
      },
    });
  },
};
