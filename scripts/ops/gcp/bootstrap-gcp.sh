#!/usr/bin/env bash
# One-time GCP project setup for the Cloud Run deployment. Idempotent — safe to
# re-run after editing .env.gcp. Does NOT touch the load balancer (see
# setup-lb.sh) or deploy the app (that's the GitHub Actions workflow's job);
# it only provisions the infra the workflow and the Cloud Run service depend
# on. See docs/deployment-gcp.md for the full walkthrough.
#
# Requires: gcloud CLI, authenticated (`gcloud auth login`) with permission to
# create resources in GCP_PROJECT_ID.
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
load_env
require_env GCP_PROJECT_ID GCP_REGION AR_REPO SERVICE_NAME RUNTIME_SA_NAME \
  CLOUDSQL_INSTANCE CLOUDSQL_TIER CLOUDSQL_DB_VERSION CLOUDSQL_ROOT_PASSWORD \
  CLOUDSQL_APP_USER CLOUDSQL_APP_PASSWORD CLOUDSQL_CONTROL_DB \
  GITHUB_REPO WIF_POOL WIF_PROVIDER DEPLOY_SA_NAME \
  TENANT_DB_ENC_KEY JWT_ACCESS_SECRET
gcloud_project_ready

PROJECT_NUMBER="$(gcloud projects describe "$GCP_PROJECT_ID" --format='value(projectNumber)')"
PLACEHOLDER_IMAGE="us-docker.pkg.dev/cloudrun/container/hello"

# 1. Enable required APIs ---------------------------------------------------------
log "Enabling required APIs (skips ones already on) …"
apis=(
  run.googleapis.com
  sqladmin.googleapis.com
  artifactregistry.googleapis.com
  secretmanager.googleapis.com
  compute.googleapis.com
  iam.googleapis.com
  iamcredentials.googleapis.com
  sts.googleapis.com
)
to_enable=()
for api in "${apis[@]}"; do api_enabled "$api" || to_enable+=("$api"); done
[ "${#to_enable[@]}" -eq 0 ] || gcloud services enable "${to_enable[@]}"

# 2. Artifact Registry -------------------------------------------------------------
if ! gcloud artifacts repositories describe "$AR_REPO" --location="$GCP_REGION" >/dev/null 2>&1; then
  log "Creating Artifact Registry repo $AR_REPO …"
  gcloud artifacts repositories create "$AR_REPO" \
    --repository-format=docker --location="$GCP_REGION" \
    --description=sma-container-images
else
  log "Artifact Registry repo $AR_REPO already exists."
fi

# 3. Cloud SQL (Postgres) ----------------------------------------------------------
if ! gcloud sql instances describe "$CLOUDSQL_INSTANCE" >/dev/null 2>&1; then
  log "Creating Cloud SQL instance $CLOUDSQL_INSTANCE (this takes several minutes) …"
  gcloud sql instances create "$CLOUDSQL_INSTANCE" \
    --database-version="$CLOUDSQL_DB_VERSION" \
    --edition=ENTERPRISE \
    --tier="$CLOUDSQL_TIER" \
    --region="$GCP_REGION" \
    --root-password="$CLOUDSQL_ROOT_PASSWORD" \
    --backup
  # --edition=ENTERPRISE: shared-core tiers like db-g1-small aren't valid under
  # the newer ENTERPRISE_PLUS edition (the project default) — only custom
  # machine types are. ENTERPRISE keeps the cheap tier usable.
  # A public IP is assigned (Cloud SQL requires at least one of public/private/PSC
  # connectivity), but with no authorized networks added it isn't reachable
  # directly — Cloud Run and the Cloud SQL Auth Proxy both connect via the
  # authenticated Cloud SQL Admin API tunnel, not the open internet.
else
  log "Cloud SQL instance $CLOUDSQL_INSTANCE already exists."
fi
INSTANCE_CONNECTION_NAME="$(gcloud sql instances describe "$CLOUDSQL_INSTANCE" --format='value(connectionName)')"

if ! gcloud sql databases describe "$CLOUDSQL_CONTROL_DB" --instance="$CLOUDSQL_INSTANCE" >/dev/null 2>&1; then
  log "Creating control-plane database $CLOUDSQL_CONTROL_DB …"
  gcloud sql databases create "$CLOUDSQL_CONTROL_DB" --instance="$CLOUDSQL_INSTANCE"
fi

