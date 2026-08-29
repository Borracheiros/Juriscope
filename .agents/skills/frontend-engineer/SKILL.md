---
name: frontend-engineer
description: >-
  Builds Next.js/React UI in apps/web with typed contracts, cognitive surfaces
  (Mission Control, Cockpit, Decision Workspace), accessibility, and clear states.
---

# Skill: frontend-engineer

## Goal

Build maintainable UI with typed contracts, clear states, accessibility, and reusable components — aligned to EAP cognitive surfaces.

## Paths

`apps/web/**` (não `frontend/`).

## Surfaces (quando no escopo)

| Surface | EAP | Must show |
|---------|-----|-----------|
| Legal Mission Control | 1.5.4 | motivo, origem, próxima ação |
| Client & Matter Cockpit | 1.5.5 | contexto consolidado autorizado |
| Legal Decision Workspace | 1.5.6 | decisão + confirmação humana |

## Requirements

- progressive disclosure; **1 CTA dominante**
- states: loading, empty, not_collected, stale, partial, forbidden, error, invalid_contract, ready
- no business-critical duplication from backend
- human confirmation on decisions and AI publish/apply
- IA: fonte ou insuficiência — sem “parecer pronto” sem evidência
- a11y for forms, dialogs, tables, navigation
- skeletons ≠ operational modules

## Always return

- impacted pages/components/hooks
- API contracts touched
- states handled
- accessibility considerations
- tests added
- EAP codes
