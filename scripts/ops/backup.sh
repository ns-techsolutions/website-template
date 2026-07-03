#!/usr/bin/env bash
# Dump every database on the postgres instance (control DB + all salon DBs) to a
# timestamped file under ./backups/. Run via `make backup`.
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
load_env
require_env POSTGRES_USER

mkdir -p backups
out="backups/$(date +%Y%m%d-%H%M%S).sql"

log "Dumping all databases → $out …"
dc exec -T postgres pg_dumpall -U "$POSTGRES_USER" > "$out"

# pg_dumpall on an empty cluster still writes role/config lines, so a near-empty
# file is suspicious but not necessarily wrong; just report the size.
log "Wrote $out ($(wc -c < "$out") bytes)."
log "Restore (DESTRUCTIVE) example:  cat $out | docker compose exec -T postgres psql -U \$POSTGRES_USER"
