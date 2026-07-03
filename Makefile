# Operations entrypoint for the Docker deployment. Run `make` to list targets.
# Thin wrappers around docker compose + scripts/ops/*.sh. See docs/deployment.md.

SHELL := /bin/bash
.DEFAULT_GOAL := help

# Tenant args are read from the environment by scripts/ops/*.sh — export them so
# command-line assignments (make new-tenant NAME=... SLUG=...) reach the scripts.
export NAME SLUG DOMAIN ADMIN_NAME ADMIN_EMAIL ADMIN_PASSWORD ACCENT PLAN PRIMARY
export PURGE

# `make logs s=app` (default: all services)
s ?=

.PHONY: help env build setup up down deploy restart ps logs tools \
        control-push control-seed migrate-tenants \
        new-tenant remove-tenant nginx-reload backup

help: ## List available targets
	@echo "Usage: make <target> [VAR=value ...]"
	@echo
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| sort \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'
	@echo
	@echo "Example:"
	@echo "  make new-tenant NAME=\"Salon Alpha\" SLUG=alpha DOMAIN=alpha.example.com \\"
	@echo "    ADMIN_NAME=Alice ADMIN_EMAIL=alice@alpha.example.com ADMIN_PASSWORD=secret123"

# --- lifecycle -----------------------------------------------------------------
env: ## Create .env from the template with generated secrets
	@bash scripts/ops/bootstrap-env.sh

build: ## Build the Docker images
	docker compose build

setup: build ## First-time setup: start Postgres, init + seed the control plane
	docker compose up -d postgres
	docker compose run --rm tools npm run control:push
	docker compose run --rm tools npm run control:seed
	@echo "Control plane ready. Next: provision a salon, then 'make up'."

up: ## Start the app + nginx
	docker compose up -d app nginx

down: ## Stop all services (keeps the database volume)
	docker compose down

deploy: build ## Rebuild and recreate app + nginx (after code/schema changes)
	docker compose up -d app nginx

restart: ## Restart app + nginx without rebuilding
	docker compose restart app nginx

ps: ## Show service status
	docker compose ps

logs: ## Follow logs (make logs s=app)
	docker compose logs -f $(s)

tools: ## Open a shell in the one-off tools container
	docker compose run --rm tools bash

# --- database / schema ---------------------------------------------------------
control-push: ## Push the control-plane schema
	docker compose run --rm tools npm run control:push

control-seed: ## Seed the control plane (master admin + gateways)
	docker compose run --rm tools npm run control:seed

migrate-tenants: ## Roll the tenant schema out to every salon DB
	docker compose run --rm tools npm run migrate:all-tenants
	@echo "Schema pushed. Run 'make deploy' to ship matching app code."

backup: ## Dump all databases to ./backups/<timestamp>.sql
	@bash scripts/ops/backup.sh

# --- salons --------------------------------------------------------------------
new-tenant: ## Onboard a salon (DB + provision + nginx). See example below.
	@bash scripts/ops/new-tenant.sh

remove-tenant: ## Disable a salon (SLUG=...); add PURGE=1 to drop its DB + row
	@bash scripts/ops/remove-tenant.sh

nginx-reload: ## Validate and reload the nginx config
	docker compose exec nginx nginx -t
	docker compose exec nginx nginx -s reload
