import { z } from "zod";

import { optionalPhone } from "@/lib/phone/validation";

const statusEnum = z.enum([
  "pending",
  "confirmed",
  "completed",
  "cancelled",
  "no-show",
]);

// Admin create — mirrors the customer booking schema (catalog ids resolved
// server-side) so both flows share the same conflict/capacity rules, plus
// admin-only powers: set the initial status, and force-book past conflicts.
export const createAppointmentSchema = z.object({
  customer: z.string().trim().min(1, "Customer name is required"),
  email: z.string().trim().toLowerCase().email().optional(),
  phone: optionalPhone,
  serviceId: z.string().trim().min(1, "Service is required"),
  staffId: z.string().trim().optional(),
  date: z.coerce.date({ message: "Please choose a valid date" }),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Please choose a time"),
  status: statusEnum.optional(),
  override: z.boolean().optional(),
});

export const updateAppointmentSchema = z
  .object({
    customer: z.string().trim().min(1).optional(),
    phone: optionalPhone,
    serviceId: z.string().trim().min(1).optional(),
    staffId: z.string().trim().optional(),
    date: z.coerce.date().optional(),
    time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    status: statusEnum.optional(),
    override: z.boolean().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "No fields to update" });

// Client-side form variant — date stays a "yyyy-MM-dd" string from the date
// input; the server-side schema above coerces it to `Date`.
export const createAppointmentFormSchema = z.object({
  customer: z.string().trim().min(1, "Customer name is required"),
  email: z.union([z.string().trim().toLowerCase().email(), z.literal("")]).optional(),
  phone: optionalPhone,
  serviceId: z.string().trim().min(1, "Service is required"),
  staffId: z.string().trim().optional(),
  date: z.string().min(1, "Please choose a date"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Please choose a time"),
  status: statusEnum.optional(),
  override: z.boolean().optional(),
});

export type CreateAppointmentFormInput = z.infer<typeof createAppointmentFormSchema>;
