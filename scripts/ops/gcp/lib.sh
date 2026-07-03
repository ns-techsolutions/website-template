#!/usr/bin/env bash
# Shared helpers for the GCP ops scripts (scripts/ops/gcp/*.sh). Source, don't
# execute:
#   source "$(dirname "$0")/lib.sh"
set -euo pipefail

# Repo root = three levels up from scripts/ops/gcp/.
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
cd "$REPO_ROOT"

# --- logging -------------------------------------------------------------------
_c() { [ -t 2 ] && printf '%s' "$1" || true; }   # color only on a TTY
log()  { printf '%s==>%s %s\n' "$(_c $'\033[1;34m')" "$(_c $'\033[0m')" "$*" >&2; }
warn() { printf '%s!! %s%s\n'  "$(_c $'\033[1;33m')" "$*" "$(_c $'\033[0m')" >&2; }
die()  { printf '%sxx %s%s\n'  "$(_c $'\033[1;31m')" "$*" "$(_c $'\033[0m')" >&2; exit 1; }

# --- env -----------------------------------------------------------------------
load_env() {
  [ -f .env.gcp ] || die ".env.gcp not found. Run 'cp .env.gcp.example .env.gcp' and fill it in."
  set -a
  # shellcheck disable=SC1091
  . ./.env.gcp
  set +a
}

require_env() {
  local v
  for v in "$@"; do
    [ -n "${!v:-}" ] || die "Required env var '$v' is empty (check .env.gcp)."
  done
}

require_arg() {
  # require_arg VALUE NAME
  [ -n "${1:-}" ] || die "Missing required argument: $2"
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "'$1' is required on PATH but was not found."
}

# --- gcloud ----------------------------------------------------------------------
require_cmd gcloud

gcloud_project_ready() {
  require_env GCP_PROJECT_ID GCP_REGION
  gcloud config set project "$GCP_PROJECT_ID" >/dev/null
  gcloud config set run/region "$GCP_REGION" >/dev/null
}

# True if the given API is already enabled on the project.
api_enabled() {
  gcloud services list --enabled --format="value(config.name)" 2>/dev/null | grep -qx "$1"
}

# True if a Secret Manager secret with this name already exists.
secret_exists() {
  gcloud secrets describe "$1" >/dev/null 2>&1
}

# Newly created service accounts can take a few seconds to become visible to
# other APIs (e.g. add-iam-policy-binding) — poll until IAM catches up.
wait_for_sa() {
  local email="$1" i=0
  until gcloud iam service-accounts describe "$email" >/dev/null 2>&1; do
    i=$((i + 1))
    [ "$i" -le 30 ] || die "Service account $email never became visible to IAM."
    sleep 2
  done
}

# Create the secret if missing, then add the given value as a new version.
# Usage: put_secret NAME VALUE
put_secret() {
  local name="$1" value="$2"
  if ! secret_exists "$name"; then
    gcloud secrets create "$name" --replication-policy=automatic >/dev/null
    log "Created secret $name."
  fi
  printf '%s' "$value" | gcloud secrets versions add "$name" --data-file=- >/dev/null
  log "Set secret $name."
}
