import { loadEnv } from "../../scripts/_env";

loadEnv();

// Seeds the CONTROL-PLANE database: the platform master admin, and (optionally)
// registers the demo "reine" salon when REINE_DATABASE_URL is provided.
//
// The master admin is the PLATFORM super-admin and is NOT tied to any salon.
// "reine" is just a demo salon (a tenant) — it has its own separate admin inside
// its own database (see prisma/tenant/seed.ts). Keep the two identities distinct.
//
// Run: npm run control:push && npm run control:seed

const MASTER_EMAIL = "admin@nssolutions.com";
const MASTER_PASSWORD = "Asdf@123"; // change after first sign-in

async function main() {
  const { controlDb } = await import("../../lib/db/control");
  const { hashPassword } = await import("../../lib/auth/password");
  const { encryptSecret } = await import("../../lib/crypto/secret");

  await controlDb.masterAdmin.upsert({
    where: { email: MASTER_EMAIL },
    update: { password: await hashPassword(MASTER_PASSWORD) },
    create: {
      name: "Master Admin",
      email: MASTER_EMAIL,
      password: await hashPassword(MASTER_PASSWORD)
    }
  });

  // Seed the payment-gateway registry. "none" (pay at salon) is enabled by
  // default so every salon can take bookings without configuring a provider.
  const gateways = [
    { provider: "none", label: "Pay at salon (no online payment)", enabled: true },
    { provider: "stripe", label: "Stripe", enabled: false }
  ];
  for (const g of gateways) {
    await controlDb.paymentGateway.upsert({
      where: { provider: g.provider },
      update: { label: g.label },
      create: g
    });
  }
  console.log(`Seeded ${gateways.length} payment gateways.`);

  const reineUrl = process.env.REINE_DATABASE_URL;
  if (reineUrl) {
    await controlDb.tenant.upsert({
      where: { slug: "reine" },
      update: { databaseUrl: encryptSecret(reineUrl), isPrimary: true },
      create: {
        name: "Reine Studio",
        slug: "reine",
        domain: process.env.REINE_DOMAIN ?? "reine.com",
        databaseUrl: encryptSecret(reineUrl),
        plan: "pro",
        status: "active",
        accent: "#2d3b64",
        owner: "Reine Studio",
        isPrimary: true
      }
    });
    console.log("Registered primary salon 'reine' in the control-plane.");
  } else {
    console.log(
      "Set REINE_DATABASE_URL (and optionally REINE_DOMAIN) to also register the primary salon."
    );
  }

  console.log(`Seeded master admin (${MASTER_EMAIL}).`);
  await controlDb.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
