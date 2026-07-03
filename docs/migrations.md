# Schema changes & migrations

The platform has **two** Prisma schemas. Changing each one follows a different
path. Always know which you're touching.

| Schema | File | Database(s) | Client output |
|---|---|---|---|
| Control-plane | [prisma/control/schema.prisma](../prisma/control/schema.prisma) | the single `sma_control` DB | `lib/db/generated/control` |
| Tenant | [prisma/tenant/schema.prisma](../prisma/tenant/schema.prisma) | **every** salon DB (one each) | default `@prisma/client` |

Both currently use Prisma's `db push` (schema sync), not versioned migration
files. Push is destructive for incompatible column changes — see the safety note
at the bottom.

All commands below run through the one-off **`tools`** container (full deps +
Prisma CLI + `tsx`), which never starts on `docker compose up`:

```bash
docker compose run --rm tools <command>
```

## Control-plane schema change

For changes to the registry / master-admin / payment-gateway models.

```bash
# 1. Edit prisma/control/schema.prisma
# 2. Push to the control DB (also regenerates lib/db/generated/control):
make control-push        # = docker compose run --rm tools npm run control:push
# 3. Rebuild & redeploy so the app uses the regenerated client:
make deploy              # = docker compose build && up -d app nginx
```

## Tenant schema change (rolls out to ALL salons)

For changes to per-salon models (users, bookings, CMS, etc.). This is the common
case and it must reach **every** registered salon database.

```bash
# 1. Edit prisma/tenant/schema.prisma
# 2. Push the new schema to every salon DB in the registry:
make migrate-tenants     # = docker compose run --rm tools npm run migrate:all-tenants
# 3. Rebuild & redeploy the app so runtime types/queries match the new schema:
make deploy              # = docker compose build && up -d app nginx
```

`migrate:all-tenants` ([scripts/migrate-all-tenants.ts](../scripts/migrate-all-tenants.ts))
reads the control registry, decrypts each salon's connection string, and runs
`prisma db push` against each one in turn, reporting any failures. The Prisma
client itself is regenerated during the `docker compose build` step (the image's
`postinstall` / build runs `prisma:generate`).

> The established workflow is **generate → migrate-all-tenants → backfill**. If a
> change needs data backfilled in existing salons, write a one-off script and run
> it via `docker compose run --rm tools tsx scripts/<your-script>.ts` after the
> push.

### When Prisma demands `--accept-data-loss`

`db push` refuses to apply **any** index/constraint change non-interactively —
even non-destructive ones like adding a unique index — and exits asking for
`--accept-data-loss`. First confirm the change is safe:

```bash
# Preview the exact SQL the push will run (read-only, applies nothing):
docker compose run --rm tools npx prisma migrate diff \
  --from-schema-datasource prisma/tenant/schema.prisma \
  --to-schema-datamodel prisma/tenant/schema.prisma --script
```

If the SQL is additive (no `DROP`), enable the flag. `migrate:all-tenants`
accepts it two ways:

```bash
# Local / interactive — forward the flag through npm:
npm run migrate:all-tenants -- --accept-data-loss

# Cloud Run Job (fixed container args) — set the env var instead:
ACCEPT_DATA_LOSS=1 npm run migrate:all-tenants
```

A new unique index will still **fail** on a tenant that already holds duplicate
values; that tenant is reported and skipped (no data lost). Clean the dupes (or
drop the constraint) and re-run. The flag also accepts genuinely destructive
changes, so keep it off by default and set it deliberately per migration.

> The "stop the dev server before `prisma:generate`" caveat in
> [tenant-provisioning.md](./tenant-provisioning.md) is a **Windows local-dev**
> issue (a locked query-engine DLL). It does **not** apply inside the Linux
> container.

## Deploy ordering (avoid downtime)

- **Additive change** (new optional column/table, new model): push the schema
  first, then deploy the app. Old app code keeps working against the new schema.
- **Breaking change** (rename/drop/required column): expand → migrate → contract.
  Deploy app code that tolerates both shapes, push the schema, then remove the old
  shape in a later release. `db push` will warn/refuse on data-losing changes
  unless forced — never force in production without a backup.

## Prisma engine in the standalone image

The runtime image ships Next's `standalone` output, which traces only the files it
detects. If `docker compose logs app` shows
`Query engine library for current platform ... could not be found`, the engine
binary missed the trace. Fix by including it explicitly in
[next.config.ts](../next.config.ts):

```ts
const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingIncludes: {
    "/*": [
      "node_modules/.prisma/**",
      "node_modules/@prisma/engines/**",
      "lib/db/generated/control/**",
    ],
  },
};
```

Then `docker compose build app && docker compose up -d app`. (Both schemas build
on Debian glibc with Prisma's default `native` engine target, so no
`binaryTargets` change is required — see the [Dockerfile](../Dockerfile) header.)
