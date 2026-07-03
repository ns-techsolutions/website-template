import { spawnSync } from "node:child_process";

import { loadEnv } from "./_env";

loadEnv();

// Rolls the current tenant schema out to EVERY salon database in the registry.
// Run this after editing prisma/tenant/schema.prisma so all salons stay in sync.
//
// Usage: npm run migrate:all-tenants
//        npm run migrate:all-tenants -- --accept-data-loss   (local / interactive)
//        ACCEPT_DATA_LOSS=1 npm run migrate:all-tenants       (Cloud Run Job env)
//
// Prisma demands `--accept-data-loss` for ANY index/constraint change even when
// it isn't actually destructive (e.g. adding a unique index). Enable it once
// you've confirmed the diff is safe — `prisma migrate diff` shows the SQL.
// In a Cloud Run Job the container args are fixed, so the env var is the way in;
// it accepts genuinely destructive changes too, so keep it off by default and
// set it deliberately per migration.

function acceptsDataLoss(passthrough: string[]): boolean {
  return (
    passthrough.includes("--accept-data-loss") ||
    /^(1|true|yes)$/i.test(process.env.ACCEPT_DATA_LOSS ?? "")
  );
}

async function main() {
  // Extra flags to forward to `prisma db push` (e.g. --accept-data-loss).
  const passthrough = process.argv.slice(2);
  const dbPushArgs = [...passthrough];
  if (acceptsDataLoss(passthrough) && !dbPushArgs.includes("--accept-data-loss")) {
    dbPushArgs.push("--accept-data-loss");
  }
  if (dbPushArgs.includes("--accept-data-loss")) {
    console.warn(
      "⚠️  --accept-data-loss is ON: destructive schema changes WILL be applied.",
    );
  }

  const { controlDb } = await import("../lib/db/control");
  const { decryptSecret } = await import("../lib/crypto/secret");

  const tenants = await controlDb.tenant.findMany({
    orderBy: { createdAt: "asc" },
    select: { slug: true, domain: true, databaseUrl: true },
  });

  if (tenants.length === 0) {
    console.log("No tenants registered.");
    await controlDb.$disconnect();
    return;
  }

  console.log(`Pushing tenant schema to ${tenants.length} salon database(s)…`);
  let failures = 0;

  for (const tenant of tenants) {
    console.log(`\n→ ${tenant.slug} (${tenant.domain})`);
    const result = spawnSync(
      "npx",
      [
        "prisma",
        "db",
        "push",
        "--schema",
        "prisma/tenant/schema.prisma",
        "--skip-generate",
        ...dbPushArgs,
      ],
      {
        stdio: "inherit",
        shell: true,
        env: { ...process.env, DATABASE_URL: decryptSecret(tenant.databaseUrl) },
      },
    );
    if (result.status !== 0) {
      failures++;
      console.error(`✗ Failed for ${tenant.slug}`);
    }
  }

  await controlDb.$disconnect();

  if (failures > 0) {
    console.error(`\nDone with ${failures} failure(s).`);
    process.exit(1);
  }
  console.log("\n✔ All tenant databases up to date.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
