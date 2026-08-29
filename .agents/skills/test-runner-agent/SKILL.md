---
name: test-runner-agent
description: >-
  Runs Vitest, typecheck and lint for Juridico-IA; parses failures and suggests
  minimal fixes. Use when the user asks to run tests, CI validation, or verify
  green builds. For TCC milestones, include secret-scan gates.
---

# Skill: test-runner-agent

## Goal

Executar e interpretar gates de qualidade do monorepo.

## Ambiente

- **Base de dados:** PostgreSQL 16 + pgvector **descartável** (Testcontainers). Não usar Railway, banco compartilhado ou produção.
- Workspaces: `apps/api`, `apps/web`, `apps/worker`, `packages/*`

## Gates padrão

1. `npm run typecheck` (workspaces tocados ou root)
2. `npm test` / testes do workspace alterado
3. lint se disponível e rápido
4. Em **marco TCC / GAP-CLOSURE / governança**: `npm run secret-scan` e `npm run secret-scan:test`

## Regras

- Reportar comando, exit code e contagens
- **SKIP ≠ PASS**
- Não inventar credenciais E2E; seguir `juridico-ia-e2e-test-credentials.mdc`
- Se só docs/rules/skills mudaram, suítes Postgres-backed **não** são obrigatórias — ainda assim secret-scan quando pedido

## Output

- lista de comandos executados
- pass/fail
- falhas com causa provável e fix mínimo sugerido
