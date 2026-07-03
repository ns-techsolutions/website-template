import { z } from "zod";

export const createServiceSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  categoryId: z.string().trim().min(1, "Category is required"),
  description: z.string().trim().optional(),
  price: z.number().int().min(0, "Price must be 0 or more"),
  duration: z.number().int().min(0, "Duration must be 0 or more"),
  status: z.enum(["active", "inactive"]).optional(),
  requiresDeposit: z.boolean().optional(),
  depositAmount: z.number().int().min(0).nullable().optional(),
});

export const updateServiceSchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    categoryId: z.string().trim().min(1).optional(),
    description: z.string().optional(),
    price: z.number().int().min(0).optional(),
    duration: z.number().int().min(0).optional(),
    status: z.enum(["active", "inactive"]).optional(),
    requiresDeposit: z.boolean().optional(),
    depositAmount: z.number().int().min(0).nullable().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "No fields to update" });

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
