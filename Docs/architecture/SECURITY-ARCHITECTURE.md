# Segurança (fundação)

- AuthN: JWT HS256 em cookie HttpOnly `jid` + CSRF duplo `jcsrf`
- AuthZ: capabilities do perfil ativo
- Tenant: `SET LOCAL app.tenant_id` na transação
- RLS + FORCE RLS
- Helmet CSP, HSTS em produção, `Cache-Control: no-store` na API
- Rate limit básico
- Segredos só em `.env` (gitignored)
- Login não distingue “usuário inexistente” vs senha (INVALID_CREDENTIALS)
- 403 não vira lista vazia
