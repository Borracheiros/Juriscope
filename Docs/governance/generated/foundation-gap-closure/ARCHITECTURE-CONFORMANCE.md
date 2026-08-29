# Architecture conformance — Foundation gap-closure

Generated: 2026-08-26T21:30:00-03:00
Baseline/HEAD: `6dc0a25c18b684ff673ee63d0eeb3721974d4952` (commit not created this round)

## Decisions

1. **Fail-closed runtime config.** API boots only with `DATABASE_APP_URL`. Same DSN or owner user (`juridico`) is rejected. Migrator keeps `DATABASE_URL`. Worker requires `WORKER_DATABASE_URL` and rejects owner user. Production requires `COOKIE_SECURE=true` and HTTPS `WEB_ORIGIN`.
2. **Capabilities from the database.** JWT carries `sub` + `tenantId` only. Each request reloads membership, profile, capabilities, user status and tenant status. Suspended user/tenant → unauthenticated.
3. **No implicit superadmin.** `tenant_admin` is a tenant-scoped profile with explicit capabilities, not a platform break-glass role.
4. **Audit immutability at the role.** `juridico_app` has SELECT+INSERT on `audit_events` only. UPDATE/DELETE revoked (42501).
5. **Idempotency.** Atomic insert of `(tenant_id, operation, key)` with status `IN_PROGRESS`/`COMPLETED`. Hash is SHA-256 of method + route + canonical payload JSON — not the key. Concurrent waiters use `FOR UPDATE` after `ON CONFLICT DO NOTHING`.
6. **Outbox.** Inserted in the same transaction as the domain mutation. Worker claims via `FOR UPDATE SKIP LOCKED` inside `app_private.claim_outbox`. Max 8 attempts then `FAILED_PERMANENT`. **DLQ/broker deferred** — terminal safe state is `FAILED_PERMANENT`; no external publisher.
7. **Migrations.** SHA-256 checksum persisted in `schema_migrations`. Mismatch throws `MigrationChecksumError` and rolls back. Roles `juridico_app` / `juridico_worker` created idempotently (`NOSUPERUSER NOBYPASSRLS`). Composite FKs prevent cross-tenant membership/profile association.
8. **Tenant spoofing.** `x-tenant-id`, `query.tenantId`, `body.tenantId` rejected with 403 `TENANT_CLAIM_REJECTED`.
9. **Enumeration.** Foreign UUID → 404 `Recurso indisponível` (same as missing).
10. **Office/team.** Not persisted. No claim of team-level authorization.
11. **Thin controller.** Login/cookies stay at HTTP edge; heartbeat, audit insert, authz resolve, idempotency and outbox live in dedicated modules.
12. **`packages/domain`** remains free of Nest, Next, `pg` and HTTP.

## Invariants

- Runtime role is never owner.
- FORCE RLS on tenant-scoped tables; `set_config('app.tenant_id', …, true)` is transaction-local.
- `/health` does not query the database; `/ready` does and returns 503 `NOT_READY` if it fails.
- Errors do not include DSN, password or stack in the HTTP body.
- Future legal modules remain skeletons (`ModuleSkeletonsModule` + UI “em breve”).

## Circular imports

No cycle found among the extracted platform modules. Worker production code does not import API internals; worker **tests** call `runMigrations` from the API migrator to apply schema on scratch Postgres.

## Conformance residual

Independent audit must re-prove A01–A30. This document is Cursor evidence, not certification.
