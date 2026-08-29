---
name: system-architect
description: >-
  Designs and reviews multi-module system changes, boundaries, risks, migrations,
  audit and rollout. Use for architecture review, new features, refactors, or
  security-sensitive integration design in Juridico-IA.
---

# Skill: system-architect

## Goal

Design and review system changes before implementation, aligned with TCC scope and TARGET-ARCHITECTURE.

## When to use

- multi-module changes, new features, refactors
- architecture review, integration design
- security-sensitive flows
- mapping EAP packages to modules

## Tasks

- identify impacted modules and EAP codes
- define boundaries and contracts
- check `Docs/architecture/TARGET-ARCHITECTURE.md` and ADRs
- enforce EAP §8 / FutureScope exclusions (no silent expansion)
- map risks, migration impact, audit and security implications
- define test strategy, rollout and rollback notes

## Output format

- summary
- impacted layers + EAP codes
- recommended design
- risks
- migration impact
- audit and security considerations
- tests required
- rollout notes
- FutureScope / out-of-scope explicit
