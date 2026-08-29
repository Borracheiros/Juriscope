export const INIT_MIGRATION_SQL = `
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS vector;

-- Roles exist without passwords here. LOGIN/PASSWORD are provisioned outside schema SQL
-- (scratch bootstrap / docker entrypoint / ops secrets). Never embed passwords in migrations.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'juridico_app') THEN
    CREATE ROLE juridico_app NOSUPERUSER NOBYPASSRLS NOCREATEDB NOCREATEROLE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'juridico_worker') THEN
    CREATE ROLE juridico_worker NOSUPERUSER NOBYPASSRLS NOCREATEDB NOCREATEROLE;
  END IF;
END $$;

ALTER ROLE juridico_app WITH NOSUPERUSER NOBYPASSRLS;
ALTER ROLE juridico_worker WITH NOSUPERUSER NOBYPASSRLS;

CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, email),
  UNIQUE (id, tenant_id)
);

CREATE TABLE access_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  UNIQUE (tenant_id, code),
  UNIQUE (id, tenant_id)
);

CREATE TABLE profile_capabilities (
  profile_id UUID NOT NULL REFERENCES access_profiles(id) ON DELETE CASCADE,
  capability TEXT NOT NULL,
  PRIMARY KEY (profile_id, capability)
);

CREATE TABLE memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  user_id UUID NOT NULL,
  profile_id UUID NOT NULL,
  UNIQUE (tenant_id, user_id),
  FOREIGN KEY (user_id, tenant_id) REFERENCES users (id, tenant_id),
  FOREIGN KEY (profile_id, tenant_id) REFERENCES access_profiles (id, tenant_id)
);

CREATE TABLE audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  actor_user_id UUID,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  result TEXT NOT NULL DEFAULT 'SUCCESS' CHECK (result IN ('SUCCESS', 'DENIED', 'FAILURE')),
  origin TEXT,
  correlation_id TEXT,
  before_state JSONB,
  after_state JSONB,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE idempotency_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  key TEXT NOT NULL,
  operation TEXT NOT NULL,
  request_hash TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('IN_PROGRESS', 'COMPLETED')),
  response_status INT,
  response_body JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, operation, key)
);

CREATE TABLE outbox_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'PUBLISHED', 'FAILED_PERMANENT')),
  attempt_count INT NOT NULL DEFAULT 0,
  locked_by TEXT,
  locked_until TIMESTAMPTZ,
  last_error TEXT,
  correlation_id TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE outbox_effects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outbox_id UUID NOT NULL UNIQUE REFERENCES outbox_events(id),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  effect_key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX audit_events_tenant_created_idx ON audit_events (tenant_id, created_at DESC);
CREATE INDEX outbox_claim_idx ON outbox_events (status, created_at);
CREATE INDEX outbox_effects_tenant_idx ON outbox_effects (tenant_id, created_at DESC);

CREATE SCHEMA IF NOT EXISTS app_private;

CREATE OR REPLACE FUNCTION app_private.find_login(p_email TEXT, p_slug TEXT)
RETURNS TABLE (
  user_id UUID,
  tenant_id UUID,
  password_hash TEXT,
  profile_id UUID,
  profile_code TEXT,
  display_name TEXT,
  tenant_slug TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT u.id, u.tenant_id, u.password_hash, m.profile_id, p.code, u.display_name, t.slug
  FROM users u
  JOIN tenants t ON t.id = u.tenant_id
  JOIN memberships m ON m.user_id = u.id AND m.tenant_id = u.tenant_id
  JOIN access_profiles p ON p.id = m.profile_id
  WHERE lower(u.email) = lower(p_email)
    AND t.slug = p_slug
    AND u.status = 'ACTIVE'
    AND t.status = 'ACTIVE';
$$;

CREATE OR REPLACE FUNCTION app_private.claim_outbox(p_worker TEXT, p_limit INT, p_lease_seconds INT)
RETURNS SETOF outbox_events
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  WITH picked AS (
    SELECT id
    FROM outbox_events
    WHERE attempt_count < 8
      AND (
        (status = 'PENDING' AND (locked_until IS NULL OR locked_until < now()))
        OR (status = 'PROCESSING' AND locked_until IS NOT NULL AND locked_until < now())
      )
    ORDER BY created_at
    FOR UPDATE SKIP LOCKED
    LIMIT p_limit
  )
  UPDATE outbox_events o
  SET status = 'PROCESSING',
      locked_by = p_worker,
      locked_until = now() + make_interval(secs => p_lease_seconds),
      attempt_count = o.attempt_count + 1
  FROM picked
  WHERE o.id = picked.id
  RETURNING o.*;
END;
$$;

CREATE OR REPLACE FUNCTION app_private.complete_outbox(p_id UUID, p_worker TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE outbox_events
  SET status = 'PUBLISHED',
      published_at = now(),
      locked_by = NULL,
      locked_until = NULL,
      last_error = NULL
  WHERE id = p_id
    AND (locked_by = p_worker OR status = 'PUBLISHED');
END;
$$;

CREATE OR REPLACE FUNCTION app_private.fail_outbox(p_id UUID, p_worker TEXT, p_error TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_attempts INT;
  v_backoff INT;
BEGIN
  SELECT attempt_count INTO v_attempts FROM outbox_events WHERE id = p_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN;
  END IF;
  v_backoff := LEAST(60, (2 ^ LEAST(COALESCE(v_attempts, 1), 5))::int);
  UPDATE outbox_events
  SET status = CASE WHEN attempt_count >= 8 THEN 'FAILED_PERMANENT' ELSE 'PENDING' END,
      locked_by = NULL,
      locked_until = CASE
        WHEN attempt_count >= 8 THEN NULL
        ELSE now() + make_interval(secs => v_backoff)
      END,
      last_error = left(p_error, 200)
  WHERE id = p_id AND locked_by = p_worker AND status = 'PROCESSING';
END;
$$;

CREATE OR REPLACE FUNCTION app_private.record_outbox_effect(p_outbox_id UUID, p_tenant_id UUID, p_effect_key TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO outbox_effects (outbox_id, tenant_id, effect_key)
  VALUES (p_outbox_id, p_tenant_id, left(p_effect_key, 200))
  ON CONFLICT (outbox_id) DO NOTHING;
END;
$$;

REVOKE ALL ON FUNCTION app_private.find_login(TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION app_private.claim_outbox(TEXT, INT, INT) FROM PUBLIC;
REVOKE ALL ON FUNCTION app_private.complete_outbox(UUID, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION app_private.fail_outbox(UUID, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION app_private.record_outbox_effect(UUID, UUID, TEXT) FROM PUBLIC;

GRANT USAGE ON SCHEMA app_private TO juridico_app, juridico_worker;
GRANT EXECUTE ON FUNCTION app_private.find_login(TEXT, TEXT) TO juridico_app;
GRANT EXECUTE ON FUNCTION app_private.claim_outbox(TEXT, INT, INT) TO juridico_worker;
GRANT EXECUTE ON FUNCTION app_private.complete_outbox(UUID, TEXT) TO juridico_worker;
GRANT EXECUTE ON FUNCTION app_private.fail_outbox(UUID, TEXT, TEXT) TO juridico_worker;
GRANT EXECUTE ON FUNCTION app_private.record_outbox_effect(UUID, UUID, TEXT) TO juridico_worker;

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants FORCE ROW LEVEL SECURITY;
CREATE POLICY tenants_isolation ON tenants
  USING (id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE users FORCE ROW LEVEL SECURITY;
CREATE POLICY users_isolation ON users
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE access_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_profiles FORCE ROW LEVEL SECURITY;
CREATE POLICY profiles_isolation ON access_profiles
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE profile_capabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_capabilities FORCE ROW LEVEL SECURITY;
CREATE POLICY capabilities_isolation ON profile_capabilities
  USING (
    EXISTS (
      SELECT 1 FROM access_profiles p
      WHERE p.id = profile_id
        AND p.tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM access_profiles p
      WHERE p.id = profile_id
        AND p.tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid
    )
  );

ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships FORCE ROW LEVEL SECURITY;
CREATE POLICY memberships_isolation ON memberships
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events FORCE ROW LEVEL SECURITY;
CREATE POLICY audit_isolation ON audit_events
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE idempotency_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE idempotency_keys FORCE ROW LEVEL SECURITY;
CREATE POLICY idempotency_isolation ON idempotency_keys
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE outbox_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE outbox_events FORCE ROW LEVEL SECURITY;
CREATE POLICY outbox_isolation ON outbox_events
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

GRANT USAGE ON SCHEMA public TO juridico_app, juridico_worker;
GRANT SELECT, INSERT, UPDATE, DELETE ON tenants, users, access_profiles, profile_capabilities, memberships, idempotency_keys TO juridico_app;
GRANT SELECT, INSERT ON audit_events TO juridico_app;
GRANT SELECT, INSERT ON outbox_events TO juridico_app;
REVOKE UPDATE, DELETE ON audit_events FROM juridico_app;
REVOKE UPDATE, DELETE ON outbox_events FROM juridico_app;
`;

export const MIGRATIONS = [{ id: "20260826120000-init", sql: INIT_MIGRATION_SQL }] as const;
