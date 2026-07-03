# Deploying the platform (Cloud Run + CI/CD)

Alternative to [deployment.md](./deployment.md) (single VM + Docker Compose +
nginx). This guide runs the app on **Cloud Run**, the database on **Cloud
SQL**, and ships every push to `main` automatically via **GitHub Actions**.

## How it fits together

```
DNS (every tenant domain + platform host)
        │  A record → LB static IP
        ▼
External HTTPS Load Balancer (global)
  - one Google-managed TLS cert per domain, all attached to one HTTPS proxy
  - URL map has a single default service — NO per-host routing rules
        │
        ▼ Serverless NEG
Cloud Run service "sma-app" (the Dockerfile's `runner` stage)
  - reads the request Host header itself, looks the domain up in the
    control-plane Tenant registry, connects to that salon's DB (see proxy.ts,
    lib/db/tenant.ts) — identical app logic to the VM deployment
        │  Cloud SQL Unix socket (/cloudsql/<connection-name>)
        ▼
Cloud SQL (Postgres)
  ├─ sma_control   (registry + master admins)
  ├─ salon_reine     (one DB per salon)
  └─ salon_alpha …
```

The load balancer has **no tenant logic**, same as nginx in the VM setup — it
just terminates TLS for every onboarded domain and forwards everything to the
one Cloud Run service. The `tools` Dockerfile stage becomes fixed **Cloud
Run Jobs** (`sma-tools-control-push`, `sma-tools-control-seed`,
`sma-tools-migrate-tenants`, `sma-tools-backfill-system-pages`) instead of
`docker compose run --rm tools …`.

The repo ships:
- [Dockerfile](../Dockerfile) — unchanged; `runner` → Cloud Run service image,
  `tools` → Cloud Run Job image.
- [scripts/ops/gcp/bootstrap-gcp.sh](../scripts/ops/gcp/bootstrap-gcp.sh) — one-time
  project setup (APIs, Artifact Registry, Cloud SQL, secrets, service
  accounts, Workload Identity Federation, initial service + jobs).
- [scripts/ops/gcp/setup-lb.sh](../scripts/ops/gcp/setup-lb.sh) — one-time load
  balancer setup.
- [scripts/ops/gcp/add-tenant-domain.sh](../scripts/ops/gcp/add-tenant-domain.sh) —
  per-tenant: attach a managed cert for the new domain.
- [.github/workflows/deploy-cloudrun.yml](../.github/workflows/deploy-cloudrun.yml) —
  build + push + deploy on every push to `main`.
- [.github/workflows/migrate-cloudrun.yml](../.github/workflows/migrate-cloudrun.yml) —
  manual trigger for the three migration jobs.
- [.env.gcp.example](../.env.gcp.example) — config template for the bootstrap scripts.

## Prerequisites

- `gcloud` CLI installed and authenticated (`gcloud auth login`) with
  permission to create resources in the target GCP project (Owner/Editor, or
  the equivalent narrower roles).
- A GCP project with billing enabled.
- Push access to the GitHub repo (to add Actions secrets/variables).

## 1. One-time GCP setup

```bash
cp .env.gcp.example .env.gcp     # fill in project ID, Cloud SQL password, etc.
bash scripts/ops/gcp/bootstrap-gcp.sh
```

This is idempotent — re-run after editing `.env.gcp`. It:
- Enables the required APIs (Run, Cloud SQL Admin, Artifact Registry, Secret
  Manager, Compute, IAM).
- Creates the Artifact Registry repo and the Cloud SQL Postgres instance +
  control database + app user.
- Writes `TENANT_DB_ENC_KEY`, `JWT_ACCESS_SECRET`, and a generated
  `CONTROL_DATABASE_URL` (Cloud SQL Unix-socket form) into Secret Manager.
- Creates two service accounts: a **runtime** SA (Cloud SQL client +
  Secret Manager accessor — what the Cloud Run service/jobs run as) and a
  **deploy** SA (Cloud Run admin + Artifact Registry writer — what GitHub
  Actions impersonates).
- Sets up Workload Identity Federation scoped to this GitHub repo, so
  GitHub Actions authenticates with short-lived OIDC tokens — **no GCP
  service-account key is ever stored in GitHub**.
- Creates the Cloud Run service with a placeholder image (so it exists for the
  load balancer step) and the three migration Cloud Run Jobs.

It prints the values you need next.

### Add GitHub Actions secrets/variables

Settings → Secrets and variables → Actions, in the GitHub repo:

| Type | Name | Value |
|---|---|---|
| Variable | `GCP_PROJECT_ID` | from `.env.gcp` |
| Variable | `GCP_REGION` | from `.env.gcp` |
| Variable | `AR_REPO` | from `.env.gcp` |
| Variable | `SERVICE_NAME` | from `.env.gcp` |
| Variable | `RUNTIME_SA_NAME` | from `.env.gcp` |
| Variable | `CLOUDSQL_INSTANCE` | from `.env.gcp` |
| Variable | `PLATFORM_HOST` | from `.env.gcp` |
| Variable | `PLATFORM_BRAND_NAME` | from `.env.gcp` |
| Variable | `NEXT_PUBLIC_SITE_URL` | from `.env.gcp` |
| Variable | `JWT_ACCESS_TTL` | from `.env.gcp` |
| Secret | `WIF_PROVIDER` | printed by bootstrap-gcp.sh |
| Secret | `DEPLOY_SA` | printed by bootstrap-gcp.sh |

