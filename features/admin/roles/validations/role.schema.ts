import { z } from "zod";

export const createRoleSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim().optional(),
  permissions: z.array(z.string()).optional(),
});

export const updateRoleSchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    description: z.string().optional(),
    permissions: z.array(z.string()).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "No fields to update" });

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
