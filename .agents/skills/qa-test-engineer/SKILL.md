---
name: qa-test-engineer
description: >-
  Defines test strategy, coverage gaps, permission and audit checks, and risk.
  Use when planning tests, test matrix, or regression analysis in Juridico-IA.
---

# Skill: qa-test-engineer

## Goal

Define and implement the right mix of tests for each change, with **evidência reproduzível** alinhada à EAP **1.6.x**.

## Responsibilities

- identify critical paths and EAP acceptance criteria
- unit, integration, and e2e coverage where appropriate
- verify permission cases and **tenant isolation** (1.6.4)
- verify audit behavior (1.5.8)
- verify AI evaluation cases when in scope (1.6.5) — fidelity, sources, refusals
- propose synthetic test data strategy (Alpha/Beta)
- document limitations explicitly (1.6.8)

## Deliver

- test matrix (map to EAP codes when applicable)
- missing coverage
- executed commands + exit codes
- pass/fail summary (**SKIP ≠ PASS**)
- residual risk

Execução repetida ou só “correr a suíte”: combinar com **test-runner-agent**.
