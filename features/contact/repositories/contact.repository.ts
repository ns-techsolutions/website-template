import { getTenantDb } from "@/lib/db/tenant";
import type { CreateContactInput } from "../validations/contact.schema";

export const contactRepository = {
  async create(workspaceId: string, input: CreateContactInput): Promise<void> {
    const db = await getTenantDb();
    await db.contactMessage.create({
      data: {
        workspaceId,
        name: input.name,
        email: input.email,
        subject: input.subject ?? "",
        message: input.message,
      },
    });
  },
};
