import postgres from "postgres";

let sqlClient;

export function db() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured.");
  if (!sqlClient) sqlClient = postgres(process.env.DATABASE_URL, { max: 1, idle_timeout: 20, connect_timeout: 10 });
  return sqlClient;
}

export async function ensureLicenseSchema(sql) {
  await sql`
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
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS nova_license_devices (
      id TEXT PRIMARY KEY,
      key_hash TEXT NOT NULL REFERENCES nova_licenses(key_hash),
      device_id TEXT NOT NULL,
      device_name TEXT NOT NULL,
      activated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      deactivated_at TIMESTAMPTZ,
      UNIQUE (key_hash, device_id)
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS paddle_webhook_events (
      event_id TEXT PRIMARY KEY,
      event_type TEXT NOT NULL,
      received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}
