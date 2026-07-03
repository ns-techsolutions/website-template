import { spawnSync } from "node:child_process";

import { loadEnv } from "./_env";

loadEnv();

// Provisions a new salon end-to-end (v1, manual connection string):
//   1. pushes the tenant schema to the salon's empty database
//   2. seeds its workspace + default settings + bound tenant admin
//   3. registers it in the control-plane Tenant registry (encrypted URL)
//
// Usage:
//   npm run provision:tenant -- \
//     --name "Salon Alpha" --slug salon-alpha --domain alpha.example.com \
//     --db "postgresql://user:pass@host/db?sslmode=require" \
//     --admin-name "Alice" --admin-email alice@alpha.com --admin-password "secret123" \
//     [--accent "#2d3b64"] [--plan starter] [--primary]

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
    if (next === undefined || next.startsWith("--")) {
      args[key] = true;
    } else {
      args[key] = next;
      i++;
    }
  }
  return args;
}

function str(args: Args, key: string, required = true): string {
  const v = args[key];
  if (typeof v === "string" && v.length > 0) return v;
  if (required) {
    console.error(`Missing required --${key}`);
    process.exit(1);
  }
  return "";
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const name = str(args, "name");
  const slug = str(args, "slug");
  const domain = str(args, "domain").toLowerCase();
  const databaseUrl = str(args, "db");
  const adminName = str(args, "admin-name");
  const adminEmail = str(args, "admin-email").toLowerCase();
  const adminPassword = str(args, "admin-password");
  const accent = str(args, "accent", false) || "#2d3b64";
  const plan = str(args, "plan", false) || "starter";
  const isPrimary = args.primary === true;

  // 1. Push the tenant schema to the salon's database.
  console.log(`→ Pushing tenant schema to ${domain}'s database…`);
  const push = spawnSync(
    "npx",
    ["prisma", "db", "push", "--schema", "prisma/tenant/schema.prisma", "--skip-generate"],
    {
      stdio: "inherit",
      shell: true,
      env: { ...process.env, DATABASE_URL: databaseUrl },
    },
  );
  if (push.status !== 0) {
    console.error("prisma db push failed.");
    process.exit(push.status ?? 1);
  }

  // Imported after env is loaded so control/crypto see the right variables.
  const { getTenantClient } = await import("../lib/db/tenant-client");
  const { seedTenantDatabase } = await import("../lib/db/tenant-provision");
  const { controlDb } = await import("../lib/db/control");
  const { encryptSecret } = await import("../lib/crypto/secret");
  const { hashPassword } = await import("../lib/auth/password");

  // 2. Seed the salon database.
  console.log("→ Seeding workspace, settings and admin…");
  const db = getTenantClient(databaseUrl);
  await seedTenantDatabase(db, {
    name,
    slug,
    domain,
    plan,
    accent,
    adminName,
    adminEmail,
    adminPasswordHash: await hashPassword(adminPassword),
  });

  // 3. Register in the control-plane.
  console.log("→ Registering salon in the control-plane…");
  await controlDb.tenant.upsert({
    where: { slug },
    update: {
      name,
      domain,
      databaseUrl: encryptSecret(databaseUrl),
      plan,
      accent,
      owner: adminName,
      status: "active",
      isPrimary,
    },
    create: {
      name,
      slug,
      domain,
      databaseUrl: encryptSecret(databaseUrl),
      plan,
      accent,
      owner: adminName,
      status: "active",
      isPrimary,
    },
  });

  console.log(`✔ Provisioned "${name}" (${domain}). Admin: ${adminEmail}`);
  await controlDb.$disconnect();
  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
