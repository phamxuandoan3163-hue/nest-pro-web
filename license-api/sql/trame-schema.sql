-- NOVA Trame license tables. Separate from the Nova Nesting tables (nova_*).
-- Run once in the Supabase SQL editor.

CREATE TABLE IF NOT EXISTS trame_licenses (
  key_hash TEXT PRIMARY KEY,
  key_cipher TEXT NOT NULL,
  plan_key TEXT NOT NULL CHECK (plan_key IN ('trial','monthly','yearly','yearly_pro')),
  price_id TEXT,
  paddle_transaction_id TEXT UNIQUE,
  paddle_subscription_id TEXT UNIQUE,
  customer_email TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  max_devices INTEGER NOT NULL DEFAULT 1 CHECK (max_devices > 0),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','revoked')),
  subscription_status TEXT,
  subscription_event_at TIMESTAMPTZ,
  email_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trame_license_devices (
  id TEXT PRIMARY KEY,
  key_hash TEXT NOT NULL REFERENCES trame_licenses(key_hash),
  device_hash TEXT NOT NULL,
  device_name TEXT NOT NULL DEFAULT '',
  last_ip TEXT,
  activated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deactivated_at TIMESTAMPTZ,
  UNIQUE (key_hash, device_hash)
);

CREATE TABLE IF NOT EXISTS trame_trials (
  device_hash TEXT PRIMARY KEY,
  key_hash TEXT NOT NULL REFERENCES trame_licenses(key_hash),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trame_webhook_events (
  event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
