# syntax=docker/dockerfile:1

# Multi-tenant salon platform — production image.
#
# Debian "bookworm" slim (glibc) is used on purpose: the tenant Prisma generator
# (prisma/tenant/schema.prisma) declares no custom `binaryTargets`, so its engine
# is built for the default `native` target. Building and running on the same
# glibc base keeps `native` valid and avoids the Alpine/musl engine mismatch.
#
# Stages:
#   deps    – install all dependencies (incl. dev) once
#   build   – `next build` → .next/standalone (self-contained server)
#   tools   – full deps + source + Prisma CLI/tsx for migrations & provisioning
#   runner  – slim runtime that ships only the standalone output

FROM node:20-bookworm-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# ---- deps ---------------------------------------------------------------------
FROM base AS deps
# prisma/ is needed because the `postinstall` hook runs `prisma generate` for
# both the control and tenant schemas.
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

# ---- build --------------------------------------------------------------------
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Regenerate both clients against the full source tree (control client lands in
# lib/db/generated/control), then build the standalone server.
RUN npm run prisma:generate && npm run build

# ---- tools (migrations / provisioning) ----------------------------------------
# Keeps the full dependency tree + source so `tsx` and the Prisma CLI can run the
# control:push / control:seed / provision:tenant / migrate:all-tenants scripts.
# Never started by `docker compose up` — invoke via `docker compose run --rm tools`.
FROM build AS tools
ENV NODE_ENV=production
CMD ["bash"]

# ---- runner (production runtime) ----------------------------------------------
FROM base AS runner
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# The standalone build does not bundle these — copy them in so server.js serves
# static assets and files under public/.
COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static

# Run as the unprivileged `node` user that ships with the base image.
USER node
EXPOSE 3000
CMD ["node", "server.js"]