if ! gcloud sql users list --instance="$CLOUDSQL_INSTANCE" --format='value(name)' | grep -qx "$CLOUDSQL_APP_USER"; then
  log "Creating Cloud SQL user $CLOUDSQL_APP_USER …"
  gcloud sql users create "$CLOUDSQL_APP_USER" --instance="$CLOUDSQL_INSTANCE" --password="$CLOUDSQL_APP_PASSWORD"
else
  log "Cloud SQL user $CLOUDSQL_APP_USER already exists (leaving its password as-is)."
fi

# 4. Secret Manager -----------------------------------------------------------------
log "Writing app secrets to Secret Manager …"
control_url="postgresql://${CLOUDSQL_APP_USER}:${CLOUDSQL_APP_PASSWORD}@/${CLOUDSQL_CONTROL_DB}?host=/cloudsql/${INSTANCE_CONNECTION_NAME}&schema=public"
put_secret "sma-control-database-url" "$control_url"
put_secret "sma-tenant-db-enc-key" "$TENANT_DB_ENC_KEY"
put_secret "sma-jwt-access-secret" "$JWT_ACCESS_SECRET"
put_secret "sma-cloudsql-app-password" "$CLOUDSQL_APP_PASSWORD"

# 5. Service accounts ----------------------------------------------------------------
runtime_sa_email="${RUNTIME_SA_NAME}@${GCP_PROJECT_ID}.iam.gserviceaccount.com"
deploy_sa_email="${DEPLOY_SA_NAME}@${GCP_PROJECT_ID}.iam.gserviceaccount.com"

if ! gcloud iam service-accounts describe "$runtime_sa_email" >/dev/null 2>&1; then
  log "Creating runtime service account $runtime_sa_email …"
  gcloud iam service-accounts create "$RUNTIME_SA_NAME" --display-name=sma-cloud-run-runtime
  wait_for_sa "$runtime_sa_email"
fi
gcloud projects add-iam-policy-binding "$GCP_PROJECT_ID" \
  --member="serviceAccount:${runtime_sa_email}" --role="roles/cloudsql.client" --condition=None >/dev/null
gcloud projects add-iam-policy-binding "$GCP_PROJECT_ID" \
  --member="serviceAccount:${runtime_sa_email}" --role="roles/secretmanager.secretAccessor" --condition=None >/dev/null

if ! gcloud iam service-accounts describe "$deploy_sa_email" >/dev/null 2>&1; then
  log "Creating deploy service account $deploy_sa_email …"
  gcloud iam service-accounts create "$DEPLOY_SA_NAME" --display-name=sma-github-actions-deployer
  wait_for_sa "$deploy_sa_email"
fi
for role in roles/run.admin roles/artifactregistry.writer; do
  gcloud projects add-iam-policy-binding "$GCP_PROJECT_ID" \
    --member="serviceAccount:${deploy_sa_email}" --role="$role" --condition=None >/dev/null
done
# Let the deploy SA act as the runtime SA when deploying (Cloud Run requires this).
gcloud iam service-accounts add-iam-policy-binding "$runtime_sa_email" \
  --member="serviceAccount:${deploy_sa_email}" --role="roles/iam.serviceAccountUser" >/dev/null

# 6. Workload Identity Federation (keyless GitHub Actions auth) ---------------------
if ! gcloud iam workload-identity-pools describe "$WIF_POOL" --location=global >/dev/null 2>&1; then
  log "Creating Workload Identity Pool $WIF_POOL …"
  gcloud iam workload-identity-pools create "$WIF_POOL" \
    --location=global --display-name=github-actions-pool
fi
if ! gcloud iam workload-identity-pools providers describe "$WIF_PROVIDER" \
    --location=global --workload-identity-pool="$WIF_POOL" >/dev/null 2>&1; then
  log "Creating Workload Identity Provider $WIF_PROVIDER scoped to $GITHUB_REPO …"
  gcloud iam workload-identity-pools providers create-oidc "$WIF_PROVIDER" \
    --location=global --workload-identity-pool="$WIF_POOL" \
    --issuer-uri="https://token.actions.githubusercontent.com" \
    --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository" \
    --attribute-condition="assertion.repository=='${GITHUB_REPO}'"
fi
gcloud iam service-accounts add-iam-policy-binding "$deploy_sa_email" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${WIF_POOL}/attribute.repository/${GITHUB_REPO}" \
  >/dev/null

