#!/usr/bin/env bash
# Onboard a salon end-to-end: create its DB, provision (schema + admin + registry),
# generate its nginx block, and reload nginx. Inputs come as env vars (set by the
# Makefile `new-tenant` target):
#
#   NAME SLUG DOMAIN ADMIN_NAME ADMIN_EMAIL ADMIN_PASSWORD   (required)
#   ACCENT PLAN PRIMARY                                      (optional)
#
# PRIMARY=1 marks the dev/fallback salon. See docs/adding-a-tenant.md.
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
load_env
require_env POSTGRES_USER POSTGRES_PASSWORD

require_arg "${NAME:-}"           NAME
require_arg "${SLUG:-}"           SLUG
require_arg "${DOMAIN:-}"         DOMAIN
require_arg "${ADMIN_NAME:-}"     ADMIN_NAME
require_arg "${ADMIN_EMAIL:-}"    ADMIN_EMAIL
require_arg "${ADMIN_PASSWORD:-}" ADMIN_PASSWORD

# Normalize inputs.
slug="$(printf '%s' "$SLUG" | tr '[:upper:]' '[:lower:]')"
[[ "$slug" =~ ^[a-z0-9-]+$ ]] || die "SLUG must be lowercase letters, digits and hyphens."
# Bare host: strip scheme and any trailing slash, lowercase.
domain="$(printf '%s' "$DOMAIN" | sed -E 's#^[a-z]+://##; s#/+$##' | tr '[:upper:]' '[:lower:]')"
dbname="salon_${slug//-/_}"          # hyphens aren't db-name friendly
db_url="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${dbname}?schema=public"
conf="docker/nginx/conf.d/tenant-${slug}.conf"
template="docker/nginx/tenant.conf.template"

# 1. Guard the non-idempotent seed: the DB must not already exist.
if db_exists "$dbname"; then
  die "Database '$dbname' already exists. Provisioning seed is not idempotent — \
use a fresh slug, or 'make remove-tenant SLUG=$slug PURGE=1' to start over."
fi

# 2. Create the empty salon database.
log "Creating database $dbname …"
dc exec -T postgres createdb -U "$POSTGRES_USER" "$dbname"

# 3. Provision (schema push + workspace/admin seed + control-plane registration).
log "Provisioning salon '$NAME' ($domain) …"
args=( npm run provision:tenant -- \
  --name "$NAME" --slug "$slug" --domain "$domain" --db "$db_url" \
  --admin-name "$ADMIN_NAME" --admin-email "$ADMIN_EMAIL" --admin-password "$ADMIN_PASSWORD" )
[ -n "${ACCENT:-}" ] && args+=( --accent "$ACCENT" )
[ -n "${PLAN:-}" ]   && args+=( --plan "$PLAN" )
case "${PRIMARY:-}" in 1|true|yes) args+=( --primary ) ;; esac

if ! dc run --rm tools "${args[@]}"; then
  die "Provisioning failed. The empty DB '$dbname' was left in place; drop it with \
'make remove-tenant SLUG=$slug PURGE=1' before retrying."
fi

# 4. Render the nginx server block for this domain.
log "Writing $conf …"
sed "s/__DOMAIN__/${domain}/g" "$template" > "$conf"

# 5. Validate + reload (roll back the new file if the config is invalid).
if ! dc exec -T nginx nginx -t; then
  rm -f "$conf"
  die "nginx config test failed; removed $conf. The salon is provisioned — fix the \
template and re-run, or add the block manually."
fi
dc exec -T nginx nginx -s reload
log "nginx reloaded."

log "Done. '$NAME' is live on $domain once DNS points at this server."
log "Verify:  curl -sI -H \"Host: $domain\" http://localhost/ | head -n1"
