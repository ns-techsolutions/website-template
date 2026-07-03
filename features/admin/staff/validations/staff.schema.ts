import { z } from "zod";

import { optionalPhone } from "@/lib/phone/validation";

export const createStaffSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  phone: optionalPhone,
  role: z.string().trim().optional(),
  roleId: z.string().trim().optional(),
  specialties: z.array(z.string()).optional(),
  status: z.enum(["active", "inactive"]).optional(),
  image: z.string().trim().optional(),
  joinedDate: z.string().trim().optional(),
});

export const updateStaffSchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    email: z.string().trim().toLowerCase().email().optional(),
    phone: optionalPhone,
    role: z.string().trim().optional(),
    roleId: z.string().trim().optional(),
    specialties: z.array(z.string()).optional(),
    status: z.enum(["active", "inactive"]).optional(),
    image: z.string().trim().optional(),
    joinedDate: z.string().trim().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "No fields to update" });

export type CreateStaffInput = z.infer<typeof createStaffSchema>;
export type UpdateStaffInput = z.infer<typeof updateStaffSchema>;
