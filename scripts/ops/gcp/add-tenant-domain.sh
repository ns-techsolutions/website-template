#!/usr/bin/env bash
# Add a tenant's custom domain to the load balancer's TLS coverage. Run after
# provisioning the tenant itself (DB + admin + control-plane registration —
# see docs/deployment-gcp.md, "Onboarding a tenant").
#
# The URL map has no per-host routing (the app resolves tenants from the Host
# header itself), so this script only needs to get a valid cert in front of
# the new domain — it attaches an additional Google-managed cert to the
# existing HTTPS proxy rather than touching routing at all.
#
# Usage: DOMAIN=alpha.example.com bash scripts/ops/gcp/add-tenant-domain.sh
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
load_env
require_env HTTPS_PROXY_NAME
require_arg "${DOMAIN:-}" DOMAIN
gcloud_project_ready

domain="$(printf '%s' "$DOMAIN" | sed -E 's#^[a-z]+://##; s#/+$##' | tr '[:upper:]' '[:lower:]')"
cert_name="sma-cert-$(printf '%s' "$domain" | tr '.' '-')"

if gcloud compute ssl-certificates describe "$cert_name" >/dev/null 2>&1; then
  die "Cert $cert_name already exists — domain '$domain' is already onboarded."
fi

log "Requesting managed cert for $domain …"
gcloud compute ssl-certificates create "$cert_name" --domains="$domain" --global

log "Attaching $cert_name to $HTTPS_PROXY_NAME …"
existing="$(gcloud compute target-https-proxies describe "$HTTPS_PROXY_NAME" \
  --format='value(sslCertificates[].basename())' | tr ';' ',' )"
gcloud compute target-https-proxies update "$HTTPS_PROXY_NAME" \
  --ssl-certificates="${existing},${cert_name}"

log "Done."
cat >&2 <<EOF

Point an A record for ${domain} at the LB static IP (see setup-lb.sh output,
or: gcloud compute addresses describe \$LB_STATIC_IP_NAME --global --format='value(address)').

The cert provisions automatically once DNS resolves — can take up to ~60
minutes. Check status with:
  gcloud compute ssl-certificates describe ${cert_name} --format='value(managed.status)'
EOF
