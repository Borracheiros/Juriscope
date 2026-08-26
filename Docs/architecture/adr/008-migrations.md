# ADR 008 — Migrations

SQL versionado, ordem determinística, tabela `schema_migrations`, fingerprint SHA-256. Sem `synchronize=true`. Rollback só com pedido explícito. Testes: fresh bootstrap + pending=0.
