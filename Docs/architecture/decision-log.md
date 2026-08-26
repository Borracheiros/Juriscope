# Decision log

| ID | Decisão | Status |
|----|---------|--------|
| D-001 | Greenfield: NestJS + Next.js + PostgreSQL + npm workspaces | Aceita |
| D-002 | Testes de banco em Testcontainers, nunca instância compartilhada | Aceita |
| D-003 | TypeORM não usa `synchronize`; migrations SQL versionadas | Aceita |
| D-004 | Runtime da API usa role `juridico_app` (FORCE RLS) | Aceita |
| D-005 | Login via função `SECURITY DEFINER` | Aceita |
| D-006 | Sem Redis, MinIO, provedor de IA nesta rodada | Aceita |
| D-007 | Worker de outbox usa conexão owner (exceção documentada) | Aceita |
