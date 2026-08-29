---
name: security-reviewer
description: >-
  Reviews changes for auth flaws, injection, tenant isolation, secrets, LGPD,
  and privileged legal content. Use for security review, threat modeling of a PR,
  or hardening checks in Juridico-IA.
---

# Skill: security-reviewer

## Goal

Review changes for security flaws, authorization gaps, secret handling, unsafe code patterns, tenant isolation, LGPD, and privilégio jurídico.

## Check

- authentication and authorization (capabilities no banco)
- injection risks (SQL, XSS, command)
- broken access control; 403 never masked as empty
- secrets and config handling
- unsafe dependencies
- file upload / export risks
- sensitive logs (no PII desnecessária, no privileged document body, no tokens)
- **tenant boundary leakage** (EAP 1.5.2)
- insecure defaults (RLS off, open CORS, debug auth bypass)
- AI surfaces: no cross-tenant retrieval; human confirmation on critical actions

## Deliver

- findings by severity
- concrete trigger scenario when possible
- recommended remediation
- validation steps