## 2. Load balancer

```bash
bash scripts/ops/gcp/setup-lb.sh
```

Reserves a static IP, creates a Serverless NEG → backend service → URL map →
HTTPS proxy (with a managed cert for `PLATFORM_HOST`) → forwarding rules
(443, plus an 80→443 redirect). Prints the static IP — point an A record for
`PLATFORM_HOST` at it. The managed cert auto-provisions once DNS resolves
(check with `gcloud compute ssl-certificates describe <name>
--format='value(managed.status)'`; can take up to ~60 minutes).

## 3. First deploy

```bash
git push origin main
```

`deploy-cloudrun.yml` builds the `runner` and `tools` images, pushes them to
Artifact Registry, deploys the new revision to the Cloud Run service, and
updates the three migration jobs to the new `tools` image. Watch it under the
repo's **Actions** tab.

Then initialize the control plane (equivalent of `make setup`'s
`control:push` + `control:seed`): run the **"Migrate (Cloud Run)"** workflow
from the Actions tab twice, with `task` = `control-push` then `control-seed`
— or from a shell with `gcloud` auth'd against the project:

```bash
gcloud run jobs execute sma-tools-control-push --region="$GCP_REGION" --wait
gcloud run jobs execute sma-tools-control-seed --region="$GCP_REGION" --wait
```

> **Change the seeded master password** — same defaults and same warning as
> in [deployment.md](./deployment.md#3-build-and-initialize-the-control-plane).

## 4. Onboarding a tenant

Unlike `make new-tenant` (which also generates an nginx file), tenant
onboarding here is two separate, low-traffic steps because the provisioning
script takes per-tenant arguments that don't fit a fixed Cloud Run Job. Use
the [Cloud SQL Auth
Proxy](https://cloud.google.com/sql/docs/postgres/sql-proxy) from your own
machine:

```bash
# 1. Connect to Cloud SQL locally.
cloud-sql-proxy "$INSTANCE_CONNECTION_NAME" --port 5433 &

# 2. Create the salon's database.
PGPASSWORD="$CLOUDSQL_APP_PASSWORD" createdb -h localhost -p 5433 -U "$CLOUDSQL_APP_USER" salon_alpha

# 3. Provision (schema push + admin + control-plane registration) — same
#    npm script as the VM deployment, see scripts/provision-tenant.ts.
CONTROL_DATABASE_URL="postgresql://$CLOUDSQL_APP_USER:$CLOUDSQL_APP_PASSWORD@localhost:5433/sma_control?schema=public" \
npm run provision:tenant -- \
  --name "Salon Alpha" --slug alpha --domain alpha.example.com \
  --db "postgresql://$CLOUDSQL_APP_USER:$CLOUDSQL_APP_PASSWORD@localhost:5433/salon_alpha?schema=public" \
  --admin-name Alice --admin-email alice@alpha.example.com --admin-password secret123

# 4. Give the new domain a TLS cert on the load balancer.
DOMAIN=alpha.example.com bash scripts/ops/gcp/add-tenant-domain.sh
```

Then point the salon's DNS A record at the LB static IP. See
[adding-a-tenant.md](./adding-a-tenant.md) for what `provision:tenant` does.

To remove a tenant, connect the same way and run the same SQL/`dropdb` steps
as [remove-tenant.sh](../scripts/ops/remove-tenant.sh) does for the VM
deployment (it can't be reused directly — it shells out to `docker compose`).

## Updates and rollbacks

Pushing to `main` is the update path. To roll back, revert or check out the
previous commit and push (or re-run the workflow against an older commit) —
`deploy-cloudrun.yml` will redeploy that image. Cloud Run also keeps prior
revisions; you can shift traffic back immediately without rebuilding:

```bash
gcloud run revisions list --service="$SERVICE_NAME" --region="$GCP_REGION"
gcloud run services update-traffic "$SERVICE_NAME" --region="$GCP_REGION" --to-revisions=<REVISION>=100
```

## Operational notes

- **Logs:** Cloud Logging → filter on `resource.type="cloud_run_revision"`, or
  `gcloud run services logs read "$SERVICE_NAME" --region="$GCP_REGION"`.
- **Migrations are manual**, same as the VM Makefile — `deploy-cloudrun.yml`
  never runs them automatically. Trigger the "Migrate (Cloud Run)" workflow
  after a schema change ships.
- **Backups:** Cloud SQL automated backups are enabled by
  `bootstrap-gcp.sh` (`--backup`). For on-demand dumps, use
  `gcloud sql export sql` or connect via the proxy and `pg_dump`.
- **Cert limits at scale:** each tenant domain gets its own
  `gcloud compute ssl-certificates` resource attached to the same HTTPS
  proxy. There's a per-proxy cap on how many certs can be attached — if you
  onboard tenants at real scale, migrate to
  [Certificate Manager](https://cloud.google.com/certificate-manager/docs)
  (cert maps) instead of attaching certs one by one.
- **Prisma engine sanity check:** same caveat as the VM deployment — see
  [migrations.md](./migrations.md#prisma-engine-in-the-standalone-image).
- Related: [migrations.md](./migrations.md), [adding-a-tenant.md](./adding-a-tenant.md),
  [tenant-provisioning.md](./tenant-provisioning.md),
  [deployment-gcp-console.md](./deployment-gcp-console.md) (same setup,
  clicked through the Cloud Console instead of these scripts).
