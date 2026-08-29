---
name: delivery-workflow
description: >-
  Phased delivery loop for Juridico-IA (discovery, implement, gap closure, verdict).
  Use for UI polish prompts, governance phases, multi-step features, or when the
  user expects delivery reports, generated JSON artifacts, and explicit verdicts.
---

# Juridico-IA — delivery workflow

Loop multi-fase adaptado para Cursor **sem runtime externo**.

## Quando usar

- Prompts com fase explícita (`*-1`, `GAP-CLOSURE`, `UI-POLISH`, `DELIVERY-REPORT`, alinhamento TCC)
- Features multi-camada (backend + frontend + testes)
- Pedidos com critérios numerados ou veredito obrigatório

## Fases (ordem)

```text
DISCOVERY → PLAN → IMPLEMENT → VALIDATE → GAP_CLOSURE → VERDICT → (opcional) PATTERN_STORE
```

| Fase | Objetivo | Skills típicas |
|------|----------|----------------|
| DISCOVERY | Código, guardrails, EAP, artifacts | `governed-pattern-memory`, `system-architect` |
| PLAN | Plano, módulos, riscos, testes, códigos EAP | `system-architect` + especialista |
| IMPLEMENT | Código mínimo correto | `backend-engineer` / `frontend-engineer` |
| VALIDATE | typecheck, lint, vitest, secret-scan se marco | `test-runner-agent`, `qa-test-engineer` |
| GAP_CLOSURE | Critérios do prompt vs entrega | `qa-test-engineer`, `commit-correctness-sentinel` |
| VERDICT | Veredito único + relatório | `scrum-delivery-manager` |
| PATTERN_STORE | Padrão reutilizável (sem PII) | `governed-pattern-memory` |

Opcional **ACADEMIC_EVIDENCE** (EAP 1.6.x / 1.8.x): matriz de testes, limitações, pacote de evidências — sem implementar produto.

## Estratégias

| Estratégia | Quando |
|------------|--------|
| Sequential | Dependências rígidas |
| Parallel | Tarefas independentes pós-código |
| Balanced | Padrão Juridico-IA |
| Adaptive | Bloqueio inesperado sem reabrir módulos maduros |

## Templates de veredito (exemplos)

```text
JURIDICO_IA_FOUNDATION_GAP_CLOSURE_READY_FOR_INDEPENDENT_AUDIT
JURIDICO_IA_TCC_GOVERNANCE_ALIGNED
MISSION_CONTROL_1_APPROVED
COCKPIT_1_PARTIAL
DECISION_WORKSPACE_1_APPROVED
LEGAL_AI_CONTEXT_1_PARTIAL
```

**Não** usar vereditos de outros produtos ou módulos clínicos herdados.

## Saída obrigatória por fase grande

1. Relatório markdown em `Docs/governance/<PHASE>-delivery-report.md` (ou relatório nomeado no prompt)
2. JSON artifact em `Docs/governance/generated/<phase-kebab>.generated.json` quando pedido
3. Veredito único; citar códigos EAP quando aplicável

## Regras de ouro

- Nunca persistir PII, conteúdo privilegiado, tokens ou `.env` em patterns/relatórios
- Skeletons ≠ entregues; FutureScope só com autorização
- VERDICT só após VALIDATE + GAP_CLOSURE
- Commit só com pedido explícito
- Não alterar `Docs/audits/codex/` (append-only)

## Integração

- Entrada: `juridico-ia-orchestrator`
- Antes de PLAN: `governed-pattern-memory` (search)
- Após APPROVED: store pattern se genérico
- Auth/PII/privilégio jurídico: security e/ou audit antes de IMPLEMENT
