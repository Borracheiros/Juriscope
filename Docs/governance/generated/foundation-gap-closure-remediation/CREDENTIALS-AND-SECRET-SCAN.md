# Credentials & secret scan

## Roles

- Schema migration creates `juridico_app` / `juridico_worker` **without** SQL PASSWORD literals.
- LOGIN passwords provisioned only via:
  - scratch: ephemeral random (never logged)
  - Compose: `OWNER_PASSWORD` / `APP_PASSWORD` / `WORKER_PASSWORD` → `init-roles.sh` (`psql -v`, no echo)
  - `provisionRuntimeRoles` for ops use

## .env.example

- Password-less URL shapes (`postgresql://role@host/db`).
- Scanned by secret-scan (not skipped).

## Scanner

| Pattern id | Purpose (described, not exemplified as live matches) |
|------------|------------------------------------------------------|
| `sql-password` | SQL PASSWORD clause whose value is a single-quoted literal |
| `pg-url-credentials` | PostgreSQL DSN that embeds both username and password before the host |
| `generic-secret` | quoted secret assignments |
| allowlist | only `SECRET_SCAN_ALLOW_SYNTHETIC_BEGIN` … `END` |

Positive + negative tests: `npm run secret-scan:test` (exit 0).
