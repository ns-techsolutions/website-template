import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getPublishedPageBySlug, getSalonContent } from "@/lib/cms/public";
import { PublicBlockRenderer } from "@/components/cms/public-block-renderer";
import { PublicNavbar } from "@/components/common/PublicNavbar";
import type { BlockType } from "@/lib/admin/types";

function slugToPath(slug?: string[]): string {
  return slug?.length ? `/${slug.join("/")}` : "/";
}

// Blocks that render live salon data and therefore need getSalonContent().
const SALON_DATA_BLOCKS = new Set<BlockType>([
  "workingHours",
  "priceMenu",
  "contactSplit",
  "team",
]);

// Blocks whose top is a dark, full-bleed header that the transparent navbar is
// meant to overlay. Any other first block is a light page, so the navbar renders
// in its solid (legible) mode instead.
const NAV_OVERLAY_BLOCKS = new Set<BlockType>([
  "hero",
  "bookAppointment",
  "bookingSuccess",
  "bookingCancelled",
]);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPublishedPageBySlug(slugToPath(slug));
  if (!page) return {};
  // Per-page overrides only. Fields left undefined inherit the site-wide
  // defaults from app/(public)/layout.tsx: the title is wrapped by the
  // Appearance title template, and description/ogImage fall back to the
  // Appearance defaults.
  return {
    title: page.seo.title || page.title,
    description: page.seo.description || undefined,
    openGraph: page.seo.ogImage ? { images: [page.seo.ogImage] } : undefined,
  };
}

export default async function PublicCmsPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;
  const page = await getPublishedPageBySlug(slugToPath(slug));
  if (!page || page.blocks.length === 0) notFound();

  const needsSalonData = page.blocks.some((b) => SALON_DATA_BLOCKS.has(b.type));
  const salon = needsSalonData ? await getSalonContent() : null;

  // The navbar overlays the page's first visible block only when that block is a
  // dark hero; light pages get the solid navbar so it stays legible.
  const firstVisible = page.blocks.find((b) => b.visible);
  const overlayNav = !!firstVisible && NAV_OVERLAY_BLOCKS.has(firstVisible.type);

  return (
    <>
      <PublicNavbar overlay={overlayNav} />
      <main className="bg-background text-foreground">
        <PublicBlockRenderer blocks={page.blocks} salon={salon} />
      </main>
    </>
  );
}
