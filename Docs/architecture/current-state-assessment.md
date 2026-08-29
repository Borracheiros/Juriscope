# Avaliação do estado atual

**Classificação:** GREENFIELD

O repositório continha apenas governança Cursor (`.cursor/rules`, `.cursor/skills`) e a EAP acadêmica em `Docs/`. Não havia `package.json`, aplicação, banco, CI nem `AGENTS.md`.

O Git local foi inicializado em `E:/TCC/Juridico-IA` para não usar o repositório do drive `E:/` (ownership duvidoso).

A rule copiada de ambiente Railway compartilhado **não se aplica**. Testes usam Postgres descartável; Compose local só para desenvolvimento. Produção/Railway fica fora da Foundation.

## Riscos herdados

- Governança foi higienizada para o domínio jurídico (clientes, partes, matérias, processos, documentos, prazos, conflitos, privilégios, LGPD).
- Sem histórico Git anterior à fundação.
