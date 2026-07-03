import { spawnSync } from "node:child_process";

import type { Prisma as TenantPrisma } from "@prisma/client";

import { loadEnv } from "./_env";

loadEnv();

// ONE-OFF migration: copies a salon's data out of the old shared database into
// its new private database, then registers it in the control-plane. Use this
// once when moving from the shared-DB model to database-per-tenant. The old
// shared DB is repurposed as the control-plane afterwards.
//
// Usage:
//   npm run extract:tenant -- \
//     --from "postgres://old-shared-db" \
//     --to "postgres://new-salon-db" \
//     --slug reine --domain reine.com [--primary]

interface Args {
  [key: string]: string | boolean;
}

function parseArgs(argv: string[]): Args {
  const args: Args = {};
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) args[key] = true;
    else {
      args[key] = next;
      i++;
    }
  }
  return args;
}

function str(args: Args, key: string): string {
  const v = args[key];
  if (typeof v === "string" && v.length > 0) return v;
  console.error(`Missing required --${key}`);
  process.exit(1);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const fromUrl = str(args, "from");
  const toUrl = str(args, "to");
  const slug = str(args, "slug");
  const domain = str(args, "domain").toLowerCase();
  const isPrimary = args.primary === true;

  // Ensure the target schema exists.
  console.log("→ Pushing tenant schema to the target database…");
  const push = spawnSync(
    "npx",
    ["prisma", "db", "push", "--schema", "prisma/tenant/schema.prisma", "--skip-generate"],
    { stdio: "inherit", shell: true, env: { ...process.env, DATABASE_URL: toUrl } },
  );
  if (push.status !== 0) process.exit(push.status ?? 1);

  const { getTenantClient } = await import("../lib/db/tenant-client");
  const { controlDb } = await import("../lib/db/control");
  const { encryptSecret } = await import("../lib/crypto/secret");

  const source = getTenantClient(fromUrl);
  const target = getTenantClient(toUrl);

  // Pick the workspace to extract (by slug, else the primary, else the first).
  const workspace =
    (await source.workspace.findUnique({ where: { slug } })) ??
    (await source.workspace.findFirst({ where: { isPrimary: true } })) ??
    (await source.workspace.findFirst());
  if (!workspace) {
    console.error("No workspace found in the source database.");
    process.exit(1);
  }

  const [pages, media, settings, members, bookings] = await Promise.all([
    source.cmsPage.findMany({ where: { workspaceId: workspace.id } }),
    source.mediaAsset.findMany({ where: { workspaceId: workspace.id } }),
    source.siteSettings.findUnique({ where: { workspaceId: workspace.id } }),
    // tenant admins + customers only — master admins belong in the control-plane
    source.user.findMany({ where: { role: { in: ["tenant", "customer"] } } }),
    source.booking.findMany(),
  ]);

  console.log(
    `→ Copying workspace "${workspace.name}": ${pages.length} pages, ` +
      `${media.length} media, ${members.length} users, ` +
      `${bookings.length} bookings…`,
  );

  // Preserve ids so relations stay intact. Order respects FK dependencies.
  // Json columns come back as `JsonValue` (nullable) but write as `InputJsonValue`;
  // the rows are valid round-trips, so we cast through `unknown`.
  const j = <T>(rows: unknown): T => rows as T;

  await target.workspace.create({ data: workspace });
  await target.user.createMany({ data: members, skipDuplicates: true });
  await target.booking.createMany({ data: bookings, skipDuplicates: true });
  if (pages.length)
    await target.cmsPage.createMany({
      data: j<TenantPrisma.CmsPageCreateManyInput[]>(pages),
      skipDuplicates: true,
    });
  if (media.length)
    await target.mediaAsset.createMany({ data: media, skipDuplicates: true });
  if (settings)
    await target.siteSettings.create({
      data: j<TenantPrisma.SiteSettingsUncheckedCreateInput>(settings),
    });

  await controlDb.tenant.upsert({
    where: { slug },
    update: { databaseUrl: encryptSecret(toUrl), domain, isPrimary },
    create: {
      name: workspace.name,
      slug,
      domain,
      databaseUrl: encryptSecret(toUrl),
      plan: workspace.plan,
      status: workspace.status,
      accent: workspace.accent,
      owner: workspace.owner,
      isPrimary,
    },
  });

  console.log(`✔ Extracted "${workspace.name}" to its own database and registered it.`);
  await Promise.all([source.$disconnect(), target.$disconnect(), controlDb.$disconnect()]);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
