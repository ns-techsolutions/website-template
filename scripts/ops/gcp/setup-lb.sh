#!/usr/bin/env bash
# One-time: put a global external HTTPS Load Balancer in front of the Cloud Run
# service via a Serverless NEG. Idempotent — safe to re-run.
#
# Why a load balancer instead of Cloud Run domain mappings: domain mappings are
# region-limited and awkward at scale. The LB has no per-tenant host routing —
# the app already picks the tenant from the Host header (see proxy.ts) — so the
# LB's only per-domain job is presenting a valid TLS cert. New tenant domains
# are added with add-tenant-domain.sh, not by editing this script.
#
# Run scripts/ops/gcp/bootstrap-gcp.sh first (the Cloud Run service must exist).
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
load_env
require_env GCP_PROJECT_ID GCP_REGION SERVICE_NAME PLATFORM_HOST \
  LB_STATIC_IP_NAME NEG_NAME BACKEND_SERVICE_NAME URL_MAP_NAME \
  HTTPS_PROXY_NAME HTTP_PROXY_NAME HTTPS_FORWARDING_RULE HTTP_FORWARDING_RULE
gcloud_project_ready

platform_cert="sma-cert-$(printf '%s' "$PLATFORM_HOST" | tr '.' '-')"

# 1. Static IP --------------------------------------------------------------------
if ! gcloud compute addresses describe "$LB_STATIC_IP_NAME" --global >/dev/null 2>&1; then
  log "Reserving global static IP $LB_STATIC_IP_NAME …"
  gcloud compute addresses create "$LB_STATIC_IP_NAME" --global --ip-version=IPV4
fi
LB_IP="$(gcloud compute addresses describe "$LB_STATIC_IP_NAME" --global --format='value(address)')"

# 2. Serverless NEG pointing at the Cloud Run service ------------------------------
if ! gcloud compute network-endpoint-groups describe "$NEG_NAME" --region="$GCP_REGION" >/dev/null 2>&1; then
  log "Creating Serverless NEG $NEG_NAME …"
  gcloud compute network-endpoint-groups create "$NEG_NAME" \
    --region="$GCP_REGION" --network-endpoint-type=serverless \
    --cloud-run-service="$SERVICE_NAME"
fi

# 3. Backend service ----------------------------------------------------------------
if ! gcloud compute backend-services describe "$BACKEND_SERVICE_NAME" --global >/dev/null 2>&1; then
  log "Creating backend service $BACKEND_SERVICE_NAME …"
  gcloud compute backend-services create "$BACKEND_SERVICE_NAME" \
    --global --load-balancing-scheme=EXTERNAL_MANAGED
  gcloud compute backend-services add-backend "$BACKEND_SERVICE_NAME" \
    --global --network-endpoint-group="$NEG_NAME" --network-endpoint-group-region="$GCP_REGION"
fi

# 4. URL map: single default service, no host rules --------------------------------
if ! gcloud compute url-maps describe "$URL_MAP_NAME" >/dev/null 2>&1; then
  log "Creating URL map $URL_MAP_NAME …"
  gcloud compute url-maps create "$URL_MAP_NAME" --default-service="$BACKEND_SERVICE_NAME"
fi

# 5. Managed cert for the platform host + HTTPS proxy + forwarding rule ------------
if ! gcloud compute ssl-certificates describe "$platform_cert" >/dev/null 2>&1; then
  log "Requesting managed cert for $PLATFORM_HOST …"
  gcloud compute ssl-certificates create "$platform_cert" \
    --domains="$PLATFORM_HOST" --global
fi
if ! gcloud compute target-https-proxies describe "$HTTPS_PROXY_NAME" >/dev/null 2>&1; then
  log "Creating HTTPS proxy $HTTPS_PROXY_NAME …"
  gcloud compute target-https-proxies create "$HTTPS_PROXY_NAME" \
    --url-map="$URL_MAP_NAME" --ssl-certificates="$platform_cert"
fi
if ! gcloud compute forwarding-rules describe "$HTTPS_FORWARDING_RULE" --global >/dev/null 2>&1; then
  log "Creating global forwarding rule $HTTPS_FORWARDING_RULE (443) …"
  gcloud compute forwarding-rules create "$HTTPS_FORWARDING_RULE" \
    --global --load-balancing-scheme=EXTERNAL_MANAGED \
    --address="$LB_STATIC_IP_NAME" --target-https-proxy="$HTTPS_PROXY_NAME" --ports=443
fi

# 6. HTTP → HTTPS redirect ----------------------------------------------------------
redirect_map="${URL_MAP_NAME}-redirect"
if ! gcloud compute url-maps describe "$redirect_map" >/dev/null 2>&1; then
  log "Creating HTTP→HTTPS redirect map $redirect_map …"
  gcloud compute url-maps import "$redirect_map" --global <<EOF
defaultUrlRedirect:
  httpsRedirect: true
  redirectResponseCode: MOVED_PERMANENTLY_DEFAULT
EOF
fi
if ! gcloud compute target-http-proxies describe "$HTTP_PROXY_NAME" >/dev/null 2>&1; then
  gcloud compute target-http-proxies create "$HTTP_PROXY_NAME" --url-map="$redirect_map"
fi
if ! gcloud compute forwarding-rules describe "$HTTP_FORWARDING_RULE" --global >/dev/null 2>&1; then
  log "Creating global forwarding rule $HTTP_FORWARDING_RULE (80) …"
  gcloud compute forwarding-rules create "$HTTP_FORWARDING_RULE" \
    --global --load-balancing-scheme=EXTERNAL_MANAGED \
    --address="$LB_STATIC_IP_NAME" --target-http-proxy="$HTTP_PROXY_NAME" --ports=80
fi

log "Done."
cat >&2 <<EOF

Load balancer IP: ${LB_IP}

Point an A record for ${PLATFORM_HOST} at ${LB_IP}. The managed cert
(${platform_cert}) provisions automatically once DNS resolves — can take up
to ~60 minutes. Check status with:
  gcloud compute ssl-certificates describe ${platform_cert} --format='value(managed.status)'

For each tenant domain, run scripts/ops/gcp/add-tenant-domain.sh — it attaches
an additional managed cert to ${HTTPS_PROXY_NAME}; the URL map itself never
needs a per-tenant rule.
EOF
