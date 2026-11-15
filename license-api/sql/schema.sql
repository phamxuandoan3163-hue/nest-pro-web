-- Idempotent license schema. Run once in the Supabase SQL editor (or as a migration).
-- The webhook and license routes no longer run this on every request.

CREATE TABLE IF NOT EXISTS nova_licenses (
  key_hash TEXT PRIMARY KEY,
  key_cipher TEXT NOT NULL,
  plan_key TEXT NOT NULL,
  variant_id TEXT NOT NULL,
  paddle_transaction_id TEXT NOT NULL UNIQUE,
  customer_email TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  max_activations INTEGER NOT NULL CHECK (max_activations > 0),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','revoked')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS nova_license_devices (
  id TEXT PRIMARY KEY,
  key_hash TEXT NOT NULL REFERENCES nova_licenses(key_hash),
  device_id TEXT NOT NULL,
  device_name TEXT NOT NULL,
  activated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deactivated_at TIMESTAMPTZ,
  UNIQUE (key_hash, device_id)
);

CREATE TABLE IF NOT EXISTS paddle_webhook_events (
  event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE nova_licenses ADD COLUMN IF NOT EXISTS paddle_subscription_id TEXT;
ALTER TABLE nova_licenses ADD COLUMN IF NOT EXISTS subscription_status TEXT;
ALTER TABLE nova_licenses ADD COLUMN IF NOT EXISTS scheduled_cancel_at TIMESTAMPTZ;
ALTER TABLE nova_licenses ADD COLUMN IF NOT EXISTS subscription_event_at TIMESTAMPTZ;
ALTER TABLE nova_licenses ADD COLUMN IF NOT EXISTS license_email_sent_at TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS nova_licenses_paddle_subscription_id_unique
  ON nova_licenses(paddle_subscription_id)
  WHERE paddle_subscription_id IS NOT NULL;
