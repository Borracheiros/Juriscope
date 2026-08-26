# Arquitetura-alvo (Sprint 0)

Monólito modular:

- `apps/web` — Next.js, BFF mínimo, shell cognitivo
- `apps/api` — NestJS, prefixo `/v1`
- `apps/worker` — outbox
- `packages/domain|contracts|security|observability|config|testing|design-system`

PostgreSQL SoT + RLS. Sem microserviços. Sem Redis. Sem object storage. Sem provedor de IA.

Fluxo: controller → use case (identity) → SQL parametrizado. Tenant da sessão. Fail-closed.
