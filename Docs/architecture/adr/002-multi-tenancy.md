# ADR 002 — Multi-tenancy

Tenant obrigatório. `tenant_id` nas tabelas de negócio. RLS + FORCE RLS. Tenant derivado da sessão, nunca do body/query/header. Role de aplicação sem superuser.
