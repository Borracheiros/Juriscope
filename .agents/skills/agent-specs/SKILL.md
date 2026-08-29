---
name: agent-specs
description: >-
  Agent specification catalog for Juridico-IA Cursor skills: roles, capabilities,
  dependencies, deliverables, and risk tier. Use when spawning multi-agent work,
  defining a new domain agent, or aligning orchestrator routing with Ruflo-style specs.
---

# Juridico-IA — catálogo de specs de agente

Specs mapeadas para **skills Cursor existentes** (sem spawn runtime).
Canônico: `.cursor/skills/`. Espelho: `.agents/skills/`.

## Schema (referência)

```yaml
id: <skill-name>
role: <one line>
riskTier: low | medium | high | critical
capabilities: []
dependsOn: []
deliverables: []
forbidden: []
concurrency: sequential
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
role: Fronteiras, contratos, migrações, TARGET-ARCHITECTURE, exclusões EAP
riskTier: medium
capabilities: [boundary_design, migration_impact, audit_mapping, eap_scope_check]
dependsOn: [governed-pattern-memory]
deliverables: [architecture_summary, risk_list]
forbidden: [implement_without_plan, expand_futurescope_silently]
```

### backend-engineer

```yaml
id: backend-engineer
role: NestJS, use cases, SQL parametrizado (pg), migrations próprias, DTOs
riskTier: high
capabilities: [nestjs_modules, parameterized_sql, migrations, validation]
dependsOn: [system-architect]
deliverables: [code, migration_files, unit_tests]
forbidden: [bypass_rls, typeorm, raw_sql_without_review]
```

### frontend-engineer

```yaml
id: frontend-engineer
role: Next.js em apps/web — Mission Control, Cockpit, Decision Workspace, a11y
riskTier: medium
capabilities: [react_components, progressive_disclosure, vitest]
dependsOn: [system-architect]
deliverables: [ui_components, vitest_specs]
forbidden: [hardcoded_secrets, treat_skeleton_as_operational, break_rbac_ui]
```

### qa-test-engineer

```yaml
id: qa-test-engineer
role: Matriz de testes EAP 1.6.x, gap closure, evidência reproduzível
riskTier: low
capabilities: [test_design, gap_audit, e2e_planning, academic_evidence]
dependsOn: []
deliverables: [test_matrix, gap_report]
forbidden: [declare_done_without_evidence, skip_eq_pass]
```

### security-reviewer

```yaml
id: security-reviewer
role: Authz, tenant isolation, LGPD, privilégio jurídico, secrets
riskTier: critical
capabilities: [threat_review, dependency_audit, tenant_isolation]
dependsOn: []
deliverables: [security_findings, mitigations]
forbidden: [approve_pii_or_privileged_content_in_logs]
```

### audit-compliance-reviewer

```yaml
id: audit-compliance-reviewer
role: LGPD, trilha de auditoria EAP 1.5.8, retenção, SoD
riskTier: critical
capabilities: [audit_trail_review, lgpd_check, privileged_legal_content]
dependsOn: [security-reviewer]
deliverables: [compliance_notes]
forbidden: [disable_audit_for_convenience]
```

### delivery-workflow

```yaml
id: delivery-workflow
role: Fases DISCOVERY→VERDICT, relatórios, artifacts, códigos EAP
riskTier: low
capabilities: [phased_delivery, verdict_emission, report_generation]
dependsOn: [governed-pattern-memory, qa-test-engineer]
deliverables: [delivery_report_md, generated_json, verdict]
forbidden: [verdict_before_validate, store_pii_in_patterns]
```

## Domínios de roteamento (compostos — não são skills novas)

Use **ordem de skills**; skill dedicada só com fronteira operacional real e trabalho recorrente.

### mission-control (EAP 1.5.4)

```yaml
id: mission-control
skills: [frontend-engineer, backend-engineer, qa-test-engineer]
forbidden: [fake_operational_missions]
```

### cockpit (EAP 1.5.5)

```yaml
id: cockpit
skills: [frontend-engineer, backend-engineer, security-reviewer]
forbidden: [cross_tenant_context]
```

### decision-workspace (EAP 1.5.6)

```yaml
id: decision-workspace
skills: [frontend-engineer, backend-engineer, audit-compliance-reviewer]
forbidden: [decision_without_human_confirmation]
```

### legal-ai (EAP 1.5.7)

```yaml
id: legal-ai
skills: [system-architect, backend-engineer, security-reviewer, audit-compliance-reviewer]
forbidden: [external_provider_in_foundation, publish_without_human]
```

### academic-evidence (EAP 1.6.x / 1.7–1.8)

```yaml
id: academic-evidence
skills: [qa-test-engineer, scrum-delivery-manager, delivery-workflow]
forbidden: [auto_implement_product_from_monograph]
```

### legal-intake / matter / iam

Mantidos como no orquestrador: intake/clientes/partes; matérias/conflitos; RBAC/RLS.

## Como o orquestrador usa este catálogo

1. Classificar → skill principal + domínio cognitivo/EAP
2. Aplicar dependsOn como ordem
3. riskTier critical → nunca pular security/audit
4. Declarar `Domínio:` e `EAP:` no bloco [Orquestrador] quando aplicável
