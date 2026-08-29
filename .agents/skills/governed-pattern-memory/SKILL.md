---
name: governed-pattern-memory
description: >-
  Governed substitute for external agent memory: search and store reusable
  delivery patterns in Docs/governance/patterns/ before and after tasks. Never
  stores secrets, PII, privileged legal content, or .env content.
---

# Juridico-IA — memória governada (patterns)

Substituto **seguro** do loop memory_search / memory_store: tudo versionado em git, sem vector DB externo.

## Quando usar

- **Antes** de PLAN ou IMPLEMENT em tarefas não triviais
- **Depois** de VERDICT aprovado, se surgiu padrão reutilizável
- Orquestrador aciona em pedidos multi-fase ou UI cognitiva

## Search (antes)

1. Ler `Docs/governance/patterns/index.json` (se existir)
2. Abrir 1–3 patterns cujos tags / skills / **códigos EAP** casem
3. Consultar artifacts recentes em `Docs/governance/generated/` do mesmo domínio (metadados only)
4. Resumir em 2–4 bullets — **não** colar PII, privilégio jurídico ou secrets

```text
[Patterns] Reutilizar: …
[Patterns] Evitar (anti-padrão): …
```

## Store (após sucesso)

Só se VERDICT = `APPROVED` ou `APPROVED_WITH_RESTRICTIONS` **e** o padrão for genérico.

1. Criar/atualizar `Docs/governance/patterns/<slug>.md`
2. Atualizar `Docs/governance/patterns/index.json`
3. Tags sugeridas: `eap-1.5.4`, `gap-closure`, `mission-control`, `rls`, `audit`, …
4. **Proibido:** nomes reais, credenciais, URLs com tokens, dumps `.env`, SQL com dados reais, substrings que acionem `secret-scan` (ex.: DSN com senha embutida, cláusula SQL de definição de senha de role)

## Formato

```markdown
# <Título>

**Tags:** frontend, eap-1.5.4, gap-closure
**Skills:** frontend-engineer, qa-test-engineer
**Origem:** <PHASE> (commit opcional)

## Problema
…

## Solução
…

## Checklist
- [ ] …

## Anti-padrões
- …
```
