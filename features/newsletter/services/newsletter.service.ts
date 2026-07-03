import { getTenantDb } from "@/lib/db/tenant";
import { subscribeSchema } from "../validations/newsletter.schema";

export const newsletterService = {
  async subscribe(workspaceId: string, raw: unknown): Promise<void> {
    const { email } = subscribeSchema.parse(raw);
    const db = await getTenantDb();
    // Idempotent — re-subscribing is a no-op rather than an error.
    await db.subscriber.upsert({
      where: { workspaceId_email: { workspaceId, email } },
      update: {},
      create: { workspaceId, email },
    });
  },
};
