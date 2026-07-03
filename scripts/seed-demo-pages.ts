import { PrismaClient, Prisma } from "@prisma/client";

import { loadEnv } from "./_env";
import {
  cmsPages,
  mediaAssets,
  headerMenu,
  headerButtons,
  footerColumns,
  footerCopyright,
  socialLinks,
  siteAppearance,
} from "../lib/admin/cms-data";

loadEnv();

// Populates an already-provisioned salon database with the Reine demo CMS
// content: every page and its content blocks, the media library, and the demo
// header/footer (unless --pages-only). Targets the single workspace row in
// DATABASE_URL's database — use this to give a freshly provisioned salon
// (which starts with no CMS pages and blank header/footer settings) something
// to show on the public site.
//
// Run: DATABASE_URL="postgres://…/salon_rein" npm run seed:demo-pages
// Flags: --pages-only  skip media and header/footer settings

const prisma = new PrismaClient();
const json = (v: unknown) => v as unknown as Prisma.InputJsonValue;
const pagesOnly = process.argv.includes("--pages-only");

async function main() {
  const workspace = await prisma.workspace.findFirst();
  if (!workspace) {
    throw new Error(
      "No workspace found in this database — provision the tenant first.",
    );
  }

  for (const page of cmsPages) {
    await prisma.cmsPage.upsert({
      where: { workspaceId_slug: { workspaceId: workspace.id, slug: page.slug } },
      update: {
        title: page.title,
        status: page.status,
        blocks: json(page.blocks),
        seo: json(page.seo),
      },
      create: {
        workspaceId: workspace.id,
        title: page.title,
        slug: page.slug,
        status: page.status,
        blocks: json(page.blocks),
        seo: json(page.seo),
      },
    });
  }
  console.log(`Seeded ${cmsPages.length} pages for workspace "${workspace.name}".`);

  if (pagesOnly) return;

  for (const m of mediaAssets) {
    await prisma.mediaAsset.upsert({
      where: { id: m.id },
      update: {
        workspaceId: workspace.id,
        name: m.name,
        url: m.url,
        sizeKb: m.sizeKb,
        width: m.width,
        height: m.height,
      },
      create: {
        id: m.id,
        workspaceId: workspace.id,
        name: m.name,
        url: m.url,
        sizeKb: m.sizeKb,
        width: m.width,
        height: m.height,
        uploadedAt: new Date(m.uploadedAt),
      },
    });
  }
  console.log(`Seeded ${mediaAssets.length} media assets.`);

  await prisma.siteSettings.upsert({
    where: { workspaceId: workspace.id },
    update: {
      appearance: json(siteAppearance),
      headerMenu: json({ links: headerMenu, buttons: headerButtons }),
      footerColumns: json({ columns: footerColumns, copyright: footerCopyright }),
      socialLinks: json(socialLinks),
    },
    create: {
      workspaceId: workspace.id,
      appearance: json(siteAppearance),
      headerMenu: json({ links: headerMenu, buttons: headerButtons }),
      footerColumns: json({ columns: footerColumns, copyright: footerCopyright }),
      socialLinks: json(socialLinks),
    },
  });
  console.log("Seeded header/footer settings.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
