# Matriz de alinhamento — Rules e Skills × TCC

**Projeto:** Inteligent-Juridico / Juridico-IA (protótipo acadêmico)
**Fontes:** Proposta (`Docs/Proposta-TCC-Orion-Juridico.md`), EAP, Docs/architecture, Docs/domain
**Data:** 2026-08-29
**Escopo desta matriz:** governança de agentes (rules/skills/AGENTS), sem alteração de código de produto.

## Hierarquia normativa aplicada

1. Proposta de TCC
2. EAP de gestão do projeto
3. Arquitetura alvo, ADRs e ROADMAP
4. Modelo de domínio e invariantes
5. AGENTS.md
6. `.cursor/rules/` e `.cursor/skills/` (canônico); `.agents/skills/` = espelho

## Mapeamento EAP ↔ incrementos

| Código EAP | Entrega | Incremento técnico | Skills / rules principais |
|---|---|---|---|
| 1.5.1 | Fundação técnica executável | Foundation / Sprint 0 / GAP-CLOSURE | premissas, dev-and-data, backend, test-runner |
| 1.5.2 | Identidade e isolamento multi-tenant | IAM, RLS, RBAC | security-reviewer, premissas §3–4, database |
| 1.5.3 | Domínio jurídico mínimo | Sprints 1–3; skeleton até autorização | system-architect, backend, frontend; Domínio: legal-intake / matter |
| 1.5.4 | Legal Mission Control | Jornada cognitiva mínima | frontend-engineer + Domínio: mission-control |
| 1.5.5 | Client & Matter Cockpit | Jornada cognitiva mínima | frontend-engineer + Domínio: cockpit |
| 1.5.6 | Legal Decision Workspace | Decisão + confirmação humana | frontend + audit-compliance + Domínio: decision-workspace |
| 1.5.7 | IA contextual com fontes | Gateway esqueleto; fontes ou insuficiência | security + audit + Domínio: legal-ai |
| 1.5.8 | Auditoria e rastreabilidade | audit_events imutável (runtime) | audit-compliance-reviewer |
| 1.5.9 | Ambiente de demonstração | Compose local + seeds sintéticos | juridico-ia-dev-and-data |
| 1.6.x | Qualidade e avaliação | Matriz de testes, evidências, limitações | qa-test-engineer, delivery-workflow |
| 1.7–1.8 | Monografia e defesa | Artefatos acadêmicos | scrum-delivery-manager (não implementação automática) |

## Gaps encontrados → ação

| Gap | Origem | Ação aplicada |
|---|---|---|
| Master governance com Phase 41 / 40J / 40K / Enterprise OS | legado OrionCare | Reescrita: Foundation → 1.5.3 → 1.5.4–1.5.7 → 1.6.x → 1.5.9 |
| E2E com e-mail Attent, MARIE_TEST, paths frontend/backend | legado | Reescrita fail-closed: Alpha/Beta sintéticos; paths `apps/web` / `apps/api` |
| Interface standard com PHI, RFC-015/016, docs ausentes | legado | Padrão cognitivo jurídico (Mission Control / Cockpit / Decision Workspace) |
| escolha-opcao sugeria commit/push automático em main | conflito AGENTS | Limitar a decisões reversíveis; commit/push/deploy exigem pedido explícito |
| agent-specs citava TypeORM e PHI | desalinhado do código | NestJS + `pg` + SQL parametrizado + migrations |
| delivery-workflow exemplo FRONTDESK_* | clínico | Vereditos Foundation/TCC/jurídicos |
| audit-compliance citava healthcare | clínico | LGPD + privilégio jurídico + EAP 1.5.8 |
| commit-correctness: script e TZ America/New_York inexistentes | legado | Remover automação inexistente; gatilho manual |
| Sem rule de escopo TCC | lacuna | Criar `juridico-ia-tcc-scope.mdc` |
| ROADMAP Sprint 9–11 vs EAP §8 | tensão | FutureScope pós-TCC na rule de escopo |
| `.agents/skills` vs `.cursor/skills` | manutenção dupla | Script de sync + check; `.cursor` canônico |
| Extração Markdown perdia tabelas e inferia títulos por heurística textual | fidelidade documental | Extrator OOXML orientado por estilos/numeração, preservando 597 parágrafos, 98 títulos, 398 itens de lista e 7 tabelas; `proposta:check` detecta divergência |
| Pacotes de auditoria sem baseline objetiva | evidência append-only | Manifesto SHA-256 de 24 arquivos + gate `audit:evidence:check`; o histórico temporal passa a ser verificável após o commit-base |

## Proposta × EAP (síntese)

| Proposta | EAP | Observação |
|---|---|---|
| Três experiências: Mission Control, Cockpit, Decision Workspace | 1.5.4–1.5.6 | Alinhado |
| IA com fontes + supervisão humana | 1.5.7 + hipóteses secundárias | Alinhado; ADR 005 |
| Multi-tenant, ACL, auditoria | 1.5.2, 1.5.8 | Alinhado |
| Exclusões (tribunais, financeiro, mobile, marketplace, produção) | EAP §8 | Alinhado; FutureScope |
| Avaliação usabilidade/IA/segurança | 1.6.x | Alinhado |
| Não construir plataforma comercial integral | Escopo TCC | Explicitado em tcc-scope |

## Controles desta entrega

- Sem commit / push / deploy
- Sem Sprint 1
- Pacotes encerrados de `Docs/audits/codex/` não alterados; apenas o manifesto raiz de integridade foi adicionado
- Sem dados reais / provedores externos de IA
