# Governance hygiene

**Classification:** `GOVERNANCE_AND_DOMAIN_CONTAMINATION_CLOSED`

## Removed / replaced (clinical & shared Railway)

- Recepção clínica, PHI, TISS, PEP, prontuário, pacientes, frontdesk/clinical agents, medical-records guardrails.
- Railway shared-database operating rules (`migration:run:railway`, `backend/.env`, TypeORM-as-default, production-on-same-instance).

## Preserved / reinforced (legal)

- Clientes, partes, matérias, processos, documentos, prazos, conflitos, privilégios, LGPD, auditoria, multi-tenancy, decisão humana sobre IA.

## Files touched

- `.cursor/rules/juridico-ia-dev-and-data.mdc` (rewrite: scratch Postgres / Compose local)
- `.cursor/rules/juridico-ia-premissas-desenvolvimento.mdc` (rewrite: legal constitution)
- `.cursor/rules/portugues-brasileiro.mdc` (lexical table)
- `.cursor/rules/security.mdc`
- `.cursor/rules/juridico-ia-enterprise-interface-standard.mdc`
- `.cursor/skills/juridico-ia-orchestrator/SKILL.md`
- `.cursor/skills/governed-pattern-memory/SKILL.md`
- `.cursor/skills/delivery-workflow/SKILL.md`
- `.cursor/skills/commit-correctness-sentinel/SKILL.md`
- `.cursor/skills/agent-specs/SKILL.md`
- `.cursor/skills/test-runner-agent/SKILL.md`
- `Docs/architecture/current-state-assessment.md`

Railway may still appear as **prohibition** (“não usar Railway compartilhado”). That is the correction, not inherited shared-prod procedure.

Product code was not renamed for terminology except UI “em breve” on skeleton nav (already a Foundation gap).
