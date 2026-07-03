# Provisioning a salon (tenant)

> Deploying with Docker? See [adding-a-tenant.md](./adding-a-tenant.md) for the
> full production flow (create DB → provision → nginx server block → DNS). This
> page is the reference for the `provision:tenant` script and its flags.

`npm run provision:tenant` pushes the tenant schema to the salon's database,
seeds the workspace/settings/admin, and registers the salon (encrypted DB url)
in the control-plane registry — all in one command.

```bash
npm run provision:tenant -- \
  --name "Reine Studio" --slug reine --domain rein.localhost:3000 \
  --db "postgresql://<user>:<password>@<host>/<db>?sslmode=require&channel_binding=require" \
  --admin-name "Admin" --admin-email admin@reine.com --admin-password "secret123" \
  --primary
```

## Flags

| Flag | Description |
|---|---|
| `--name` | Display name of the salon |
| `--slug` | Unique slug (used by `control:seed`/registry upserts) |
| `--domain` | Host this salon is served on (no scheme/protocol, no trailing slash — e.g. `rein.localhost:3000` or `alpha.example.com`) |
| `--db` | The salon's **empty** Postgres connection string |
| `--admin-name` / `--admin-email` / `--admin-password` | Bound tenant admin created in the salon's own database |
| `--accent` | Optional brand accent hex (default `#2d3b64`) |
| `--plan` | Optional plan name (default `starter`) |
| `--primary` | Marks this salon as the dev fallback tenant (unknown hosts resolve to it outside production) |

## Notes

- **Never commit a real connection string** (e.g. a live Neon/Postgres password) into a
  checked-in file — only `.env` (gitignored) or your hosting provider's secret manager
  should hold real credentials. Treat the example above as a template.
- `--domain` should be a bare host (`rein.localhost:3000`), not a full URL — don't include
  `http://` or a trailing `/`.
- The command is an **upsert by `--slug`** for the control-plane registry row, but
  `seedTenantDatabase` is **not** an upsert — re-running it against a database that
  already has a workspace will fail. Only run this against a fresh, empty database.
- Stop the dev server first on Windows before running `prisma:generate`/`db push` — it
  locks the Prisma query-engine DLL.
