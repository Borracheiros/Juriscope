# Relatório — alinhamento de governança TCC

**Data:** 2026-08-29
**Veredito:** `JURIDICO_IA_TCC_GOVERNANCE_ALIGNED`

## Objetivo

Alinhar rules, skills e `AGENTS.md` ao propósito acadêmico do TCC Inteligent-Juridico / Orion Jurídico e à arquitetura real do monorepo (NestJS + `pg` + migrations, sem TypeORM).

## Entregáveis

| Artefato | Status |
|----------|--------|
| `Docs/Proposta-TCC-Orion-Juridico.md` | criado por extração OOXML determinística do `.docx` |
| `Docs/governance/TCC-RULES-SKILLS-ALIGNMENT.md` | criado |
| `.cursor/rules/juridico-ia-tcc-scope.mdc` | criado (`alwaysApply`) |
| Rules corrigidas | 14 tocadas + 1 nova |
| 13 skills canônicas | atualizadas |
| `.agents/skills` | sincronizado (`npm run skills:sync`) |
| `scripts/governance/sync-agent-skills.cjs` | criado |
| `scripts/governance/extract-proposta-docx.cjs` | criado |
| `scripts/governance/audit-evidence-manifest.cjs` | criado |
| `Docs/audits/codex/MANIFEST.sha256.json` | criado (baseline de 24 arquivos encerrados) |
| `AGENTS.md` | atualizado |
| `package.json` | scripts `skills:*`, `proposta:*` e `audit:evidence:*` |

## Correções críticas

- Removidos Phase 41 / 40J / 40K / Enterprise Operational Governance OS
- E2E: removidos e-mail Attent, MARIE, paths `frontend/`/`backend/`; fail-closed Alpha/Beta
- Interface: Mission Control / Cockpit / Decision Workspace; sem PHI/RFC/docs ausentes
- `escolha-opcao-recomendada`: commit/push/deploy nunca automáticos
- Stack documentada: NestJS + SQL parametrizado + migrations próprias
- Domínios cognitivos como **roteamento**, sem 5 skills novas
- `.cursor/skills` canônico; `.agents/skills` espelho byte-identical
- Sequência normativa corrigida para implementar o domínio jurídico mínimo (EAP 1.5.3) antes das superfícies cognitivas (EAP 1.5.4–1.5.7)
- Proposta Markdown agora preserva estilos, listas e as 7 tabelas do DOCX, sem títulos inferidos por texto
- Auditorias encerradas protegidas por manifesto SHA-256 verificável

## Validação executada

| Gate | Resultado |
|------|-----------|
| `npm run skills:sync` | ok (13 skills) |
| `npm run skills:check` | ok |
| `npm run proposta:check` | ok — 597 parágrafos, 98 títulos, 398 itens de lista, 7 tabelas |
| `npm run audit:evidence:check` | ok — 24 arquivos correspondem ao manifesto SHA-256 |
| `npm run secret-scan` | ok |
| `npm run secret-scan:test` | ok |
| `git diff --check` | ok (apenas avisos LF/CRLF) |
| Busca resíduos operacionais (OrionCare, Attent, MARIE, 40J/40K, Phase 41, FRONTDESK, PHI, healthcare, America/New_York, e-mail Attent) em `.cursor`, `.agents`, `AGENTS.md` | **0 hits** |
| `Docs/audits/codex/` | pacotes encerrados inalterados; manifesto raiz adicionado para tornar futuras divergências detectáveis |

## Reconciliação dos achados da revisão

| Achado | Estado | Evidência |
|--------|--------|-----------|
| Extração não fiel do DOCX | corrigido | `proposta:check` compara regeneração exata e contabiliza 7 tabelas |
| EAP 1.5.3 ausente da sequência | corrigido | master governance exige 1.5.3 antes de 1.5.4–1.5.7 |
| Append-only apenas declaratório | corrigido tecnicamente | `MANIFEST.sha256.json` + `audit:evidence:check`; a proveniência histórica começa no commit-base |

## Ocorrências justificadas (não são resíduos operacionais)

| Termo | Onde | Justificativa |
|-------|------|---------------|
| TypeORM | rules/skills/AGENTS como **proibição** | Alinha à stack real (`pg` + migrations) |
| utilizador(es) | `portugues-brasileiro.mdc` coluna “Evitar” | Tabela lexical pt-PT → pt-BR |

## Controles respeitados

- Sem commit / push / deploy
- Sem Sprint 1
- Sem alteração de código funcional de produto (exceto `package.json` scripts de governança)
- Sem dados reais / provedores externos de IA
- Secret-scan, RLS/RBAC/auditoria não enfraquecidos

## Próximos passos sugeridos (não executados)

1. Commit explícito quando o usuário autorizar
2. Reauditoria independente Codex da Foundation (fora deste alinhamento)
3. Autorizar e executar EAP 1.5.3 antes das superfícies EAP 1.5.4–1.5.7
