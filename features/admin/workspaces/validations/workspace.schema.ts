import { z } from "zod";

import { normalizeHost } from "@/lib/net/host";

export const createWorkspaceSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and hyphens only"),
  // Custom domain the salon is served on — the request host resolves to this,
  // so it is required and must be unique across salons. Input is forgiving
  // (protocol/port/www are stripped) and stored canonical, matching how the
  // request host is normalized at runtime. For local dev use a *.localhost
  // subdomain, e.g. "rein.localhost" (reachable at http://rein.localhost:3000).
  domain: z
    .string()
    .min(1, "Custom domain is required")
    .transform((v) => normalizeHost(v))
    .refine(
      (v) => v.length > 0 && /^[a-z0-9.-]+$/.test(v),
      "Enter a valid hostname, e.g. rein.localhost or salon.example.com",
    ),
  // The salon's private Postgres database. Provided manually in v1; encrypted at
  // rest in the control-plane registry.
  databaseUrl: z
    .string()
    .trim()
    .min(1, "Database URL is required")
    .regex(/^postgres(ql)?:\/\//i, "Must be a postgres:// connection string"),
  plan: z.enum(["starter", "pro", "enterprise"]).optional(),
  accent: z.string().trim().optional(),
  // Tenant admin provisioned for this workspace (seeded into the salon database).
  adminName: z.string().trim().min(1, "Admin name is required"),
  adminEmail: z.string().trim().toLowerCase().email("Enter a valid email"),
  adminPassword: z.string().min(6, "Password must be at least 6 characters"),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;

// Client-side form variant — slug is optional here because a blank slug is
// auto-generated from the business name before the request is sent.
export const createWorkspaceFormSchema = createWorkspaceSchema.extend({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]*$/, "Use lowercase letters, numbers and hyphens only")
    .optional(),
});

export type CreateWorkspaceFormInput = z.infer<typeof createWorkspaceFormSchema>;

export const updateDatabaseUrlSchema = z.object({
  databaseUrl: z
    .string()
    .trim()
    .min(1, "Database URL is required")
    .regex(/^postgres(ql)?:\/\//i, "Must be a postgres:// connection string"),
});

export type UpdateDatabaseUrlInput = z.infer<typeof updateDatabaseUrlSchema>;

// Master-only edit of the salon's registry-level identity. All fields optional
// so callers can PATCH just the one thing they're changing.
export const updateWorkspaceSchema = z.object({
  name: z.string().trim().min(1, "Name is required").optional(),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and hyphens only")
    .optional(),
  domain: z
    .string()
    .min(1, "Custom domain is required")
    .transform((v) => normalizeHost(v))
    .refine(
      (v) => v.length > 0 && /^[a-z0-9.-]+$/.test(v),
      "Enter a valid hostname, e.g. rein.localhost or salon.example.com",
    )
    .optional(),
  plan: z.enum(["starter", "pro", "enterprise"]).optional(),
  accent: z.string().trim().optional(),
});

export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;
