# AGENTS.md

Instruções para agentes neste repositório (Juridico-IA).

## Sempre

1. Aplicar `.cursor/rules/` (constituição, backend, frontend, database, security, pt-BR, orquestrador).
2. No início de cada turno, seguir `.cursor/skills/juridico-ia-orchestrator/SKILL.md`.
3. Entregas faseadas: `.cursor/skills/delivery-workflow/SKILL.md`.
4. Backend é a fonte da verdade. Tenant vem da sessão, nunca do body/query/header.
5. `synchronize: true` é proibido. Toda schema change é migration.
6. Testes de banco usam Postgres descartável. Não usar banco compartilhado.
7. Commit só com pedido explícito (exceto quando o prompt da fase autorizar commit intencional após gates).
8. Sem push, deploy, dados reais, nem chamadas a provedores de IA externos na fundação.

## Skills

Ver `.cursor/skills/*/SKILL.md` e o catálogo em `.cursor/skills/agent-specs/SKILL.md`.
