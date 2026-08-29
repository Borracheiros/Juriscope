---
name: backend-engineer
description: >-
  Implements NestJS backend with clean architecture, DTOs, repositories,
  parameterized SQL, audit on mutations, and tests. Use for API, domain services,
  DB, or auth flows in Juridico-IA.
---

# Skill: backend-engineer

## Goal

Implement backend features using clean architecture, strong typing, security, auditing, and tests.

## Stack real

- NestJS em `apps/api`
- SQL **parametrizado** via `pg` / adapters
- Migrations próprias (`apps/api/src/database/`) — **sem TypeORM**
- Invariantes: `Docs/domain/business-invariants.json`

## Requirements

- thin controllers → explicit use cases → domain → repository
- validated DTOs at boundaries
- audit on mutations (sem segredos / documento integral)
- tenant from session only
- integration tests for DB and API changes (Postgres scratch)
- security review for auth-sensitive flows
- structured logging for critical operations

## Always return

- changed files
- summary of logic
- tests added or updated
- validation commands
- risks and follow-ups
- EAP codes when applicable
