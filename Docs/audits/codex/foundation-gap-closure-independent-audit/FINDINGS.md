# Findings — auditoria independente do GAP-CLOSURE

## P0-01 — Outbox marca mensagem como publicada sem processá-la

**Classe:** PRODUCT_DEFECT / CONCURRENCY_GAP
**Arquivos:** `apps/worker/src/outbox.ts`, `apps/worker/test/outbox.test.ts`

`processOnce` faz claim e chama imediatamente `completeOutbox`. Não existe handler,
dispatch ou outro efeito associado a `event_type`. O teste aceita `PUBLISHED` como
sucesso sem verificar qualquer efeito. Uma mensagem pode ser perdida com falso
sucesso. A20 não está MET.

Correção mínima: introduzir dispatcher/handler explícito; marcar `PUBLISHED` apenas
após retorno bem-sucedido; testar efeito único, falha, retry e terminalidade.

## P1-01 — Credenciais previsíveis continuam versionadas

**Classe:** SECURITY_DEFECT
**Arquivos:** `apps/api/src/database/migrations.ts`, `docker/postgres/init.sql`, `.env.example`

As roles são criadas com senhas literais `juridico_app` e `juridico_worker`; o owner
também usa credencial previsível no exemplo. O scanner ignora `.env.example` por
inteiro e seu padrão não detecta cláusula SQL PASSWORD com literal entre aspas. A25 não prova a condição
“nenhuma credencial versionada”.

Correção mínima: provisionar senhas por variável/secret fora do SQL versionado e
adicionar fixtures negativas ao scanner para SQL e arquivos `.env.example`.

## P1-02 — Prova independente de PostgreSQL indisponível

**Classe:** ENVIRONMENT_BLOCKER / EVIDENCE_GAP

Nesta auditoria, API e worker falharam com `Could not find a working container
runtime strategy`; 10 testes da API e 1 do worker ficaram skipped. As evidências do
Cursor são úteis, mas não substituem a execução independente exigida.

## P2-01 — Sanitização de metadata é apenas superficial

**Classe:** PRIVACY_OR_PRIVILEGE_RISK
**Arquivo:** `apps/api/src/modules/platform/audit/audit.repository.ts`

Chaves sensíveis aninhadas não são removidas. A API atual passa metadata simples,
mas o contrato reutilizável permite vazamento futuro. Implementar sanitização
recursiva e teste com objetos/arrays aninhados.

## P2-02 — Caminho de falha do worker não é comprovado

**Classe:** TEST_HARNESS_DEFECT

O único teste verifica dois claims e contagem `PUBLISHED`. Não cobre handler que
falha, retry/backoff, `FAILED_PERMANENT`, lease expirado ou erro após uma instrução
SQL abortar a transação.
