import { z } from "zod";

export const updateSalonSettingsSchema = z
  .object({
    name: z.string().trim().min(1, "Salon name is required").optional(),
    tagline: z.string().trim().optional(),
    contactEmail: z.string().trim().optional(),
    contactPhone: z.string().trim().optional(),
    address: z.string().trim().optional(),
    currency: z.string().trim().optional(),
    timezone: z.string().trim().optional(),
    defaultCountry: z.string().trim().length(2, "Use a 2-letter country code").optional(),
    notificationPrefs: z
      .object({
        newBooking: z.boolean(),
        bookingCancelled: z.boolean(),
        dailySummary: z.boolean(),
        newReview: z.boolean(),
        leaveRequests: z.boolean(),
      })
      .partial()
      .optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "No fields to update" });

export type UpdateSalonSettingsInput = z.infer<typeof updateSalonSettingsSchema>;

// Client-side form variant for the Salon details tab (all fields required —
// the server schema above is the partial PATCH version).
export const salonDetailsFormSchema = z.object({
  name: z.string().trim().min(1, "Salon name is required"),
  tagline: z.string().trim().optional(),
  contactEmail: z.string().trim().optional(),
  contactPhone: z.string().trim().optional(),
  address: z.string().trim().optional(),
  currency: z.string().trim().min(1),
  timezone: z.string().trim().min(1),
  defaultCountry: z.string().trim().length(2),
})

export type SalonDetailsFormInput = z.infer<typeof salonDetailsFormSchema>;

export const notificationPrefsFormSchema = z.object({
  newBooking: z.boolean(),
  bookingCancelled: z.boolean(),
  dailySummary: z.boolean(),
  newReview: z.boolean(),
  leaveRequests: z.boolean(),
});

export type NotificationPrefsFormInput = z.infer<typeof notificationPrefsFormSchema>;
