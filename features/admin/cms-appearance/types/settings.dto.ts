import type {
  FooterColumn,
  MenuLink,
  NavButton,
  NavButtonType,
  SiteAppearance,
  SocialLink,
} from "@/lib/admin/types";

export interface HeaderMenu {
  links: MenuLink[];
  buttons: NavButton[];
}

export interface FooterConfig {
  columns: FooterColumn[];
  copyright: string;
  /** Small-print links shown at the bottom-right of the footer (e.g. Privacy, Terms). */
  legalLinks: MenuLink[];
}

/** Full site settings for a workspace (appearance + navigation). */
export interface SettingsDto {
  appearance: SiteAppearance;
  headerMenu: HeaderMenu;
  footerColumns: FooterConfig;
  socialLinks: SocialLink[];
}

export const DEFAULT_SETTINGS: SettingsDto = {
  appearance: {
    brandName: "",
    logoLight: "",
    logoDark: "",
    favicon: "/favicon.ico",
    primaryColor: "#2d3b64",
    accentColor: "#a06f55",
    fontFamily: "Open Sans",
    seoTitleTemplate: "%s",
    seoDescription: "",
    ogImage: "",
  },
  headerMenu: { links: [], buttons: [] },
  footerColumns: { columns: [], copyright: "", legalLinks: [] },
  socialLinks: [],
};

const NAV_BUTTON_TYPES: NavButtonType[] = ["link", "signin", "signup"];

function normalizeButton(raw: unknown, i: number): NavButton {
  const b = (raw ?? {}) as Record<string, unknown>;
  const type = NAV_BUTTON_TYPES.includes(b.type as NavButtonType)
    ? (b.type as NavButtonType)
    : "link";
  return {
    id: typeof b.id === "string" && b.id ? b.id : `btn-${i}`,
    label: typeof b.label === "string" ? b.label : "",
    type,
    url: typeof b.url === "string" ? b.url : "",
    dividerBefore: Boolean(b.dividerBefore),
  };
}

/**
 * Coerce a stored `headerMenu` JSON blob into the current shape. Tolerates the
 * legacy `{ links, cta: { label, url } }` shape (pre-multi-button) by promoting
 * a non-empty `cta` into a single link button — no data migration required.
 */
export function normalizeHeaderMenu(raw: unknown): HeaderMenu {
  const obj = (raw ?? {}) as Record<string, unknown>;
  const links = Array.isArray(obj.links) ? (obj.links as MenuLink[]) : [];

  if (Array.isArray(obj.buttons)) {
    return { links, buttons: obj.buttons.map(normalizeButton) };
  }

  const cta = obj.cta as { label?: string; url?: string } | undefined;
  const buttons: NavButton[] =
    cta && typeof cta.label === "string" && cta.label
      ? [
          {
            id: "cta-legacy",
            label: cta.label,
            type: "link",
            url: cta.url ?? "",
            dividerBefore: false,
          },
        ]
      : [];
  return { links, buttons };
}

function normalizeLink(raw: unknown, i: number): MenuLink {
  const l = (raw ?? {}) as Record<string, unknown>;
  return {
    id: typeof l.id === "string" && l.id ? l.id : `lnk-${i}`,
    label: typeof l.label === "string" ? l.label : "",
    url: typeof l.url === "string" ? l.url : "",
  };
}

/**
 * Coerce a stored `footerColumns` JSON blob into the current shape. Tolerates
 * blobs that predate a field (e.g. `legalLinks`, added after launch) by
 * defaulting it to an empty array — no data migration required.
 */
export function normalizeFooterColumns(raw: unknown): FooterConfig {
  const obj = (raw ?? {}) as Record<string, unknown>;
  const columns = Array.isArray(obj.columns)
    ? obj.columns.map((c, i) => {
        const col = (c ?? {}) as Record<string, unknown>;
        return {
          id: typeof col.id === "string" && col.id ? col.id : `col-${i}`,
          title: typeof col.title === "string" ? col.title : "",
          links: Array.isArray(col.links) ? col.links.map(normalizeLink) : [],
        };
      })
    : [];
  return {
    columns,
    copyright: typeof obj.copyright === "string" ? obj.copyright : "",
    legalLinks: Array.isArray(obj.legalLinks)
      ? obj.legalLinks.map(normalizeLink)
      : [],
  };
}