# 7. Initial Cloud Run service (placeholder image; the workflow updates it) ---------
if ! gcloud run services describe "$SERVICE_NAME" --region="$GCP_REGION" >/dev/null 2>&1; then
  log "Creating initial Cloud Run service $SERVICE_NAME (placeholder image) …"
  # Use --env-vars-file (YAML) instead of --set-env-vars: on Windows, gcloud's
  # .cmd wrapper mangles any single flag=value argument that contains a space
  # (e.g. PLATFORM_BRAND_NAME="NS Solutions") when invoked through a non-cmd.exe
  # shell — a file sidesteps that argument-parsing path entirely.
  env_vars_file="$(mktemp)"
  cat >"$env_vars_file" <<EOF
NODE_ENV: "production"
PLATFORM_HOST: "${PLATFORM_HOST:-}"
PLATFORM_BRAND_NAME: "${PLATFORM_BRAND_NAME:-}"
NEXT_PUBLIC_SITE_URL: "${NEXT_PUBLIC_SITE_URL:-}"
JWT_ACCESS_TTL: "${JWT_ACCESS_TTL:-7d}"
EOF
  gcloud run deploy "$SERVICE_NAME" \
    --image="$PLACEHOLDER_IMAGE" \
    --region="$GCP_REGION" \
    --service-account="$runtime_sa_email" \
    --add-cloudsql-instances="$INSTANCE_CONNECTION_NAME" \
    --ingress=internal-and-cloud-load-balancing \
    --no-allow-unauthenticated \
    --set-secrets="CONTROL_DATABASE_URL=sma-control-database-url:latest,TENANT_DB_ENC_KEY=sma-tenant-db-enc-key:latest,JWT_ACCESS_SECRET=sma-jwt-access-secret:latest" \
    --env-vars-file="$env_vars_file"
  rm -f "$env_vars_file"
else
  log "Cloud Run service $SERVICE_NAME already exists."
fi

# 8. Cloud Run Jobs for the fixed migration tasks (mirrors the Makefile's
#    control-push / control-seed / migrate-tenants targets, run via the
#    "tools" image). Tenant onboarding (variable args) is NOT a job — see
#    docs/deployment-gcp.md for that flow.
job_common=(
  --region="$GCP_REGION"
  --service-account="$runtime_sa_email"
  --set-cloudsql-instances="$INSTANCE_CONNECTION_NAME"
  --set-secrets="CONTROL_DATABASE_URL=sma-control-database-url:latest,TENANT_DB_ENC_KEY=sma-tenant-db-enc-key:latest,JWT_ACCESS_SECRET=sma-jwt-access-secret:latest"
  --max-retries=0
)
declare -A jobs=(
  [sma-tools-control-push]="control:push"
  [sma-tools-control-seed]="control:seed"
  [sma-tools-migrate-tenants]="migrate:all-tenants"
  [sma-tools-backfill-system-pages]="backfill:system-pages"
)
for job in "${!jobs[@]}"; do
  if ! gcloud run jobs describe "$job" --region="$GCP_REGION" >/dev/null 2>&1; then
    log "Creating Cloud Run Job $job …"
    gcloud run jobs create "$job" \
      --image="$PLACEHOLDER_IMAGE" \
      --command=npm --args="run,${jobs[$job]}" \
      "${job_common[@]}"
  else
    log "Cloud Run Job $job already exists."
  fi
done

log "Done."
cat >&2 <<EOF

Next steps:
  1. Add these as GitHub repo variables/secrets (Settings → Secrets and variables → Actions):
       vars.GCP_PROJECT_ID    = ${GCP_PROJECT_ID}
       vars.GCP_REGION        = ${GCP_REGION}
       vars.AR_REPO           = ${AR_REPO}
       vars.SERVICE_NAME      = ${SERVICE_NAME}
       secrets.WIF_PROVIDER   = projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${WIF_POOL}/providers/${WIF_PROVIDER}
       secrets.DEPLOY_SA      = ${deploy_sa_email}
  2. Run scripts/ops/gcp/setup-lb.sh to put a Load Balancer in front of the service.
  3. Push to main — deploy-cloudrun.yml builds the image and updates the service + jobs.
  4. Run the "Migrate (Cloud Run)" GitHub Action (or 'gcloud run jobs execute sma-tools-control-push --region=${GCP_REGION} --wait')
     once a real image has been deployed, to initialize the control plane.

Cloud SQL connection name: ${INSTANCE_CONNECTION_NAME}
EOF
