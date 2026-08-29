# AGENTS.md

Instruções para agentes neste repositório (**Juridico-IA**).

## Propósito

Protótipo acadêmico do **TCC Inteligent-Juridico / Orion Jurídico** (CEUB): plataforma jurídica SaaS multi-tenant, cognitiva (missões → contexto → decisões), com NestJS como fonte da verdade, PostgreSQL + RLS, auditoria, LGPD/privilégio jurídico e IA assistiva com confirmação humana.

Escopo detalhado: `.cursor/rules/juridico-ia-tcc-scope.mdc`.

## Hierarquia normativa

1. `Docs/Proposta-TCC-Orion-Juridico.md`
2. `Docs/EAP-Gestao-Projeto-Inteligent-Juridico.md`
3. `Docs/architecture/` (TARGET-ARCHITECTURE, ADRs, ROADMAP)
4. `Docs/domain/`
5. Este `AGENTS.md`
6. `.cursor/rules/` e `.cursor/skills/`

## Skills — fonte canônica e espelho

| Caminho | Papel |
|---------|--------|
| `.cursor/skills/*/SKILL.md` | **Fonte canônica** (editar aqui) |
| `.agents/skills/*/SKILL.md` | **Espelho** para descoberta pelo Codex — gerado |

Comandos:

```bash
npm run skills:sync    # copia canônico → espelho
npm run skills:check   # falha se divergir
```

Não manter conteúdo diferente nos dois lados; não substituir “Cursor”/“Codex” no texto das skills.

## Evidência acadêmica e auditorias

- `npm run proposta:extract` gera o Markdown estrutural a partir do DOCX; `npm run proposta:check` detecta divergência.
- `npm run audit:evidence:check` verifica a baseline SHA-256 dos pacotes encerrados.
- Atualizar o manifesto com `npm run audit:evidence:manifest` somente ao adicionar deliberadamente um novo pacote de auditoria, nunca para encobrir alteração de pacote encerrado.

## Sempre

1. Aplicar `.cursor/rules/` (constituição, escopo TCC, backend, frontend, database, security, pt-BR, orquestrador).
2. No início de cada turno, seguir `.cursor/skills/juridico-ia-orchestrator/SKILL.md`.
3. Entregas faseadas: `.cursor/skills/delivery-workflow/SKILL.md`.
4. Backend é a fonte da verdade. Tenant vem da sessão, nunca do body/query/header.
5. `synchronize: true` é proibido. Toda schema change é migration. SQL parametrizado — **sem TypeORM**.
6. Testes de banco usam Postgres descartável. Não usar banco compartilhado.
7. **Commit / push / deploy** só com pedido **explícito** do usuário.
8. Sem dados reais nem chamadas a provedores de IA externos na fundação.
9. Módulos FutureScope (ex.: Sprints 9–11) e skeletons ≠ operacionais até autorização explícita.
10. Não alterar pacotes encerrados em `Docs/audits/codex/` (append-only); o manifesto SHA-256 deve permanecer verde.

## Catálogo

Ver `.cursor/skills/*/SKILL.md` e `.cursor/skills/agent-specs/SKILL.md`.
