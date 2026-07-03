# Deploying the platform (Docker + nginx)

End-to-end guide to stand up the multi-tenant salon platform on a single Linux
server using Docker Compose. TLS is terminated upstream (Cloudflare / load
balancer); nginx here speaks plain HTTP on port 80.

## How it fits together

```
Cloudflare / LB (TLS)  ──HTTP──▶  nginx :80  ──proxy──▶  app :3000 (Next standalone)
                                    │                          │
                            per-domain server_name      getTenantDb() → control DB
                                                                │  (Host → salon lookup)
                                                          postgres :5432
                                                     ├─ sma_control   (registry + masters)
                                                     ├─ salon_reine    (one DB per salon)
                                                     └─ salon_alpha …
```

Each salon is served on its own domain. The app reads the request `Host` header,
looks the domain up in the **control-plane** `Tenant` registry, and connects to
that salon's **private** database (see [proxy.ts](../proxy.ts) and
[lib/db/tenant.ts](../lib/db/tenant.ts)). nginx contains no tenant logic — it just
forwards each domain to the single app container.

The repo ships four pieces of infra:
- [Dockerfile](../Dockerfile) — multi-stage build (`runner` = slim runtime,
  `tools` = migrations/provisioning).
- [docker-compose.yml](../docker-compose.yml) — `postgres`, `app`, `nginx`, `tools`.
- [docker/nginx/conf.d/sma.conf](../docker/nginx/conf.d/sma.conf) — per-domain proxy.
- [.env.docker.example](../.env.docker.example) — deployment env template.

## Prerequisites

- A Linux server with **Docker Engine + Compose plugin** installed
  (`docker compose version` works).
- DNS records for the platform host and every salon domain pointing at the server
  (or at Cloudflare proxying to it).
- If using Cloudflare, set SSL mode to **Full** and ensure the original `Host`
  header is preserved (Cloudflare does this by default).

> **TL;DR (with `make`):** `make env` → edit `.env` → `make setup` → provision a salon
> (`make new-tenant …`, see [adding-a-tenant.md](./adding-a-tenant.md)) → `make up`.
> Run `make` with no target to list everything. The steps below show both the `make`
> target and the raw command it runs.

## 1. Get the code and configure

```bash
git clone <repo-url> sma && cd sma
make env          # copies .env.docker.example → .env with generated secrets
```

`make env` ([scripts/ops/bootstrap-env.sh](../scripts/ops/bootstrap-env.sh)) fills
`TENANT_DB_ENC_KEY` and `JWT_ACCESS_SECRET` with `openssl rand` and refuses to clobber an
existing `.env`. Then edit `.env` and set the remaining real values.

Key variables (full list in [.env.docker.example](../.env.docker.example)):

| Variable | Notes |
|---|---|
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | Credentials for the `postgres` container. `POSTGRES_DB` is the control DB (`sma_control`). |
| `CONTROL_DATABASE_URL` | Points at `@postgres:5432/sma_control` (service name, **not** localhost). |
| `TENANT_DB_ENC_KEY` | Encrypts stored salon connection strings. Keep it stable — rotating it orphans every registered salon. |
| `PLATFORM_HOST` | The master-console domain. Must match a `server_name` in the nginx config. |
| `JWT_ACCESS_SECRET` / `JWT_ACCESS_TTL` | Auth signing. |
| `NEXT_PUBLIC_SITE_URL` | Public https URL of the platform. |

## 2. Set the platform server name

Edit [docker/nginx/conf.d/sma.conf](../docker/nginx/conf.d/sma.conf): change the
platform block's `server_name` to your `PLATFORM_HOST`. Salon blocks are added later as
their own `conf.d/tenant-<slug>.conf` files by `make new-tenant` — you don't touch this
file per salon.

## 3. Build and initialize the control plane

```bash
make setup
```

`make setup` runs: `docker compose build` → `docker compose up -d postgres` →
`docker compose run --rm tools npm run control:push` (control tables) →
`... control:seed` (master admin + gateways). The `tools` run waits for Postgres to be
healthy automatically.

`control:seed` creates the platform master admin from
[prisma/control/seed.ts](../prisma/control/seed.ts):

> **Change the seeded master password.** Defaults are `admin@nssolutions.com` /
> `Admin@12345`. Sign in on the platform host and change it immediately (or edit
> the seed before running).

## 4. Provision your first salon (optional now, or later)

```bash
make new-tenant NAME="Salon Alpha" SLUG=alpha DOMAIN=alpha.example.com \
  ADMIN_NAME=Alice ADMIN_EMAIL=alice@alpha.example.com ADMIN_PASSWORD=secret123
```

See [adding-a-tenant.md](./adding-a-tenant.md) for what this does. At minimum you need one
salon (or mark it `PRIMARY=1`) before any salon domain resolves.

## 5. Start the app and nginx

```bash
make up                       # docker compose up -d app nginx
make ps                       # status
make logs s=app               # follow app logs
```

## 6. Smoke test

```bash
# Platform console:
curl -sI -H "Host: platform.example.com" http://SERVER_IP/ | head -n1

# A provisioned salon:
curl -sI -H "Host: alpha.example.com" http://SERVER_IP/ | head -n1

# Unknown host → nginx drops the connection (444):
curl -sI -H "Host: nope.example.com" http://SERVER_IP/
```

Then browse to the real domains over HTTPS through Cloudflare/your LB.

## Updates and rollbacks

```bash
git pull
make deploy        # docker compose build && up -d app nginx (recreates with the new image)
```

To roll back, check out the previous commit/tag and `make deploy` again. Postgres data
lives in the `pgdata` volume and is untouched by app redeploys.

## Make targets

| Target | What it does |
|---|---|
| `make env` | Create `.env` from the template with generated secrets. |
| `make setup` | Build + start Postgres + push/seed the control plane. |
| `make up` / `make down` | Start / stop app + nginx. |
| `make deploy` | Rebuild and recreate app + nginx. |
| `make new-tenant …` | Onboard a salon (DB + provision + nginx + reload). |
| `make remove-tenant SLUG=… [PURGE=1]` | Disable (or purge) a salon. |
| `make migrate-tenants` | Roll the tenant schema out to every salon DB. |
| `make backup` | Dump all databases to `./backups/`. |
| `make logs s=app` / `make ps` | Tail logs / show status. |
| `make nginx-reload` | Validate + reload nginx. |

Run `make` with no target for the full list.

## Operational notes

- **Logs:** `make logs s=app` (or `s=nginx` / `s=postgres`).
- **Reload nginx after editing the config:** `make nginx-reload`.
- **Back up the database:** `make backup` → timestamped dump under `./backups/`
  (control DB **and** every salon DB on the instance).
- **Prisma engine sanity check:** after first boot, confirm there's no
  `query engine ... not found` in `docker compose logs app`. If there is, see the
  mitigation note in [migrations.md](./migrations.md#prisma-engine-in-the-standalone-image).
- Related: [migrations.md](./migrations.md) (schema changes),
  [adding-a-tenant.md](./adding-a-tenant.md) (onboard a salon),
  [tenant-provisioning.md](./tenant-provisioning.md) (the provisioning script).
