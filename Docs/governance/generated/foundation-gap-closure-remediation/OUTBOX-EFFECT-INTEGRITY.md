# Outbox concurrency & effect integrity

## Contract

1. Claim (`FOR UPDATE SKIP LOCKED`) may pick `PENDING` (respecting `locked_until` backoff) or expired `PROCESSING` leases.
2. Dispatcher selects handler by `event_type`. Missing handler → fail path.
3. Handler must produce the durable effect (`app_private.record_outbox_effect` → `outbox_effects`).
4. Only after handler success → `complete_outbox` → `PUBLISHED`.
5. Handler error → `fail_outbox` with exponential backoff on `locked_until`; at `attempt_count >= 8` → `FAILED_PERMANENT`.
6. Invariant tested: `PUBLISHED` rows without `outbox_effects` count must be **0**.

## Results (scratch)

| Case | Result |
|------|--------|
| Two workers | `completed` sum = 1; effects = 1; PUBLISHED = 1 |
| Handler throws | completed = 0; status PENDING; locked_until set; effects = 0; immediate re-claim = 0 (backoff) |
| attempt_count 7→8 fail | FAILED_PERMANENT; effects = 0 |
| Expired PROCESSING lease | reclaimed; PUBLISHED; effects = 1 |
| Fail then retry | first 0; clear backoff; second 1; effects = 1 |

DLQ/broker remain deferred; terminal safe state is `FAILED_PERMANENT`.
