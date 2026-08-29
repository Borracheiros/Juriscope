---
name: commit-correctness-sentinel
description: >-
  Analisa commits recentes em busca de bugs de correção de alta severidade (perda
  de dados, crashes, falhas de segurança, comportamento incorreto em caminhos críticos)
  e propõe correções mínimas com testes quando aplicável. Usar quando o usuário
  pedir varredura de commits ou auditoria de regressões críticas.
---

# Commit correctness sentinel (bugs críticos em commits recentes)

## Objetivo

Análise profunda de problemas de **correção** de **alta severidade** introduzidos ou expostos por alterações recentes.

## Gatilhos

- **Manual:** o usuário invoca `@commit-correctness-sentinel` ou cola o prompt base abaixo.
- **Não há** automação agendada versionada neste repositório (sem script `cursor-daily-bug-sweep` e sem timezone obrigatório). Se o usuário configurar cron local no futuro, documentar fora desta skill até o script existir.

## Prompt base (copiar para o Agent)

```text
You are a deep bug-finding automation focused on high-severity issues.

## Goal

Inspect recent commits and identify critical correctness bugs that escaped review. Only surface issues that would cause data loss, crashes, security holes, or significant user-facing breakage.

## Investigation strategy

- Focus on behavioral changes with meaningful blast radius.
- Look for: data corruption, race conditions that lose writes, null dereferences in critical paths, auth/permission bypasses, infinite loops, resource leaks, and silent data truncation.
- Trace through the full code path — don't just pattern-match on the diff.
- Ignore: style issues, minor edge cases, theoretical concerns without a concrete trigger, and low-severity UX-only issues.

## Confidence bar

- Describe a concrete scenario that triggers the bug.
- If you cannot construct a plausible trigger, do not open a PR.

## Fix strategy

- Minimal, high-confidence fix + tests when possible.
- Avoid broad refactors in the same change.

## Safety rules

- Do not open a PR unless highly confident.
- If no critical bug is found, post a short "no critical bugs found" summary.
- Commit / push only if the user explicitly asks.
```

## Fluxo

1. Âmbito: `git log -20 --oneline` (ou janela pedida) + diffs
2. Priorizar: auth, RBAC, tenant isolation, migrações, exports, caminhos jurídicos com escrita
3. Rastrear caller chain
4. Só propor merge/PR com cenário reproduzível
5. Patch mínimo + testes
6. Validar com `test-runner-agent`

## Regras Juridico-IA

- Postgres scratch / Compose local — nunca Railway compartilhado nem produção
- Seguir `security-reviewer` para authz/injection/tenant
- Resumos ao usuário em **pt-BR**
- Respeitar escopo TCC (`juridico-ia-tcc-scope.mdc`)

## Saída

- Sem bug crítico: resumo curto + áreas revistas
- Com fix: impacto, causa raiz, alterações, comandos, riscos residuais
