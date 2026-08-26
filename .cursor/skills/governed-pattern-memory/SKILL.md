---
name: governed-pattern-memory
description: >-
  Governed substitute for external agent memory: search and store reusable
  delivery patterns in Docs/governance/patterns/ before and after tasks. Never
  stores secrets, PHI, or .env content.
---

# Juridico-IA — memória governada (patterns)

Substituto **seguro** do loop Ruflo memory_search / memory_store: tudo versionado em git, sem vector DB externo, sem HuggingFace, sem MCP.

## Quando usar

- **Antes** de PLAN ou IMPLEMENT em tarefas não triviais
- **Depois** de VERDICT aprovado, se surgiu padrão reutilizável
- Orquestrador aciona automaticamente em pedidos multi-fase ou UI polish

## Search (antes da tarefa)

1. Ler `Docs/governance/patterns/index.json`
2. Abrir 1–3 patterns cujos tags / skills casem com o pedido
3. Consultar artifacts recentes em `Docs/governance/generated/*.json` **do mesmo domínio** (metadados only)
4. Resumir em 2–4 bullets o que reutilizar — **não** colar PHI ou secrets

```text
[Patterns] Reutilizar: …
[Patterns] Evitar (anti-padrão): …
```

## Store (após sucesso)

Só se VERDICT = `APPROVED` ou `APPROVED_WITH_RESTRICTIONS` **e** o padrão for genérico.

1. Criar ou atualizar `Docs/governance/patterns/<slug>.md`
2. Atualizar `Docs/governance/patterns/index.json`
3. Conteúdo permitido: estrutura de componentes, ordem de testes, checklist i18n, convenções de naming, lições de gap closure
4. Conteúdo **proibido**: nomes de pacientes, credenciais, URLs com tokens, dumps de `.env`, SQL com dados reais

## Formato de pattern (`<slug>.md`)

```markdown
# <Título>

**Tags:** frontend, i18n, e2e  
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

## Entrada no index.json

```json
{
  "id": "kebab-slug",
  "title": "Human title",
  "path": "kebab-slug.md",
  "tags": ["frontend"],
  "skills": ["frontend-engineer"],
  "addedAt": "YYYY-MM-DD"
}
```

## Proibições (LGPD / segurança)

| Proibido | Alternativa |
|----------|-------------|
| memory_store com conteúdo de chat clínico | Relatório anonimizado em `Docs/governance` |
| Copiar `.env` ou `DATABASE_URL` | Referir variáveis por nome apenas |
| Patterns com PII | Generalizar (“máscara CPF no formulário”) |
| Auto-gravar sem aprovação do veredito | Só após GAP_CLOSURE completo |
