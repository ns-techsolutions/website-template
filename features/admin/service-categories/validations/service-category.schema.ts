import { z } from "zod";

export const createServiceCategorySchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export const updateServiceCategorySchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    description: z.string().optional(),
    status: z.enum(["active", "inactive"]).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "No fields to update" });

export type CreateServiceCategoryInput = z.infer<
  typeof createServiceCategorySchema
>;
export type UpdateServiceCategoryInput = z.infer<
  typeof updateServiceCategorySchema
>;
