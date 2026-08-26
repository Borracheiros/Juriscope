# Banco

PostgreSQL 16 (imagem `pgvector/pgvector:pg16`). Extensões `pgcrypto` e `vector`.

Roles: `juridico` (owner/migração), `juridico_app` (runtime RLS).

Tabelas Sprint 0: tenants, users, access_profiles, profile_capabilities, memberships, audit_events, idempotency_keys, outbox_events, schema_migrations.

Testes: Testcontainers, destroy no `afterAll`.
