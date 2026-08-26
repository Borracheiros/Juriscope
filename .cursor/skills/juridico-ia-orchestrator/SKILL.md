---
name: juridico-ia-orchestrator
description: >-
  Routes every Juridico-IA user request to the correct Agent Skills (architect,
  backend, frontend, QA, security, audit, scrum, test runner, delivery workflow,
  governed patterns) before deep work. Use at the start of any chat turn in this
  repository when the user sends a command, question, or implementation prompt.
---

# Juridico-IA — agente orquestrador

## Objetivo

Ser o **primeiro passo** em cada turno: classificar o pedido, escolher **uma ou mais** skills especialistas, definir **estratégia de execução** e **ordem**. Depois, atuar **no papel** dessas skills (conteúdo de cada `SKILL.md`), respeitando sempre `.cursor/rules/` e `AGENTS.md`.

## Saída obrigatória (curta, no início da resposta)

Antes de código ou plano longo, escrever um bloco fixo:

```text
[Orquestrador] Intenção: …
Skills: <nome>[, <nome> …]  |  Ordem: …  |  Estratégia: sequential|parallel|balanced|adaptive
[Patterns] …                    ← se governed-pattern-memory aplicável (1 linha)
Domínio: …                      ← opcional: frontdesk-agent | clinical-agent | iam-agent
```

## Loop Ruflo adaptado (cada tarefa não trivial)

```text
SEARCH patterns → ROUTE skills → EXECUTE → VALIDATE → (fase?) VERDICT → STORE pattern
```

| Passo | Skill | Obrigatório quando |
|-------|-------|-------------------|
| SEARCH | `governed-pattern-memory` | polish, fase nomeada, feature multi-arquivo |
| ROUTE | `juridico-ia-orchestrator` | sempre |
| EXECUTE | especialistas | conforme mapa |
| VALIDATE | `test-runner-agent`, `qa-test-engineer` | código alterado |
| VERDICT | `delivery-workflow` | prompt com fase / critérios / relatório |
| STORE | `governed-pattern-memory` | após veredito APPROVED |

## Estratégias de execução

| Estratégia | Usar quando |
|------------|-------------|
| **sequential** | migração → API → UI; security antes de código |
| **parallel** | vitest + grep i18n; docs + artifact após implement |
| **balanced** | **padrão** — plano sequencial, validações paralelas |
| **adaptive** | bloqueio CI/E2E — replanejar sem expandir escopo |

Declarar sempre no bloco [Orquestrador].

## Roteamento (mapa rápido)

| Sinais no pedido | Skill principal | Skills secundárias típicas |
|------------------|-----------------|----------------------------|
| arquitetura, módulos, fronteira, desenho de sistema, trade-offs | `system-architect` | `governed-pattern-memory`, `security-reviewer` |
| Nest, API, DTO, migração TypeORM, serviço backend, BD | `backend-engineer` | `security-reviewer`, `qa-test-engineer` |
| Next/React, UI, dashboard, i18n, acessibilidade | `frontend-engineer` | `qa-test-engineer`, `governed-pattern-memory` |
| cobertura, matriz de testes, o que testar | `qa-test-engineer` | `test-runner-agent` |
| **correr** testes, E2E, Jest, CI verde, npm test | `test-runner-agent` | `qa-test-engineer` |
| varredura de **bugs críticos** em commits recentes | `commit-correctness-sentinel` | `security-reviewer`, `test-runner-agent` |
| authz, XSS, injection, segredo, tenant, vulnerabilidade | `security-reviewer` | `backend-engineer` ou `frontend-engineer` |
| auditoria, rastreio, compliance, logs, retenção | `audit-compliance-reviewer` | `backend-engineer` |
| história, sprint, critérios de aceite, DoR/DoD, release | `scrum-delivery-manager` | `qa-test-engineer` |
| fase `*-1`, UI-POLISH, GAP-CLOSURE, veredito, delivery-report | `delivery-workflow` | `governed-pattern-memory`, especialistas |
| specs de agente, domínio frontdesk/clinical/iam, multi-agente | `agent-specs` | `juridico-ia-orchestrator` |
| recepção, agenda, check-in, frontdesk | `frontend-engineer` | Domínio: **frontdesk-agent** |
| PEP, laudo, evolução clínica | `system-architect` | Domínio: **clinical-agent** + security + audit |
| RBAC, RLS, permissões, SoD | `backend-engineer` | Domínio: **iam-agent** + security + audit |
| pedido **ambíguo** ou grande (várias camadas) | `system-architect` | depois especialistas conforme plano |

Specs completas: `.cursor/skills/agent-specs/SKILL.md`

## Regras de orquestração

1. **Mínimo necessário:** preferir 1 skill; acrescentar segunda só quando o risco ou o domínio o exigir.
2. **Risco elevado** (auth, billing, PHI, migração destrutiva): incluir `security-reviewer` ou `audit-compliance-reviewer` **antes** de IMPLEMENT.
3. **Só execução** (sem desenho): `test-runner-agent` pode ser única skill.
4. **Não contradizer** regras do projeto (pt-BR, Railway, RLS, etc.).
5. Se o usuário **nomear** explicitamente um papel, essa skill passa a **prioridade**.
6. **Sem runtime Ruflo:** nunca `npx ruflo init`, MCP swarm, daemon ou hooks externos.
7. **Módulos maduros:** não reabrir sem prompt explícito (clinical, medical-records guardrails).

## Invocação no Cursor

- Skills em `.cursor/skills/<nome>/SKILL.md`; `@juridico-ia-orchestrator` ou `/` + nome.
- Regra sempre ativa: `orquestrador-agentes.mdc`.
- Patterns: `Docs/governance/patterns/index.json`.
