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

Ser o **primeiro passo** em cada turno: classificar o pedido, escolher **uma ou mais** skills especialistas, definir **estratégia de execução** e **ordem**. Depois, atuar **no papel** dessas skills (conteúdo de cada `SKILL.md`), respeitando sempre `.cursor/rules/` (incl. `juridico-ia-tcc-scope.mdc`) e `AGENTS.md`.

Fonte canônica das skills: `.cursor/skills/`. Espelho Codex: `.agents/skills/` (gerado).

## Saída obrigatória (curta, no início da resposta)

```text
[Orquestrador] Intenção: …
Skills: <nome>[, <nome> …]  |  Ordem: …  |  Estratégia: sequential|parallel|balanced|adaptive
[Patterns] …                    ← se governed-pattern-memory aplicável (1 linha)
Domínio: …                      ← opcional (roteamento, não skill dedicada)
EAP: …                          ← opcional: 1.5.4 | 1.5.5 | …
```

Domínios de roteamento (não criar skill nova só por nome):

- `mission-control` (EAP 1.5.4)
- `cockpit` (EAP 1.5.5)
- `decision-workspace` (EAP 1.5.6)
- `legal-ai` (EAP 1.5.7)
- `academic-evidence` (EAP 1.6.x / 1.7–1.8)
- `legal-intake` | `matter` | `iam` (quando aplicável)

## Loop adaptado

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

## Estratégias

| Estratégia | Usar quando |
|------------|-------------|
| **sequential** | migração → API → UI; security antes de código |
| **parallel** | vitest + grep i18n; docs + artifact após implement |
| **balanced** | **padrão** — plano sequencial, validações paralelas |
| **adaptive** | bloqueio CI/E2E — replanejar sem expandir escopo |

## Roteamento (mapa rápido)

| Sinais no pedido | Skill principal | Secundárias / domínio |
|------------------|-----------------|------------------------|
| arquitetura, módulos, fronteira, exclusões EAP | `system-architect` | patterns, security |
| Nest, API, DTO, migração SQL, `pg` | `backend-engineer` | security, qa |
| Next/React, UI, Mission Control, Cockpit, Decision Workspace | `frontend-engineer` | qa, patterns; Domínio cognitivo |
| IA contextual, fontes, RAG, confirmação humana | `system-architect` ou `backend-engineer` | security, audit; Domínio: **legal-ai** |
| evidência acadêmica, monografia, 1.6.x, 1.7–1.8 | `scrum-delivery-manager` ou `qa-test-engineer` | delivery-workflow; Domínio: **academic-evidence** |
| cobertura, matriz de testes | `qa-test-engineer` | test-runner |
| **correr** testes, CI, secret-scan | `test-runner-agent` | qa |
| bugs críticos em commits | `commit-correctness-sentinel` | security, test-runner |
| authz, tenant, segredo, LGPD | `security-reviewer` | backend/frontend |
| auditoria, rastreio, EAP 1.5.8 | `audit-compliance-reviewer` | backend |
| história, DoR/DoD, código EAP | `scrum-delivery-manager` | qa |
| fase, GAP-CLOSURE, veredito | `delivery-workflow` | patterns, especialistas |
| intake, clientes, partes | `frontend-engineer` / `backend-engineer` | Domínio: **legal-intake** |
| matérias, conflitos, documentos, prazos | `system-architect` | Domínio: **matter** + security + audit |
| RBAC, RLS, SoD | `backend-engineer` | Domínio: **iam** + security + audit |
| pedido ambíguo / multi-camada | `system-architect` | depois especialistas |

Specs: `.cursor/skills/agent-specs/SKILL.md`

## Regras de orquestração

1. Preferir 1 skill; segunda só se risco/domínio exigir.
2. Risco elevado (auth, PII, privilégio jurídico, migração destrutiva): security ou audit **antes** de IMPLEMENT.
3. Só execução: `test-runner-agent` pode ser única.
4. Não contradizer rules (pt-BR, Postgres scratch, RLS, escopo TCC).
5. Se o usuário nomear um papel, essa skill tem prioridade.
6. Sem runtime Ruflo externo.
7. Skeletons ≠ operacionais; FutureScope (Sprints 9–11) só com autorização explícita.
8. Commit / push / deploy **nunca** automáticos.
