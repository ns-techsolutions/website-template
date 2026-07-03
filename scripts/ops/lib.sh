#!/usr/bin/env bash
# Shared helpers for the ops scripts (scripts/ops/*.sh). Source, don't execute:
#   source "$(dirname "$0")/lib.sh"
set -euo pipefail

# Repo root = two levels up from scripts/ops/. All compose commands run from here.
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT"

# --- logging -------------------------------------------------------------------
_c() { [ -t 2 ] && printf '%s' "$1" || true; }   # color only on a TTY
log()  { printf '%s==>%s %s\n' "$(_c $'\033[1;34m')" "$(_c $'\033[0m')" "$*" >&2; }
warn() { printf '%s!! %s%s\n'  "$(_c $'\033[1;33m')" "$*" "$(_c $'\033[0m')" >&2; }
die()  { printf '%sxx %s%s\n'  "$(_c $'\033[1;31m')" "$*" "$(_c $'\033[0m')" >&2; exit 1; }

# --- env -----------------------------------------------------------------------
# Load .env into the environment (used for POSTGRES_USER/PASSWORD, etc.).
load_env() {
  [ -f .env ] || die ".env not found. Run 'make env' first."
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
}

require_env() {
  local v
  for v in "$@"; do
    [ -n "${!v:-}" ] || die "Required env var '$v' is empty (check .env)."
  done
}

require_arg() {
  # require_arg VALUE NAME
  [ -n "${1:-}" ] || die "Missing required argument: $2"
}

# --- docker compose wrappers ---------------------------------------------------
dc() { docker compose "$@"; }

# Run a psql one-liner against the control database, inside the postgres container.
# Usage: psql_control "SELECT 1;"  → prints unaligned, tuples-only output.
psql_control() {
  dc exec -T postgres psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" \
    -d "${POSTGRES_DB:-sma_control}" -tAc "$1"
}

# True if a database with the given name exists on the postgres instance.
db_exists() {
  local name="$1" out
  out="$(dc exec -T postgres psql -tAc \
    "SELECT 1 FROM pg_database WHERE datname='${name}'" \
    -U "$POSTGRES_USER" -d "${POSTGRES_DB:-sma_control}" 2>/dev/null || true)"
  [ "$out" = "1" ]
}

# Validate config then reload nginx (no downtime). Fails loudly if the test fails.
nginx_reload() {
  dc exec -T nginx nginx -t || die "nginx config test failed — not reloading."
  dc exec -T nginx nginx -s reload
  log "nginx reloaded."
}
