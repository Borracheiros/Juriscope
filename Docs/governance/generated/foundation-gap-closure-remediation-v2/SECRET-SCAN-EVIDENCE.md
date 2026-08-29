# Secret-scan evidence (F-01)

## Negative (repo must be clean)

After rephrasing documentation examples:

- `npm run secret-scan` → exit **0**, `secret-scan: ok`, hits = 0
- `npm run secret-scan:test` → repository scan assert → **0** hits

Docs/ remains scanned. No global Docs exclusion. Patterns unchanged.

## Positive (detections preserved)

From `scripts/secret-scan.test.cjs` (fixtures inside delimited synthetic allowlist in the test file only):

| Case | Expected | Result |
|------|----------|--------|
| SQL PASSWORD with a single-quoted literal | hit `sql-password` | pass |
| PostgreSQL DSN embedding user and password before host | hit `pg-url-credentials` | pass |
| role-only PostgreSQL URL without embedded password | no pg-url hit | pass |
| labeled `.env.example` path with SQL PASSWORD literal fixture | hit | pass |
| allowlisted SYNTHETIC_PASSWORD block | no hit | pass |

## Fix class

Documentation false-positives removed by **describing** rules instead of embedding live-matching substrings.
