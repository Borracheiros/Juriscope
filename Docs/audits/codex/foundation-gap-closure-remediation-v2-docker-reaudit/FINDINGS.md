# Reauditoria independente com Docker — Foundation remediation v2

Data: 2026-08-26
HEAD: `6dc0a25c18b684ff673ee63d0eeb3721974d4952`
Working tree: `DIRTY`

## Veredito

`JURIDICO_IA_FOUNDATION_CODEX_REAUDIT_APPROVED_WITH_RESIDUAL_DEPENDENCY_RISK`

O Docker Client e o Docker Server foram observados pelo auditor. As provas PostgreSQL-backed antes bloqueadas foram repetidas com Testcontainers e bancos descartáveis: API 12/12 e worker 5/5, ambos sem falhas e sem testes ignorados. O gap de evidência G-01 está fechado.

O pacote anterior não foi alterado nesta reauditoria. A nova evidência foi emitida neste diretório append-only, satisfazendo prospectivamente o controle de proveniência de G-02; a alteração histórica registrada pelo pacote anterior permanece documentada.

## Evidências positivas

- `docker version`: Client 29.7.2 e Server Docker Desktop 4.86.0 / Engine 29.7.2.
- `docker ps`: engine acessível; nenhum banco compartilhado do projeto foi usado.
- API: 2 arquivos, 12 testes aprovados, zero skipped.
- Worker: 1 arquivo, 5 testes aprovados, zero skipped.
- `npm run secret-scan` e `npm run secret-scan:test`: aprovados.
- `npm run typecheck`: aprovado em todos os workspaces.
- `git diff --check`: exit 0; somente avisos de normalização LF/CRLF.
- `npm run audit:deps`: exit 0 no limiar configurado de criticidade; zero vulnerabilidades críticas.

## Riscos residuais

- `npm audit` reportou 13 vulnerabilidades: 3 high e 10 moderate.
- As correções automáticas propostas exigem upgrades major/breaking de NestJS, Next.js ou Testcontainers e não foram aplicadas nesta reauditoria read-only.
- O container externo `ofertazap-pgadmin` estava reiniciando; ele não integra o escopo do Juridico-IA e não afetou as provas descartáveis.

## Controles

`commit=NOT_EXECUTED` · `push=NOT_EXECUTED` · `deploy=NOT_EXECUTED` · `Sprint1=NOT_STARTED`
