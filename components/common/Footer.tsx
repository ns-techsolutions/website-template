import Link from "next/link";

import { SocialIcon } from "@/components/common/social-icons";

interface FooterLink {
  label: string;
  url: string;
}
interface FooterCol {
  id?: string;
  title: string;
  links: FooterLink[];
}
interface SocialItem {
  id?: string;
  platform: string;
  url: string;
}

interface FooterProps {
  brandName?: string;
  description?: string;
  columns?: FooterCol[];
  social?: SocialItem[];
  copyright?: string;
  legalLinks?: FooterLink[];
}

const DEFAULT_COLUMNS: FooterCol[] = [
  {
    title: "Explore",
    links: [
      { label: "About Us", url: "/about" },
      { label: "Services", url: "/services" },
      { label: "Portfolio", url: "/" },
      { label: "Contact", url: "/contact" }
    ]
  },
  {
    title: "Contact",
    links: [
      { label: "8721 Central Ave, Los Angeles, CA 90036", url: "#" },
      { label: "+1 (555) 123-4567", url: "tel:+15551234567" },
      { label: "hello@reinestudio.com", url: "mailto:hello@reinestudio.com" }
    ]
  }
];

const DEFAULT_SOCIAL: SocialItem[] = [
  { platform: "facebook", url: "#" },
  { platform: "instagram", url: "#" },
  { platform: "tiktok", url: "#" }
];

const DEFAULT_LEGAL: FooterLink[] = [
  { label: "Privacy Policy", url: "/privacy" },
  { label: "Terms of Service", url: "/terms" }
];

export default function Footer({
  brandName = "REINE STUDIO",
  description = "Aliquam nullam tempor sapien donec and gravida lectus in an augue enim diam ipsum ipsum purus",
  columns,
  social,
  copyright,
  legalLinks
}: FooterProps) {
  const year = new Date().getFullYear();
  const copy = (copyright || "© {year} Reine Studio. All Rights Reserved.").replace(
    "{year}",
    String(year)
  );
  const cols = columns && columns.length > 0 ? columns : DEFAULT_COLUMNS;
  const socials = social && social.length > 0 ? social : DEFAULT_SOCIAL;
  const legals = legalLinks && legalLinks.length > 0 ? legalLinks : DEFAULT_LEGAL;

  return (
    <footer className="bg-[#111111] text-[#a0a0a0] py-16 px-4 mt-auto">
      <div className="max-w-[1320px] mx-auto grid gap-10 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <h3 className="text-2xl font-serif text-white mb-6 uppercase tracking-widest">
            {brandName}
          </h3>
          <p className="font-sans text-sm leading-relaxed mb-6">{description}</p>
          <div className="flex gap-4">
            {socials.map((s, i) => (
              <a
                key={s.id ?? i}
                href={s.url}
                aria-label={s.platform}
                className="w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center hover:bg-[var(--theme-primary)] hover:text-white transition-colors"
              >
                <SocialIcon platform={s.platform} className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        {cols.map((col, i) => (
          <div key={col.id ?? i}>
            <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-6">
              {col.title}
            </h4>
            <ul className="space-y-3 font-sans text-sm">
              {col.links.map((l, j) => (
                <li key={j}>
                  <Link href={l.url} className="hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="max-w-[1320px] mx-auto mt-16 pt-8 border-t border-[#1a1a1a] flex flex-col md:flex-row items-center justify-between gap-4 font-sans text-xs">
        <p>{copy}</p>
        <div className="flex gap-4">
          {legals.map((l, i) => (
            <Link key={i} href={l.url} className="hover:text-white transition-colors">
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
