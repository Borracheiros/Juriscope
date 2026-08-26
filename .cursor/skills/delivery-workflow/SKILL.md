---
name: delivery-workflow
description: >-
  Phased delivery loop for Juridico-IA (discovery, implement, gap closure, verdict).
  Use for UI polish prompts, governance phases, multi-step features, or when the
  user expects delivery reports, generated JSON artifacts, and explicit verdicts.
---

# Juridico-IA — delivery workflow

Loop inspirado em orquestração multi-fase (Ruflo task-orchestrator / SPARC), adaptado para Cursor **sem runtime externo**.

## Quando usar

- Prompts com fase explícita (`*-1`, `GAP-CLOSURE`, `UI-POLISH`, `DELIVERY-REPORT`)
- Features multi-camada (backend + frontend + i18n + testes)
- Pedidos com critérios numerados ou veredito obrigatório
- Orquestrador inclui esta skill quando o pedido exige **entrega governada**

## Fases (sempre nesta ordem)

```text
DISCOVERY → PLAN → IMPLEMENT → VALIDATE → GAP_CLOSURE → VERDICT → (opcional) PATTERN_STORE
```

| Fase | Objetivo | Skills típicas |
|------|----------|----------------|
| DISCOVERY | Ler código, guardrails, artifacts anteriores | `governed-pattern-memory`, `system-architect` |
| PLAN | Plano curto, módulos, riscos, testes | `system-architect` + especialista |
| IMPLEMENT | Código mínimo correto | `backend-engineer` / `frontend-engineer` |
| VALIDATE | typecheck, lint, vitest, E2E aplicável | `test-runner-agent`, `qa-test-engineer` |
| GAP_CLOSURE | Auditar critérios do prompt vs entrega | `qa-test-engineer`, `commit-correctness-sentinel` |
| VERDICT | Emitir veredito único + relatório | `scrum-delivery-manager` |
| PATTERN_STORE | Registrar padrão reutilizável (sem PHI) | `governed-pattern-memory` |

## Estratégias de execução (Ruflo → Juridico-IA)

Escolher **uma** e declarar no bloco [Orquestrador]:

| Estratégia | Quando | Exemplo |
|------------|--------|---------|
| **Sequential** | Dependências rígidas | migração → backend → frontend → testes |
| **Parallel** | Tarefas independentes | vitest + grep i18n em paralelo após implement |
| **Balanced** | Mix (padrão Juridico-IA) | plano sequencial; testes/i18n paralelos pós-código |
| **Adaptive** | Bloqueio inesperado | replanejar fase sem reabrir módulos maduros |

## Padrões de prompt (templates)

### A — Feature / polish enterprise

```text
1. DISCOVERY: guardrails + patterns index + código existente
2. PLAN: componentes, i18n keys, testes
3. IMPLEMENT: UI/backend focado
4. VALIDATE: vitest + E2E da rota
5. GAP_CLOSURE: N/N critérios
6. VERDICT: <PHASE>_APPROVED ou _PARTIAL
7. Relatório: Docs/governance/<PHASE>-delivery-report.md
8. Artifact: Docs/governance/generated/<phase-slug>.generated.json
```

### B — Bug fix / regressão

```text
1. Reproduce + analyze (Sequential)
2. Fix + unit test (Parallel)
3. Regression suite (Sequential)
4. VERDICT: FIX_VERIFIED ou FIX_PARTIAL
```

### C — Security / audit

```text
1. DISCOVERY + threat surface
2. security-reviewer + audit-compliance-reviewer (Sequential, antes de código)
3. IMPLEMENT mitigações
4. VALIDATE + scanners se disponíveis
5. VERDICT + relatório em Docs/governance/
```

## Saída obrigatória por fase grande

Para prompts com fase nomeada, entregar:

1. **Relatório markdown** em `Docs/governance/<PHASE>-delivery-report.md`
2. **JSON artifact** em `Docs/governance/generated/<phase-kebab>.generated.json` com:
   - phase, verdict, criteriaTotal, criteriaMet, tests, migrations
3. **Veredito único** no final (ex.: `FRONTDESK_SCHEDULE_UI_POLISH_1_APPROVED`)

## Regras de ouro (healthcare / LGPD)

- **Nunca** persistir PHI, tokens, `.env`, ou dados de paciente em patterns ou relatórios
- **Não** reabrir módulos maduros sem prompt explícito (ver `medical-records-boundary-guardrails.md`)
- **Não** declarar VERDICT antes de VALIDATE + GAP_CLOSURE
- Migrations: contar pendentes vs aplicadas; registrar no artifact
- Commit só quando o usuário pedir; sugerir mensagem conventional

## Integração com outras skills

- Entrada: `juridico-ia-orchestrator` roteia para esta skill
- Antes de PLAN: `governed-pattern-memory` (search)
- Após VERDICT aprovado: `governed-pattern-memory` (store) se houver padrão reutilizável
- Risco auth/PHI: incluir `security-reviewer` e/ou `audit-compliance-reviewer` antes de IMPLEMENT
