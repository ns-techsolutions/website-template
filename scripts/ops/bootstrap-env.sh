#!/usr/bin/env bash
# Create .env from .env.docker.example with freshly generated secrets.
# Refuses to overwrite an existing .env. Run via `make env`.
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

TEMPLATE=".env.docker.example"
TARGET=".env"

[ -f "$TEMPLATE" ] || die "$TEMPLATE not found."
[ -f "$TARGET" ] && die ".env already exists — refusing to overwrite. Edit it by hand."
command -v openssl >/dev/null || die "openssl is required to generate secrets."

enc_key="$(openssl rand -base64 32)"
jwt_secret="$(openssl rand -base64 48)"

# Replace only the two secret placeholders; leave everything else for the operator.
# Use a non-/ delimiter since base64 can contain '/'.
sed \
  -e "s|^TENANT_DB_ENC_KEY=.*|TENANT_DB_ENC_KEY=\"${enc_key}\"|" \
  -e "s|^JWT_ACCESS_SECRET=.*|JWT_ACCESS_SECRET=\"${jwt_secret}\"|" \
  "$TEMPLATE" > "$TARGET"

log "Created .env with generated TENANT_DB_ENC_KEY and JWT_ACCESS_SECRET."
warn "Now edit .env and set: POSTGRES_PASSWORD, PLATFORM_HOST, NEXT_PUBLIC_SITE_URL,"
warn "and align CONTROL_DATABASE_URL / DATABASE_URL with your POSTGRES_* values."
