# SMA — Multi-Tenant Salon Management Platform

A multi-tenant SaaS for salon booking and management. Each salon tenant gets its
own isolated database; a shared control plane handles tenant provisioning,
routing, and platform administration.

Built and delivered following the workflow documented in [`docs/`](docs/)
(branching & PR strategy, development standards, deployment, release notes).

## Tech stack

- **Framework:** Next.js 16 (App Router) · React 19 · TypeScript
- **Data:** Prisma 6 — split `control` and per-tenant schemas · Supabase (storage)
- **State/data fetching:** TanStack React Query · Zustand
- **Forms/validation:** React Hook Form · Zod
- **Auth:** JWT (`jose`) · `bcryptjs` · email OTP
- **Payments:** Stripe (pluggable provider registry)
- **Email:** Resend
- **UI:** Tailwind CSS v4 · shadcn/ui · Radix
- **Infra:** Docker + Docker Compose + nginx · GCP Cloud Run (CI via GitHub Actions)

## Project structure

```
app/            Routes: (public) storefront, admin/(panel), api/*
components/     admin/, cms/ (block renderers), common/, ui/ (shadcn)
features/       Feature-sliced modules (auth, bookings, catalog, cms-*, payments, …)
lib/            api, auth, cms, db (control + tenant), mail, payments, storage, …
prisma/         control/ and tenant/ schemas + seeds
scripts/        Tenant provisioning/migration + ops/ (shell, incl. gcp/)
docker/         nginx reverse-proxy config + per-tenant templates
docs/           Product, architecture, ADRs, development, deployment, release notes
```

## Getting started

```bash
npm install
cp .env.example .env            # fill in values
npx prisma generate --schema prisma/control/schema.prisma
npm run dev
```

## Deployment

- **Docker:** see [`docs/deployment.md`](docs/deployment.md) and `docker-compose.yml`.
- **GCP Cloud Run:** see [`docs/deployment-gcp.md`](docs/deployment-gcp.md); copy
  `.env.gcp.example` → `.env.gcp` for the bootstrap scripts.
- **Adding a tenant:** see [`docs/adding-a-tenant.md`](docs/adding-a-tenant.md)
  and [`docs/tenant-provisioning.md`](docs/tenant-provisioning.md).

## Workflow

`main` (production) ← `dev` (integration) ← `feature/*` / `bugfix/*`.
One issue → one branch → one PR into `dev`. Releases are cut from `main` with
SemVer tags. See [`docs/development/branching_and_pr_strategy.md`](docs/development/branching_and_pr_strategy.md).
