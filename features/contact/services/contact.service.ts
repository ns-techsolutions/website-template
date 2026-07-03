import { salonSettingsService } from "@/features/admin/salon-settings/services/salon-settings.service";
import { sendContactNotification } from "@/lib/mail";

import { contactRepository } from "../repositories/contact.repository";
import { createContactSchema } from "../validations/contact.schema";

export const contactService = {
  async submit(workspaceId: string, raw: unknown): Promise<void> {
    const input = createContactSchema.parse(raw);
    // Store first so a lead is never lost, then notify the salon (best-effort).
    await contactRepository.create(workspaceId, input);
    const profile = await salonSettingsService.get(workspaceId);
    if (profile.contactEmail) {
      void sendContactNotification(profile.contactEmail, {
        name: input.name,
        email: input.email,
        subject: input.subject ?? "",
        message: input.message,
      });
    }
  },
};
