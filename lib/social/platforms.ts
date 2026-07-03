// Supported social-media platforms for footer/social links. Stored as slugs in
// the `SiteSettings.socialLinks` JSON column; rendered as brand icons by
// `components/common/social-icons.tsx`.

export const SOCIAL_PLATFORMS = [
  "facebook",
  "instagram",
  "x",
  "tiktok",
  "youtube",
  "linkedin",
  "pinterest",
  "whatsapp",
] as const;

export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

export const SOCIAL_PLATFORM_LABELS: Record<SocialPlatform, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  x: "X (Twitter)",
  tiktok: "TikTok",
  youtube: "YouTube",
  linkedin: "LinkedIn",
  pinterest: "Pinterest",
  whatsapp: "WhatsApp",
};

// Aliases / legacy values that should resolve to a canonical slug.
const PLATFORM_ALIASES: Record<string, SocialPlatform> = {
  twitter: "x",
  "twitter/x": "x",
};

/**
 * Normalize a stored/typed platform value to a known slug, tolerating legacy
 * capitalized values ("Facebook") and aliases ("twitter" → "x"). Returns null
 * when the value can't be mapped to a supported platform.
 */
export function normalizeSocialPlatform(value: string): SocialPlatform | null {
  const key = value.trim().toLowerCase();
  if ((SOCIAL_PLATFORMS as readonly string[]).includes(key)) {
    return key as SocialPlatform;
  }
  return PLATFORM_ALIASES[key] ?? null;
}
