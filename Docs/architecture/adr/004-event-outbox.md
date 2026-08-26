# ADR 004 — Event outbox

Mutações relevantes gravam `outbox_events` na mesma transação. Worker publica depois. Sem broker nesta fundação. Inbox/webhooks nas integrações (Sprint 11).
