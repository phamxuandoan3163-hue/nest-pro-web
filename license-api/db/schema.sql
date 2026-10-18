-- Nest-Pro Laser license database schema (PostgreSQL / Neon).
-- API routes auto-create the same tables during the first health check.
CREATE TABLE IF NOT EXISTS npl_devices (
  device_hash TEXT PRIMARY KEY,
  device_id_hint TEXT NOT NULL,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  trial_started_at TIMESTAMPTZ,
  trial_expires_at TIMESTAMPTZ,
  privacy_consent_at TIMESTAMPTZ,
  first_ip INET,
  last_ip INET,
  first_city TEXT,
  first_region TEXT,
  first_country TEXT,
  last_city TEXT,
  last_region TEXT,
  last_country TEXT,
  first_user_agent TEXT,
  last_user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (trial_expires_at IS NULL OR trial_started_at IS NOT NULL)
);
CREATE TABLE IF NOT EXISTS npl_licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_hash TEXT NOT NULL UNIQUE,
  key_hint TEXT NOT NULL,
  plan TEXT NOT NULL CHECK (plan IN ('30day','1year')),
  duration_days INTEGER NOT NULL CHECK (duration_days IN (30,365)),
  status TEXT NOT NULL DEFAULT 'issued' CHECK (status IN ('issued','active','expired','revoked')),
  customer_email TEXT,
  max_devices INTEGER NOT NULL DEFAULT 2 CHECK (max_devices BETWEEN 1 AND 10),
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  CHECK (expires_at IS NULL OR starts_at IS NOT NULL)
);
CREATE TABLE IF NOT EXISTS npl_license_activations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_id UUID NOT NULL REFERENCES npl_licenses(id) ON DELETE CASCADE,
  device_hash TEXT NOT NULL,
  activated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deactivated_at TIMESTAMPTZ,
  first_ip INET,
  last_ip INET,
  first_city TEXT,
  first_region TEXT,
  first_country TEXT,
  last_city TEXT,
  last_region TEXT,
  last_country TEXT,
  first_user_agent TEXT,
  last_user_agent TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS npl_active_activation_once ON npl_license_activations (license_id, device_hash) WHERE deactivated_at IS NULL;
CREATE INDEX IF NOT EXISTS npl_activations_device_idx ON npl_license_activations (device_hash, last_seen_at DESC);
CREATE INDEX IF NOT EXISTS npl_licenses_status_idx ON npl_licenses (status, expires_at DESC);
CREATE TABLE IF NOT EXISTS npl_license_events (
  id BIGSERIAL PRIMARY KEY,
  event_type TEXT NOT NULL,
  device_hash TEXT,
  license_id UUID,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip INET,
  city TEXT,
  region TEXT,
  country TEXT,
  user_agent TEXT,
  details JSONB NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS npl_events_time_idx ON npl_license_events (occurred_at DESC);
CREATE INDEX IF NOT EXISTS npl_events_device_idx ON npl_license_events (device_hash, occurred_at DESC);
