import type { Prisma } from "@prisma/client";

import { loadEnv } from "./_env";

loadEnv();

// Backfills the transactional system CMS pages (booking success / cancelled)
// into EVERY existing salon database in the control registry. New salons get
// these from tenant-provision; this covers salons provisioned before the pages
// existed. Idempotent and non-destructive: a page that already exists for a
// salon (possibly admin-edited) is left untouched — only missing ones are added.
//
// Usage: npm run backfill:system-pages

async function main() {
  const { controlDb } = await import("../lib/db/control");
  const { decryptSecret } = await import("../lib/crypto/secret");
  const { getTenantClient } = await import("../lib/db/tenant-client");
  const { systemCmsPages } = await import("../lib/admin/cms-data");

  const json = (v: unknown) => v as unknown as Prisma.InputJsonValue;

  const tenants = await controlDb.tenant.findMany({
    orderBy: { createdAt: "asc" },
    select: { slug: true, domain: true, databaseUrl: true },
  });

  if (tenants.length === 0) {
    console.log("No tenants registered.");
    await controlDb.$disconnect();
    return;
  }

  console.log(
    `Backfilling ${systemCmsPages.length} system page(s) into ${tenants.length} salon database(s)…`,
  );
  let failures = 0;

  for (const tenant of tenants) {
    console.log(`\n→ ${tenant.slug} (${tenant.domain})`);
    const db = getTenantClient(decryptSecret(tenant.databaseUrl));
    try {
      const ws = await db.workspace.findFirst({ select: { id: true } });
      if (!ws) {
        failures++;
        console.error(`  ✗ No workspace found — skipping`);
        continue;
      }
      for (const page of systemCmsPages) {
        const created = await db.cmsPage.upsert({
          where: { workspaceId_slug: { workspaceId: ws.id, slug: page.slug } },
          // No-op when the page already exists, so admin edits are preserved.
          update: {},
          create: {
            workspaceId: ws.id,
            title: page.title,
            slug: page.slug,
            status: page.status,
            blocks: json(page.blocks),
            seo: json(page.seo),
          },
          select: { createdAt: true, updatedAt: true },
        });
        const wasCreated =
          created.createdAt.getTime() === created.updatedAt.getTime();
        console.log(`  • ${page.slug} ${wasCreated ? "(created)" : "(exists, kept)"}`);
      }
    } catch (e) {
      failures++;
      console.error(`  ✗ Failed:`, e instanceof Error ? e.message : e);
    } finally {
      await db.$disconnect();
    }
  }

  await controlDb.$disconnect();

  if (failures > 0) {
    console.error(`\nDone with ${failures} failure(s).`);
    process.exit(1);
  }
  console.log("\n✔ System pages backfilled into all tenant databases.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
