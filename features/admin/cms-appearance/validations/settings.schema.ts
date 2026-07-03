import { z } from "zod";

import { SOCIAL_PLATFORMS } from "@/lib/social/platforms";

export const updateSettingsSchema = z
  .object({
    appearance: z.record(z.string(), z.any()).optional(),
    headerMenu: z.record(z.string(), z.any()).optional(),
    footerColumns: z.record(z.string(), z.any()).optional(),
    socialLinks: z.array(z.any()).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "No fields to update" });

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;

// Client-side form variant for the Menus editor (header nav, footer columns,
// social links) — the server-side schema above accepts these loosely typed
// since it's a generic partial PATCH.
const menuLinkFormSchema = z.object({
  id: z.string(),
  label: z.string().trim().min(1, "Label is required"),
  url: z.string().trim().min(1, "URL is required"),
});

// A header button is either a link (URL required) or opens an auth dialog
// (sign in / sign up), in which case the URL is unused.
const navButtonFormSchema = z
  .object({
    id: z.string(),
    label: z.string().trim().min(1, "Label is required"),
    type: z.enum(["link", "signin", "signup"]),
    url: z.string().trim(),
    dividerBefore: z.boolean(),
  })
  .refine((b) => b.type !== "link" || b.url.length > 0, {
    message: "URL is required for link buttons",
    path: ["url"],
  });

export const menusFormSchema = z.object({
  header: z.array(menuLinkFormSchema),
  buttons: z.array(navButtonFormSchema),
  columns: z.array(
    z.object({
      id: z.string(),
      title: z.string().trim().min(1, "Title is required"),
      links: z.array(menuLinkFormSchema),
    })
  ),
  social: z.array(
    z.object({
      id: z.string(),
      platform: z.enum(SOCIAL_PLATFORMS),
      url: z.string().trim().min(1, "URL is required"),
    })
  ),
  copyright: z.string().trim().min(1, "Copyright text is required"),
  legal: z.array(menuLinkFormSchema),
});

export type MenusFormInput = z.infer<typeof menusFormSchema>;

// Client-side form variant for the Appearance editor (branding, theme, SEO).
export const appearanceFormSchema = z.object({
  brandName: z.string().trim().min(1, "Brand name is required"),
  logoLight: z.string().trim().optional(),
  logoDark: z.string().trim().optional(),
  favicon: z.string().trim().optional(),
  primaryColor: z.string().trim().min(1, "Primary colour is required"),
  accentColor: z.string().trim().min(1, "Accent colour is required"),
  fontFamily: z.string().trim().min(1, "Font family is required"),
  seoTitleTemplate: z.string().trim().optional(),
  seoDescription: z.string().trim().optional(),
  ogImage: z.string().trim().optional(),
});

export type AppearanceFormInput = z.infer<typeof appearanceFormSchema>;
