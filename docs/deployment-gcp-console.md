# Deploying via the Cloud Console (manual alternative)

[deployment-gcp.md](./deployment-gcp.md) automates the GCP setup with
`bootstrap-gcp.sh`/`setup-lb.sh`. This doc is the same end state, but clicked
through the **Cloud Console** by hand instead — useful if you're on Windows
without a convenient bash shell, or just want to see/control every resource
as it's created. It keeps the repo's existing GitHub Actions deploy workflow
(`deploy-cloudrun.yml` + Workload Identity Federation) as the build/deploy
mechanism — only the one-time infra provisioning is manual.

Read the architecture diagram in [deployment-gcp.md](./deployment-gcp.md#how-it-fits-together)
first; it isn't repeated here.

## Prerequisites

- An existing GCP project with billing enabled.
- Push access to the GitHub repo (Settings → Secrets and variables → Actions).
- Your repo's default branch name — **check this matches what
  `deploy-cloudrun.yml`'s `push.branches` lists**, or the workflow will never
  auto-trigger (see the gotcha in step 11).

Naming used throughout (replace with your own if you like, just stay
consistent): region `us-central1`, Cloud SQL instance `sma-postgres`,
control DB `sma_control`, app DB user `sma_app`, Cloud Run service `sma-app`,
Artifact Registry repo `sma`, runtime SA `sma-cloud-run-runtime`, deploy SA
`sma-github-actions-deployer`.

## 1. Enable required APIs

**APIs & Services → Library** — enable each (search by name, click **Enable**):
Cloud Run Admin, Cloud SQL Admin, Artifact Registry, Secret Manager, Compute
Engine, IAM, IAM Service Account Credentials, Security Token Service, Cloud
Storage.

## 2. Artifact Registry

**Artifact Registry → Repositories → Create Repository** — Docker format,
region matching where Cloud Run will run.

## 3. Cloud SQL

**SQL → Create Instance → PostgreSQL** — edition **Enterprise** (not
Enterprise Plus — that edition doesn't allow shared-core tiers), tier
`db-f1-micro` (test) or a custom tier (prod), region, enable automated
backups, set the root password.

Then: **Databases** tab → create the control database; **Users** tab →
create the app user with its own password. Note the instance's **connection
name** from the Overview page (`<project>:<region>:<instance>`) — needed
below.

## 4. Secret Manager

**Security → Secret Manager → Create Secret**, one per value:

| Secret name | Value |
|---|---|
| `sma-control-database-url` | `postgresql://<app-user>:<app-password>@localhost/<control-db>?host=/cloudsql/<connection-name>&schema=public` |
| `sma-tenant-db-enc-key` | a random 32-byte key (`[Convert]::ToBase64String((1..32 \| % { Get-Random -Maximum 256 }))` in PowerShell) |
| `sma-jwt-access-secret` | a random secret (same approach, 48 bytes) |
| `sma-cloudsql-app-password` | the app user's plain password |

> **Gotcha — empty host:** `bootstrap-gcp.sh` builds this URL with *nothing*
> between `@` and `/` (`...@/<control-db>?host=...`). Current Prisma
> (6.x) rejects that with `P1013: empty host in database URL` — it needs a
> placeholder host even though the real socket path comes from the `host`
> query param. Always include `@localhost/`, as above, not `@/`.

> **Gotcha — password characters:** if Prisma instead fails with `P1000:
> Authentication failed`, despite the username/password looking right,
> suspect special characters in the password breaking connection-string
> parsing (`@ : / ? # &` etc. need percent-encoding, and it's easy to get
> wrong). Easiest fix: reset the Cloud SQL user's password to a plain
> alphanumeric string and use that in the secret instead of fighting
> encoding.

## 5. Service accounts + IAM

**IAM & Admin → Service Accounts → Create Service Account** (×2):

- **Runtime SA** (`sma-cloud-run-runtime`) — what Cloud Run actually runs
  as. Grant roles: **Cloud SQL Client**, **Secret Manager Secret Accessor**.
- **Deploy SA** (`sma-github-actions-deployer`) — what GitHub Actions
  impersonates. Grant roles: **Cloud Run Admin**, **Artifact Registry
  Writer**.

Then, on the **runtime SA**'s own **Permissions** tab → **Grant Access** →
add the deploy SA's email as a principal with role **Service Account User**
(Cloud Run deploys require the deployer to be able to "act as" the runtime
SA).

## 6. Workload Identity Federation

**IAM & Admin → Workload Identity Federation → Create Pool** (e.g.
`github-actions-pool`) → **Add provider** (OIDC):

- Issuer URL: `https://token.actions.githubusercontent.com`
- Attribute mapping: `google.subject` = `assertion.sub`,
  `attribute.repository` = `assertion.repository`
- Attribute condition: `assertion.repository=='<org>/<repo>'`

> **Gotcha:** the pool page's "Connect Service Accounts" button sometimes
> shows an empty service-account picker (a Console UI bug, not a permissions
> issue). Skip it — go to **IAM & Admin → Service Accounts → \<deploy SA\> →
> Permissions → Grant Access** and add this principal directly:
> ```
> principalSet://iam.googleapis.com/projects/<PROJECT_NUMBER>/locations/global/workloadIdentityPools/github-actions-pool/attribute.repository/<org>/<repo>
> ```
> with role **Workload Identity User**. (Find `PROJECT_NUMBER` on **IAM &
> Admin → Settings**.) Same end state, no picker needed.

Note the provider's full resource name for later:
```
projects/<PROJECT_NUMBER>/locations/global/workloadIdentityPools/github-actions-pool/providers/github-provider
```

## 7. Cloud Run service

**Cloud Run → Create Service** — deploy one revision from an existing image,
use the placeholder `us-docker.pkg.dev/cloudrun/container/hello` for now
(`deploy-cloudrun.yml` replaces it on first real push).

- **Authentication**: require authentication (don't allow unauthenticated
  invocations directly).
- **Security tab**: service account = runtime SA.
- **Networking tab**: ingress = **Internal and Cloud Load Balancing**.
- **Container → Variables & Secrets**: plain vars `NODE_ENV=production`,
  `PLATFORM_HOST`, `PLATFORM_BRAND_NAME`, `NEXT_PUBLIC_SITE_URL`,
  `JWT_ACCESS_TTL`, `STORAGE_PROVIDER`, `GCS_MEDIA_BUCKET` (see step 13);
  secrets `CONTROL_DATABASE_URL` ←
  `sma-control-database-url:latest`, `TENANT_DB_ENC_KEY` ←
  `sma-tenant-db-enc-key:latest`, `JWT_ACCESS_SECRET` ←
  `sma-jwt-access-secret:latest`.
- **Container → Connections**: add the Cloud SQL instance.

> **Gotcha — secret version pins on revisions:** each Cloud Run revision
> freezes the secret *version* it resolved at deploy time, even if the
> picker displayed "latest" when you created it. If you later add a new
> secret version (e.g. fixing the empty-host or password issues above) and
> then redeploy via **Edit & Deploy New Revision** for an unrelated reason
> (like changing `PLATFORM_HOST`), the new revision can silently inherit the
> *old* pinned version instead of re-resolving "latest" — causing an old bug
> to reappear with no obvious cause. Symptom: a Prisma connection error you
> already fixed comes back after an unrelated redeploy. Fix: every time you
> edit & deploy a new revision, open **Variables & Secrets** and explicitly
> confirm each secret's version dropdown says **latest**, not a pinned
> number.

> **Gotcha — public access:** ingress restricted to internal+LB blocks the
> raw `*.run.app` URL from the open internet, which is correct. But this app
> serves **public** salon websites, not just an internal admin tool, so the
> service still needs the `allUsers` → **Cloud Run Invoker** binding — this
> is safe alongside the restricted ingress, since the ingress setting still
> blocks direct `*.run.app` access; the invoker grant only matters for
> traffic that already arrived via the LB. Without it, every request (any
> path, both domains) gets rejected with a Google-Frontend-level 403 —
> distinguishable from an app error by the `server: Google Frontend`
> response header and generic "Error: Forbidden" HTML body, since the
> request never reaches your app at all.
>
> **Don't just grant it once in the Console — it won't stick.**
> `deploy-cloudrun.yml` originally ran `gcloud run deploy ... --no-allow-unauthenticated`,
> and that flag actively *removes* the `allUsers` invoker binding if one
> exists, on every single deploy. Since GitHub Actions redeploys on every
> push to `master`, a manual Console grant gets silently wiped the next time
> anyone pushes — the 403 comes back with no obvious trigger. The real fix
> (already applied in this repo) is `--allow-unauthenticated` in the
> workflow itself, not a one-off Console click: find it under **Cloud Run →
> Services → check the box next to the service row** (the Permissions panel
> isn't on the service detail page in the current console — it slides in
> from the right after selecting the row), if you ever need to set it by
> hand for a one-off test.

## 8. Cloud Run Jobs

**Cloud Run → Jobs → Deploy container**, four times:

| Job name | Command | Arguments |
|---|---|---|
| `sma-tools-control-push` | `npm` | `run`, `control:push` |
| `sma-tools-control-seed` | `npm` | `run`, `control:seed` |
| `sma-tools-migrate-tenants` | `npm` | `run`, `migrate:all-tenants` |
| `sma-tools-backfill-system-pages` | `npm` | `run`, `backfill:system-pages` |

Each needs the same Cloud SQL connection, the runtime SA, and 0 retries, as
the service above. The first three need all 3 secrets
(`CONTROL_DATABASE_URL`, `TENANT_DB_ENC_KEY`, `JWT_ACCESS_SECRET`);
`backfill-system-pages` only touches tenant data, not auth, so it only needs
`CONTROL_DATABASE_URL` and `TENANT_DB_ENC_KEY`.

> **`migrate-tenants` and `--accept-data-loss`:** `prisma db push` refuses, in a
> Job, to apply any index/constraint change without `--accept-data-loss` — even a
> safe one like adding a unique index — and the Job's container args are fixed.
> The script honors an env var instead, so do a one-off execution override after
> confirming the diff is safe (see [migrations.md](./migrations.md)):
>
> ```bash
> gcloud run jobs execute sma-tools-migrate-tenants \
>   --region="$GCP_REGION" --update-env-vars=ACCEPT_DATA_LOSS=1 --wait
> ```
>
> Leave the env var **off** in the persisted Job definition so destructive
> changes can't slip through silently on a routine run.

Both `migrate-cloudrun.yml` (as a `workflow_dispatch` task option) and
`deploy-cloudrun.yml` (image refresh on every deploy) already reference
`sma-tools-backfill-system-pages` — only the Cloud Run Job resource itself
needs creating by hand here.

> **Gotcha:** the **Job name** field doesn't always clear itself when you
> pick a different placeholder image — it can silently default to something
> derived from the image (e.g. `hello`). Double check the name field before
> clicking Create, and verify the Jobs list shows the name you intended
> afterward.

Use the real `sma-tools` image (Artifact Registry → `sma` → `sma-tools` →
`latest`) instead of the placeholder for any job created *after* the first
successful deploy — it's already there.

## 9. GitHub Actions secrets & variables

Repo **Settings → Secrets and variables → Actions**:

**Variables**: `GCP_PROJECT_ID`, `GCP_REGION`, `AR_REPO`, `SERVICE_NAME`,
`RUNTIME_SA_NAME` (just the account name, not the full email —
`deploy-cloudrun.yml` appends `@<project>.iam.gserviceaccount.com` itself),
`CLOUDSQL_INSTANCE`, `PLATFORM_HOST`, `PLATFORM_BRAND_NAME`,
`NEXT_PUBLIC_SITE_URL`, `JWT_ACCESS_TTL`, `STORAGE_PROVIDER`,
`GCS_MEDIA_BUCKET` (see step 13).

**Secrets**: `WIF_PROVIDER` (the provider resource name from step 6),
`DEPLOY_SA` (the deploy SA's full email).

These names are read directly from `deploy-cloudrun.yml` and
`migrate-cloudrun.yml` — cross-check there if a workflow run fails with a
missing-variable error.

> **Gotcha — `--env-vars-file` replaces the whole env var list:** the deploy
> step builds `/tmp/env-vars.yaml` from a fixed set of repo variables and
> passes it via `gcloud run deploy --env-vars-file=...`. That flag doesn't
> merge — it **replaces every plain env var on the service** with exactly
> what's in the file. If you add a new env var by hand in the Console
> (**Edit & Deploy New Revision → Variables & Secrets**) without also adding
> it to this workflow's heredoc and as a repo variable, the next push to
> `master` silently deletes it again. Any new plain env var the app needs
> (like `STORAGE_PROVIDER`/`GCS_MEDIA_BUCKET` in step 13) must be added in
> *both* places — the workflow file and the repo Variables tab — not just
> clicked into the Console.

## 10. Load balancer

If you don't have a real domain yet, build the HTTP frontend only — the
HTTPS frontend needs a domain to validate a Google-managed cert against; add
it later.

**Network Services → Load Balancing → Create Load Balancer** → Application
Load Balancer (HTTP/HTTPS) → Public facing (external) → Global workload:

- **Backend**: create a backend service (e.g. `sma-backend`) with a
  Serverless NEG backend (e.g. `sma-neg`) pointing at the Cloud Run service.
  No health check needed for serverless NEGs.
- **Routing rules**: leave the default simple host/path rule — the app
  itself resolves tenants from the `Host` header, the LB doesn't need
  per-host rules.
- **Frontend**: name it `sma-fwd-80`, protocol HTTP, port 80, new static IP
  (e.g. `sma-lb-ip`).

### Connecting real domains (platform + tenants)

Once you have real domains (one for the platform console, one per tenant),
do this:

1. **DNS first** — add an `A` record for each domain pointing at the
   reserved static IP (find it under **VPC network → IP addresses**, or on
   the LB's frontend details). Do this early; both DNS propagation and
   Google's managed-cert validation take time (cert validation can take up
   to ~60 minutes *after* DNS resolves).
2. **Edit the load balancer** (`sma-lb`) → **Frontend configuration** → add
   a new frontend:
   - Name: `sma-fwd-443`
   - Protocol: **HTTPS** (the certificate picker only appears after
     switching from HTTP)
   - IP address: select the **same existing static IP** (`sma-lb-ip`) from
     the dropdown — don't leave it on "Ephemeral (Automatic)", which would
     reserve a *different* IP than the one your DNS records point at.
   - Port: 443.
   - Certificate: **Create new certificate** for the platform domain.
   - Under **Additional certificates**, click **Add certificate** and
     create one per tenant domain. A single HTTPS frontend can carry
     multiple certs (1–14) via SNI — **you do not need a separate
     frontend/port per domain.**
3. **Routing rules**: leave the default rule pointing at the existing
   backend service — the app resolves tenants from the `Host` header, the
   LB still needs no per-host rules.
4. Check status under **Network Services → Load Balancing → Certificates**:
   each cert shows **Provisioning** until DNS validates, then **Active**.
5. Update `PLATFORM_HOST`/`NEXT_PUBLIC_SITE_URL` (both the GitHub Actions
   variable *and* the current Cloud Run revision's env vars — see the
   secret-version-pin gotcha above, same risk applies to plain env vars on
   "Edit & Deploy New Revision") to the real platform domain.
6. Test with `curl.exe -i https://<domain>/` once the cert is Active — no
   `Host:` override needed anymore since you're hitting the real domain
   directly. A `404` at `/` alone isn't necessarily wrong (see the next
   gotcha); test a known real route like `/admin/login`.

> **Gotcha — misleading 404 at `/`:** hitting the bare `/` path may render a
> generic 404 wrapped in whatever default layout chrome the app falls back
> to (in this repo, hardcoded lorem-ipsum salon branding) — that does *not*
> mean host-routing is broken. `/` may simply not be a real page for that
> host. Confirm host-routing by testing an actual route that only exists for
> that host (e.g. `/admin/login` for the platform host).

## 11. First deploy + initialize the database

> **Gotcha — branch mismatch:** `deploy-cloudrun.yml` as shipped triggers on
> `push.branches: [main]`. If your repo's default branch is `master` (common
> for older repos), the workflow never auto-fires on a normal push — only
> its manual `workflow_dispatch` trigger works. Either edit the workflow's
> branch list to match your actual default branch, or rename the branch.

Push to your default branch (or run **Actions → Deploy to Cloud Run → Run
workflow** manually). It builds the `runner`/`tools` images, pushes them to
Artifact Registry, deploys the real image to the Cloud Run service, and
updates the three Jobs' images.

Then initialize the control plane: **Cloud Run → Jobs → `sma-tools-control-
push` → Execute**, wait for Succeeded, then same for `sma-tools-control-
seed`.

### Testing without a domain yet

The app routes by the `Host` header, so hitting the LB's IP directly needs a
header override:

```powershell
curl.exe -i -H "Host: <platform-host-or-tenant-domain>" http://<LB_IP>/
```

> **Gotcha:** PowerShell aliases `curl` to `Invoke-WebRequest`, which takes a
> `-Headers @{...}` hashtable, not `-H "Key: Value"`. Use `curl.exe`
> explicitly to get real curl syntax.

A response with `server: Google Frontend` and a generic 403 HTML body means
the load-balancer-to-Cloud-Run invoker permission (step 7's gotcha) is
missing or hasn't propagated yet — not an application error.

## 12. Provisioning a tenant (onboarding a salon)

Unlike the rest of this doc, this step has **no Console-only path** — it
needs a direct database connection from your machine via the **Cloud SQL
Auth Proxy**, same limitation as [deployment-gcp.md](./deployment-gcp.md#4-onboarding-a-tenant)
notes for the scripted flow.

### Set up local tooling (one-time)

1. Install the **gcloud CLI** if you don't have it. Right after installing,
   a fresh terminal/session may not see it on `PATH` yet — if so, call it by
   full path: `& "$env:LOCALAPPDATA\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd"`.
2. `gcloud auth login` — opens a browser, sign in.
3. `gcloud auth application-default login` — sets up Application Default
   Credentials the proxy will use.
   > **Gotcha:** on a Google Workspace-managed account, this can fail with
   > `ERROR: ... cloud-platform scope is required but not consented` even
   > though you completed the browser flow — seen as a Workspace org-policy
   > quirk, not a real permission problem. **Just retry the exact same
   > command** — it succeeded on a second attempt with no changes. Don't
   > switch to `--no-browser` mode to "fix" it — that flow is for headless
   > machines, has its own separate prompt-for-pasted-code dance, and won't
   > resolve the same underlying consent issue anyway.
   >
   > If it keeps failing, fall back to a service-account key instead: create
   > a narrowly-scoped SA (e.g. `sma-local-admin`) with only **Cloud SQL
   > Client**, download a JSON key from its **Keys** tab, and pass
   > `--credentials-file=<path>` to `cloud-sql-proxy` instead of relying on
   > ADC. Delete the key when done.
4. Download the **Cloud SQL Auth Proxy** binary (Windows x64):
   ```powershell
   Invoke-WebRequest -Uri "https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.14.2/cloud-sql-proxy.x64.exe" -OutFile "$env:USERPROFILE\gcp-tools\cloud-sql-proxy.exe"
   ```
5. Start it, pointed at your instance's connection name:
   ```powershell
   & "$env:USERPROFILE\gcp-tools\cloud-sql-proxy.exe" "<connection-name>" --port 15433
   ```
   > **Gotcha:** port `5433` (the port used in deployment-gcp.md's bash
   > examples) can fail to bind on Windows with "access forbidden by its
   > access permissions" — this is a Windows-reserved/excluded port range
   > issue (often from Hyper-V/WSL), not a proxy bug. Just pick a different
   > port (`15433` worked).

### Create the salon's database

No `psql`/`createdb` needed locally — reuse the repo's own Prisma CLI
against the control schema's datasource, which can run arbitrary SQL:

```powershell
$env:CONTROL_DATABASE_URL = "postgresql://<app-user>:<app-password>@localhost:15433/sma_control?schema=public"
"CREATE DATABASE <salon-db-name>;" | npx prisma db execute --schema prisma/control/schema.prisma --stdin
```

Note this is the **local proxy address** (`localhost:15433`), not the
Unix-socket form — locally you're going through the proxy's plain TCP
listener, the socket path is only meaningful inside Cloud Run/Cloud Run Jobs.

### Provision (schema push + seed + control-plane registration)

> **Gotcha — local URL vs. production URL are NOT the same value:**
> `scripts/provision-tenant.ts`'s `--db` argument is used for *two*
> different purposes that need *two* different connection strings: (1)
> actually connecting from your machine to push the schema and seed data
> (needs the local proxy address, `localhost:<port>`), and (2) the value
> that gets encrypted and stored in the control-plane registry as what the
> **deployed Cloud Run service** will use to connect (needs the Unix-socket
> form, `@localhost/db?host=/cloudsql/<connection-name>`, same shape as
> `CONTROL_DATABASE_URL`). The stock script uses one `--db` value for both,
> which silently stores an address Cloud Run can never reach. Don't run it
> as-is against Cloud SQL — write a one-off variant that pushes/seeds via
> the local URL but registers the production URL, e.g.:
> ```ts
> // scripts/_tmp-provision-<slug>.ts — delete after running once
> const LOCAL_DB_URL = `postgresql://<user>:<pass>@localhost:15433/<db>?schema=public`;
> const PROD_DB_URL = `postgresql://<user>:<pass>@localhost/<db>?host=/cloudsql/<connection-name>&schema=public`;
> // db push + seedTenantDatabase(...) using LOCAL_DB_URL,
> // controlDb.tenant.upsert({ ..., databaseUrl: encryptSecret(PROD_DB_URL) })
> ```
> Base it on `scripts/provision-tenant.ts`'s three steps (push, seed,
> register) — see that file for the exact imports
> (`lib/db/tenant-client`, `lib/db/tenant-provision`, `lib/db/control`,
> `lib/crypto/secret`, `lib/auth/password`).

Run it with `CONTROL_DATABASE_URL` (local proxy form, for the control-plane
write), `TENANT_DB_ENC_KEY` (must be the **exact same value** as the
`sma-tenant-db-enc-key` secret — a mismatch means the deployed app can't
decrypt this tenant's connection string later), and your chosen app/admin
passwords all set as env vars first, then:

```powershell
npx tsx scripts/_tmp-provision-<slug>.ts
```

Finally, attach the tenant domain's managed cert per step 10 above, and
delete the temporary script — it's a one-off, not meant to be committed.

## 13. Cloud Storage for media uploads

`lib/storage/index.ts` picks a media storage backend at runtime via the
`STORAGE_PROVIDER` env var (`"gcs"` default, `"supabase"` opt-in) — see
[lib/storage/types.ts](../lib/storage/types.ts) for the shared
`StorageProvider` interface both backends implement. Switching backends
later means changing one env var, not touching `media.service.ts` or the
`/api/cms/media` route.

**Cloud Storage → Buckets → Create**:

- Name: pick something globally unique (this becomes `GCS_MEDIA_BUCKET`).
- Region: same as the Cloud Run service.
- Access control: **uniform** bucket-level access.

**Permissions tab → Grant Access** (×2):

- Principal `allUsers`, role **Storage Object Viewer** — public read,
  matching the previous Supabase public-bucket behavior. Confirm the
  public-access warning.
- Principal = the **runtime SA**'s email
  (`<RUNTIME_SA_NAME>@<GCP_PROJECT_ID>.iam.gserviceaccount.com`), role
  **Storage Object Admin** — so the deployed app can write/delete objects.
  On Cloud Run, the GCS client authenticates automatically via this service
  account (ADC) — no key file, no extra secret.

**GitHub repo Settings → Secrets and variables → Actions → Variables**: add
`STORAGE_PROVIDER=gcs` and `GCS_MEDIA_BUCKET=<bucket-name>` **before** your
next push — see the `--env-vars-file` gotcha in step 9. Both must also
already be present in `deploy-cloudrun.yml`'s env-vars heredoc (they are, as
of this doc).

Push to `master` to deploy; no manual Cloud Run env var edit is needed or
will survive — the workflow sets them on every deploy from the repo
variables above.

Local dev keeps working unchanged: leave `STORAGE_PROVIDER` unset/`supabase`
in `.env`/`.env.local` to keep uploading to Supabase without setting up GCS
credentials locally, or run `gcloud auth application-default login` once
(see step 12's local-tooling gotchas) to let `@google-cloud/storage`
authenticate from your machine too.
