import { z } from "zod";

import { optionalPhone } from "@/lib/phone/validation";

export const createCustomerSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  phone: optionalPhone,
  notes: z.string().trim().optional(),
});

export const updateCustomerSchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    phone: optionalPhone,
    notes: z.string().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "No fields to update" });

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
