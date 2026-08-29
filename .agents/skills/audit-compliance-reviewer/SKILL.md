---
name: audit-compliance-reviewer
description: >-
  Validates audit trails, correlation IDs, retention, and sensitive logging for
  LGPD and privileged legal content readiness (EAP 1.5.8) in Juridico-IA.
---

# Skill: audit-compliance-reviewer

## Goal

Ensure traceability, auditability, and compliance readiness for a **legal SaaS** prototype (LGPD + privilégio jurídico). Não usar vocabulário clínico herdado.

## Check (EAP 1.5.8)

- mutation audit trail
- actor attribution
- correlation id
- before/after snapshots when needed (sanitized)
- data retention implications
- export/delete traces
- administrative and legal-operational event logging
- masking of sensitive information in logs and reports
- runtime role: no UPDATE/DELETE on `audit_events`

## Deliver

- audit coverage status
- missing fields or events
- compliance risk summary (LGPD / privilégio jurídico)
- remediation checklist
