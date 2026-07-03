#!/usr/bin/env bash
# Take a salon offline. Inputs as env vars (set by the Makefile):
#
#   SLUG     (required)
#   PURGE=1  (optional) also DROP the salon database and delete its registry row
#
# Default (no PURGE) = reversible disable: removes nginx routing and sets the
# registry status to 'disabled' (getTenantDb only resolves 'active' salons; the
# 30s host cache self-heals). PURGE is destructive and irreversible.
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
load_env
require_env POSTGRES_USER
require_arg "${SLUG:-}" SLUG

slug="$(printf '%s' "$SLUG" | tr '[:upper:]' '[:lower:]')"
dbname="salon_${slug//-/_}"
conf="docker/nginx/conf.d/tenant-${slug}.conf"

# Escape single quotes for the SQL literal.
slug_sql="${slug//\'/\'\'}"

# 1. Remove nginx routing (if present) and reload.
if [ -f "$conf" ]; then
  log "Removing $conf …"
  rm -f "$conf"
  nginx_reload
else
  warn "No nginx file at $conf (already removed?)."
fi

if [ "${PURGE:-}" = "1" ]; then
  warn "PURGE: this will permanently DROP database '$dbname' and delete the registry row."
  warn "Make sure you have a backup ('make backup'). Continuing in 5s — Ctrl-C to abort."
  sleep 5
  log "Deleting registry row for slug '$slug' …"
  psql_control "DELETE FROM \"Tenant\" WHERE slug='${slug_sql}';" >/dev/null
  log "Dropping database $dbname …"
  dc exec -T postgres dropdb --force --if-exists -U "$POSTGRES_USER" "$dbname"
  log "Purged salon '$slug'."
else
  log "Disabling registry row for slug '$slug' …"
  updated="$(psql_control "UPDATE \"Tenant\" SET status='disabled' WHERE slug='${slug_sql}'; SELECT 1;")"
  [ "$updated" = "1" ] || warn "No registry row matched slug '$slug'."
  log "Salon '$slug' disabled. Re-enable: set status back to 'active' (e.g. via the \
master console) and re-run 'make new-tenant' nginx generation, or restore the conf file."
fi
