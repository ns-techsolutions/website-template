import { z } from "zod";

export const createPageSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  slug: z.string().trim().min(1, "URL path is required"),
});

const seoSchema = z.object({
  title: z.string(),
  description: z.string(),
  ogImage: z.string(),
});

export const updatePageSchema = z
  .object({
    title: z.string().trim().min(1).optional(),
    slug: z.string().trim().min(1).optional(),
    status: z.enum(["draft", "published"]).optional(),
    blocks: z.array(z.any()).optional(),
    seo: seoSchema.partial().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, {
    message: "No fields to update",
  });

// Client-side form variant — title/slug may be left blank and are
// auto-generated before the request is sent.
export const createPageFormSchema = z.object({
  title: z.string().trim().optional(),
  slug: z.string().trim().optional(),
});

export type CreatePageInput = z.infer<typeof createPageSchema>;
export type UpdatePageInput = z.infer<typeof updatePageSchema>;
export type CreatePageFormInput = z.infer<typeof createPageFormSchema>;
