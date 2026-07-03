# Onboarding a salon (Docker + nginx)

Step-by-step for adding a new salon to a running Docker deployment. This wraps the
provisioning script ([tenant-provisioning.md](./tenant-provisioning.md)) with the
infra steps (database creation, nginx, DNS) needed in production.

A salon needs three things to go live:
1. its own **empty** Postgres database,
2. a **registry row + seeded admin** (the provisioning script does both),
3. an **nginx server block** for its domain + **DNS** pointing at the server.

Throughout, replace `alpha` / `alpha.example.com` with the real slug/domain.

## Quick way (recommended)

One command does all of it — creates the DB, provisions, writes the nginx block, and
reloads nginx:

```bash
make new-tenant \
  NAME="Salon Alpha" SLUG=alpha DOMAIN=alpha.example.com \
  ADMIN_NAME="Alice" ADMIN_EMAIL=alice@alpha.example.com ADMIN_PASSWORD=secret123
# optional: ACCENT="#2d3b64" PLAN=starter PRIMARY=1
```

It guards the dangerous bits: it **aborts if the salon DB already exists** (the seed is
not idempotent) and rolls back the generated nginx file if `nginx -t` fails. Then point
DNS at the server and verify (step 5 below). Backed by
[scripts/ops/new-tenant.sh](../scripts/ops/new-tenant.sh).

To take a salon offline:

```bash
make remove-tenant SLUG=alpha            # disable: removes nginx routing + sets status=disabled
make remove-tenant SLUG=alpha PURGE=1    # destructive: also drops the DB + registry row
```

The rest of this page is **what `make new-tenant` does under the hood** — useful for
debugging or doing it by hand.

## 1. Create the salon's database

Each salon gets a physically separate database on the `postgres` container:

```bash
docker compose exec postgres \
  createdb -U "$POSTGRES_USER" salon_alpha
```

(If you load `.env` into your shell, `$POSTGRES_USER` resolves; otherwise type the
user.) The database must be **empty** — the provisioning seed is not idempotent.

## 2. Provision the salon

Runs schema push + workspace/admin seed + control-plane registration in one go via
the `tools` container. The `--db` host is the `postgres` service name:

```bash
docker compose run --rm tools npm run provision:tenant -- \
  --name "Salon Alpha" --slug alpha --domain alpha.example.com \
  --db "postgresql://$POSTGRES_USER:$POSTGRES_PASSWORD@postgres:5432/salon_alpha?schema=public" \
  --admin-name "Alice" --admin-email alice@alpha.example.com --admin-password "secret123" \
  --accent "#2d3b64" --plan starter
```

Notes:
- `--domain` is a **bare host** — no `http://`, no trailing `/`. It must match the
  `server_name` you add in step 3.
- The registry row is an **upsert by `--slug`**, but the salon-DB seed is **not** —
  only run this against a fresh, empty database (step 1).
- Add `--primary` for the dev/fallback salon (unknown non-platform hosts resolve to
  it outside production). See [tenant-provisioning.md](./tenant-provisioning.md) for
  the full flag reference.

## 3. Add the nginx server block

Render a per-salon config from the template into the bind-mounted `conf.d/` (every
`conf.d/*.conf` is auto-included — no edits to `sma.conf`):

```bash
sed "s/__DOMAIN__/alpha.example.com/g" \
  docker/nginx/tenant.conf.template > docker/nginx/conf.d/tenant-alpha.conf
```

Reload nginx (no downtime, no rebuild):

```bash
docker compose exec nginx nginx -t      # validate config
docker compose exec nginx nginx -s reload
```

These `tenant-<slug>.conf` files live in the bind-mounted volume and persist on the
server across redeploys; commit them if you want the routing reproducible from a fresh
clone.

## 4. DNS / TLS

Point the salon domain at the server (or at Cloudflare proxying to it). Because TLS
is terminated upstream, no certificate work happens on the server — just ensure the
upstream forwards the original `Host` header.

## 5. Verify

```bash
# Through nginx on the server:
curl -sI -H "Host: alpha.example.com" http://SERVER_IP/ | head -n1   # expect 200

# Then over HTTPS once DNS/TLS is live:
curl -sI https://alpha.example.com/ | head -n1
```

The salon admin signs in with the `--admin-email` / `--admin-password` you set, on
the salon's own domain.

## Removing / disabling a salon

Use `make remove-tenant` (above), or by hand:

- **Disable** (`make remove-tenant SLUG=alpha`): removes `conf.d/tenant-alpha.conf`,
  reloads nginx, and sets the registry row's `status` to `disabled` — the host lookup in
  [lib/db/tenant.ts](../lib/db/tenant.ts) only resolves `active` salons (the 30s host
  cache self-heals). Data is untouched.
- **Delete** (`make remove-tenant SLUG=alpha PURGE=1`): also drops the database
  (`dropdb --force salon_alpha`) and deletes the registry row. Irreversible — run
  `make backup` first.

---

See also: [deployment.md](./deployment.md) (full server setup),
[migrations.md](./migrations.md) (schema changes across all salons).
