# ADR 001 — Monólito modular

## Contexto
Produto jurídico SaaS com muitos bounded contexts e equipe pequena (TCC).

## Decisão
Monólito modular: `apps/api`, `apps/web`, `apps/worker` + `packages/*`. Módulos em `apps/api/src/modules`. Sem microserviços.

## Consequências
Deploy único da API; fronteiras por pasta e contratos; extração futura só com ADR.
