# STOP

**Veredito:** `JURIDICO_IA_FOUNDATION_CODEX_AUDIT_FAILED_WITH_ACTIONABLE_EVIDENCE`

Não iniciar Sprint 1, commit, push ou deploy.

## Prompt único para o Cursor

```text
[Orquestrador] Intenção: fechar somente os gaps remanescentes da auditoria
independente do Foundation GAP-CLOSURE.

1. Outbox: implementar dispatcher/handler explícito. Nunca marcar PUBLISHED sem
efeito processado. Adicionar testes de efeito único com dois workers, handler que
falha, retry/backoff, lease expirado, limite de tentativas e FAILED_PERMANENT.
O teste deve falhar se a mensagem virar PUBLISHED sem o efeito esperado.

2. Credenciais: remover senhas literais de juridico_app/juridico_worker/owner do SQL
versionado. Provisionar roles por configuração/secret fora da migration de schema,
sem imprimir valores. Ajustar bootstrap scratch de forma reproduzível.

3. Secret scan: não ignorar .env.example integralmente. Detectar cláusula SQL PASSWORD com literal e URLs PostgreSQL com credenciais previsíveis. Adicionar testes positivos e
negativos do scanner, mantendo allowlist somente para blocos sintéticos delimitados.

4. Auditoria: tornar sanitize recursivo para objetos e arrays e testar password,
token, cookie, secret, prompt, authorization e CPF em níveis aninhados.

5. Executar novamente em PostgreSQL 16 + pgvector scratch: migrations/checksum,
RLS, idempotência 10x, audit imutável, outbox com dois workers e cleanup. Registrar
comandos, exit codes, contagens e SQLSTATE sanitizados.

Não expandir escopo, iniciar Sprint 1, usar banco compartilhado, chamar provedores,
commitar, fazer push ou deploy. Salvar toda documentação em
E:\TCC\Juridico-IA\Docs. Entregar handoff e STOP para nova auditoria independente.
```
