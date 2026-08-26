---
name: agent-specs
description: >-
  Agent specification catalog for Juridico-IA Cursor skills: roles, capabilities,
  dependencies, deliverables, and risk tier. Use when spawning multi-agent work,
  defining a new domain agent, or aligning orchestrator routing with Ruflo-style specs.
---

# Juridico-IA — catálogo de specs de agente

Specs inspiradas em Ruflo AGENT-SPECIFICATIONS.md, mapeadas para **skills Cursor existentes** (sem spawn runtime).

## Schema (referência)

```yaml
id: <skill-name>
role: <one line>
riskTier: low | medium | high | critical
capabilities: []
dependsOn: []          # skills que devem rodar antes
deliverables: []
forbidden: []          # ações sem prompt explícito
concurrency: sequential  # Juridico-IA: um agente Cursor por turno; ordem importa
```

## Catálogo

### juridico-ia-orchestrator

```yaml
id: juridico-ia-orchestrator
role: Roteamento, estratégia de execução, bloco [Orquestrador]
riskTier: low
capabilities: [intent_classification, skill_routing, execution_strategy]
dependsOn: []
deliverables: [orchestrator_block]
forbidden: [skip_security_on_high_risk, auto_commit_without_request]
```

### system-architect

```yaml
id: system-architect
role: Fronteiras, contratos, migrações, rollout
riskTier: medium
capabilities: [boundary_design, migration_impact, audit_mapping]
dependsOn: [governed-pattern-memory]
deliverables: [architecture_summary, risk_list]
forbidden: [implement_without_plan]
```

### backend-engineer

```yaml
id: backend-engineer
role: NestJS, TypeORM, APIs, DTOs, serviços
riskTier: high
capabilities: [nestjs_modules, migrations, validation]
dependsOn: [system-architect]
deliverables: [code, migration_files, unit_tests]
forbidden: [bypass_rls, raw_sql_without_review]
```

### frontend-engineer

```yaml
id: frontend-engineer
role: Next.js, React, dashboard UX, i18n, a11y
riskTier: medium
capabilities: [react_components, i18n_patches, vitest]
dependsOn: [system-architect]
deliverables: [ui_components, locale_patches, vitest_specs]
forbidden: [hardcoded_pt_only, break_rbac_ui]
```

### qa-test-engineer

```yaml
id: qa-test-engineer
role: Matriz de testes, gap closure, critérios N/N
riskTier: low
capabilities: [test_design, gap_audit, e2e_planning]
dependsOn: []
deliverables: [test_matrix, gap_report]
forbidden: [declare_done_without_evidence]
```

### security-reviewer

```yaml
id: security-reviewer
role: Authz, XSS, injection, tenant isolation, secrets
riskTier: critical
capabilities: [threat_review, dependency_audit]
dependsOn: []
deliverables: [security_findings, mitigations]
forbidden: [approve_phi_in_logs]
```

### audit-compliance-reviewer

```yaml
id: audit-compliance-reviewer
role: LGPD, trilha de auditoria, retenção, SoD
riskTier: critical
capabilities: [audit_trail_review, lgpd_check]
dependsOn: [security-reviewer]
deliverables: [compliance_notes]
forbidden: [disable_audit_for_convenience]
```

### delivery-workflow

```yaml
id: delivery-workflow
role: Fases DISCOVERY→VERDICT, relatórios, artifacts
riskTier: low
capabilities: [phased_delivery, verdict_emission, report_generation]
dependsOn: [governed-pattern-memory, qa-test-engineer]
deliverables: [delivery_report_md, generated_json, verdict]
forbidden: [verdict_before_validate, store_phi_in_patterns]
```

## Agentes de domínio (perfis compostos)

Use **ordem de skills**, não runtime swarm.

### frontdesk-agent

```yaml
id: frontdesk-agent
role: Recepção, agenda, check-in, pacientes admin (sem prontuário clínico)
riskTier: high
skills: [frontend-engineer, backend-engineer, qa-test-engineer]
dependsOn: [governed-pattern-memory]
deliverables: [ui_polish, i18n, e2e_frontdesk]
forbidden: [medical_records_write, clinical_pep_modules]
guardrails: medical-records-boundary-guardrails.md
```

### clinical-agent

```yaml
id: clinical-agent
role: PEP, laudos, evoluções — só com prompt explícito
riskTier: critical
skills: [system-architect, backend-engineer, security-reviewer, audit-compliance-reviewer]
dependsOn: [governed-pattern-memory]
deliverables: [clinical_module_changes, audit_tests]
forbidden: [touch_without_explicit_prompt, skip_orchestrator_sign_off]
```

### iam-agent

```yaml
id: iam-agent
role: RBAC, RLS, permissões, SoD
riskTier: critical
skills: [backend-engineer, security-reviewer, audit-compliance-reviewer, qa-test-engineer]
dependsOn: [system-architect]
deliverables: [permission_matrix, migration, rbac_tests]
forbidden: [broad_role_grants, skip_sod_review]
```

## Como o orquestrador usa este catálogo

1. Classificar pedido → skill principal + domínio (frontdesk / clinical / iam)
2. Aplicar dependsOn como **ordem** (ex.: clinical → architect → security → backend)
3. riskTier: critical → nunca pular security/audit
4. Declarar domínio no bloco [Orquestrador] quando aplicável: `Domínio: frontdesk-agent`

## Adicionar nova spec

1. Adicionar entrada neste arquivo (seção catálogo ou domínio)
2. Se nova skill dedicada: criar `.cursor/skills/<nome>/SKILL.md`
3. Registrar pattern em `Docs/governance/patterns/` após primeira entrega bem-sucedida
