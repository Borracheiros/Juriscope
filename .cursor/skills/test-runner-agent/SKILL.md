---
name: test-runner-agent
description: >-
  Runs Jest, E2E, and typecheck for Juridico-IA; parses failures and suggests minimal
  fixes. Use when the user asks to run tests, E2E, CI validation, or verify green builds.
---

# Skill: test-runner-agent (execução de testes)

**Objetivo:** atuar como agente focado em **correr** testes no Juridico-IA, interpretar falhas e sugerir correções mínimas — sem substituir o desenho de cobertura (isso continua com a skill **qa-test-engineer**).

## Quando usar

- O usuário pede para **executar testes**, **E2E**, **Jest**, **validar CI** ou **confirmar que passa**.
- Após alterações em `backend/` ou `frontend/` que exijam verificação rápida.

## Princípios (Juridico-IA)

- **Base de dados:** o Postgres no Railway é **compartilhado** (dev + produção). E2E e seeds criam dados reais; não apagar BD nem correr testes destrutivos sem intenção explícita do usuário.
- **Caminho:** comandos a partir da raiz do repo ou `backend/` / `frontend/` conforme o script.
- **Língua:** resumos ao usuário em **pt-BR**; mensagens de código já seguem convenções do projeto.

## Backend (NestJS)

| Objetivo | Comando (cwd: `backend/`) |
|----------|---------------------------|
| Typecheck | `npm run typecheck` |
| Unitários + RLS | `npm test` |
| **E2E HTTP** (Postgres; define `RUN_E2E_HTTP=1` via runner) | `npm run test:e2e` ou `npm run test:e2e:http` — equivalentes; aceita argumentos extra do Jest |
| E2E só caixa | `npm run test:e2e:cash` |
| E2E só compensação | `npm run test:e2e:compensation` |
| Integração estabilização | `npm run test:integration` (requer flag/env indicada no script) |

**Variáveis:** `DATABASE_URL` (ou `DATABASE_PUBLIC_URL` / `MIGRATIONS_DATABASE_URL`) deve estar em `backend/.env` ou `backend/.env.local`. O runner `scripts/run-e2e-http.cjs` valida presença de URL antes de correr o Jest; o `jest-load-dotenv.cjs` recarrega env no worker.

## Frontend (Next.js)

| Objetivo | Comando (cwd: `frontend/`) |
|----------|----------------------------|
| Lint (se existir no package) | `npm run lint` |
| Build / typecheck | ver `package.json` do frontend (`npm run build` ou script de tipos) |

## Fluxo de trabalho do agente

1. Identificar **o que** mudou (backend, frontend, migração, E2E).
2. Escolher o **menor conjunto** de comandos que valida a mudança.
3. **Executar** os comandos no terminal (pedir permissões de rede se o E2E ligar ao Postgres remoto).
4. Se falhar: colar **trecho relevante** do erro, localizar arquivo/linha, propor **correção focada** (sem refatorações laterais).
5. Entregar **resumo**: comandos corridos, pass/fail, próximo passo se ainda houver falhas.

## Anti-padrões

- Não declarar “tudo verde” sem ter corrido pelo menos typecheck + testes relevantes à mudança.
- Não assumir Docker para migrações ou E2E (o projeto usa `npm run migration:*` com `DATABASE_URL`).
- Não pedir ao usuário para correr manualmente o que pode ser executado no ambiente do agente (salvo bloqueio de sandbox — aí explicar o bloqueio).

## Relação com outras skills

- **qa-test-engineer:** define o quê testar e matriz de cobertura.
- **test-runner-agent (este):** executa e diagnostica falhas de execução.
