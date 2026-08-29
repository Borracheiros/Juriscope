#!/usr/bin/env bash
# Provisions runtime roles from environment secrets. Does not echo password values.
set -euo pipefail

: "${JURIDICO_APP_PASSWORD:?JURIDICO_APP_PASSWORD is required}"
: "${JURIDICO_WORKER_PASSWORD:?JURIDICO_WORKER_PASSWORD is required}"
: "${POSTGRES_USER:?POSTGRES_USER is required}"
: "${POSTGRES_DB:?POSTGRES_DB is required}"

psql -v ON_ERROR_STOP=1 \
  --username "$POSTGRES_USER" \
  --dbname "$POSTGRES_DB" \
  -v app_pw="$JURIDICO_APP_PASSWORD" \
  -v worker_pw="$JURIDICO_WORKER_PASSWORD" \
  -v dbname="$POSTGRES_DB" <<'EOSQL'
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'juridico_app') THEN
    CREATE ROLE juridico_app NOSUPERUSER NOBYPASSRLS NOCREATEDB NOCREATEROLE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'juridico_worker') THEN
    CREATE ROLE juridico_worker NOSUPERUSER NOBYPASSRLS NOCREATEDB NOCREATEROLE;
  END IF;
END $$;
ALTER ROLE juridico_app WITH LOGIN PASSWORD :'app_pw';
ALTER ROLE juridico_worker WITH LOGIN PASSWORD :'worker_pw';
SELECT format('GRANT CONNECT ON DATABASE %I TO juridico_app, juridico_worker', :'dbname') \gexec
EOSQL
