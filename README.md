# Juridico-IA

Plataforma jurídica SaaS multi-tenant (TCC). A IA auxilia com fontes e revisão humana; **não** decide, protocola, altera prazos nem publica pareceres sozinha.

## Stack (Sprint 0)

- Monorepo npm workspaces (`apps/*`, `packages/*`)
- TypeScript strict
- API: NestJS (`apps/api`, porta 3001)
- Web: Next.js (`apps/web`, porta 3000)
- Worker: consumidor de outbox (`apps/worker`)
- PostgreSQL 16 + pgvector (Docker Compose local)
- Testes de banco em Postgres **descartável** (Testcontainers), nunca em instância compartilhada

## Desenvolvimento local

```bash
cp .env.example .env
npm install
npm run db:up
npm run migration:run
npm run dev:api
npm run dev:web
```

## Qualidade

```bash
npm run typecheck
npm run test
npm run secret-scan
```

Não há push/deploy nesta fundação. Segredos ficam fora do Git.
