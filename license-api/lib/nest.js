import { createCipheriv, createDecipheriv, createHash, createPrivateKey, createPublicKey, randomBytes, sign } from "node:crypto";

import { db } from "./db";

// Nova Nesting AI · Marker Making & Nesting (Illustrator panel com.novanest.panel).
// Fully separate from NOVA Trame: own tables (nest_*), own signing key (NEST_SIGNING_PRIVATE_KEY),
// own encryption key, own key prefix (NEST-), own device-hash salt and own routes (/api/nest/*).
export const NEST_PRODUCT = "Nova Nesting AI - Marker Making & Nesting";

// Where "Buy / Renew" points. Set NEST_BUY_URL in Vercel to change it without a code change;
// the panel uses the renew_url returned by the API.
export const NEST_RENEW_URL = String(process.env.NEST_BUY_URL || "https://ainovanesting.pro/").trim();
export const NEST_TRIAL_MS = 7 * 24 * 60 * 60 * 1000;

// Plans. All plans unlock every feature; they differ in length and number of computers.
const PLAN_DEFS = {
  monthly: { key: "monthly", days: 30, recurring: true, label: "Monthly", devices: 1 },
  yearly: { key: "yearly", days: 365, recurring: true, label: "Yearly", devices: 1 },
  yearly_pro: { key: "yearly_pro", days: 365, recurring: true, label: "Yearly Pro", devices: 2 }
};

// Paddle price ids come from the NEST_PADDLE_PRICES env var, so they can be set or changed in
// Vercel without a code change. Format: "pri_xxx:monthly,pri_yyy:yearly,pri_zzz:yearly_pro"
// (live and sandbox ids can both be listed).
function priceMap() {
  const map = {};
  for (const part of String(process.env.NEST_PADDLE_PRICES || "").split(",")) {
    const [id, plan] = part.split(":").map((v) => String(v || "").trim());
    if (id && PLAN_DEFS[plan]) map[id] = PLAN_DEFS[plan];
  }
  return map;
}

export function planForPrice(priceId) {
  return priceMap()[String(priceId || "")] || null;
}

export function devicesFor(planKey) {
  return (PLAN_DEFS[planKey] && PLAN_DEFS[planKey].devices) || 1;
}

// Feature groups. NovaNest has one feature set; every valid plan (trial included) unlocks it.
export function groupsFor(planKey) {
  return planKey === "trial" || PLAN_DEFS[planKey] ? ["all"] : [];
}

// Creates the nest_* tables on first use (one round trip per server start), so no manual SQL
// step is needed. The same statements are in sql/nest-schema.sql.
const SCHEMA = `
CREATE TABLE IF NOT EXISTS nest_licenses (
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
CREATE TABLE IF NOT EXISTS nest_license_devices (
  id TEXT PRIMARY KEY,
  key_hash TEXT NOT NULL REFERENCES nest_licenses(key_hash),
  device_hash TEXT NOT NULL,
  device_name TEXT NOT NULL DEFAULT '',
  last_ip TEXT,
  activated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deactivated_at TIMESTAMPTZ,
  UNIQUE (key_hash, device_hash)
);
CREATE TABLE IF NOT EXISTS nest_trials (
  device_hash TEXT PRIMARY KEY,
  key_hash TEXT NOT NULL REFERENCES nest_licenses(key_hash),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS nest_webhook_events (
  event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);`;

let schemaReady = null;
export async function nestDb() {
  const sql = db();
  if (!schemaReady) schemaReady = sql.unsafe(SCHEMA).catch((e) => { schemaReady = null; throw e; });
  await schemaReady;
  return sql;
}

export function makeNestKey() {
  const raw = randomBytes(20).toString("hex").toUpperCase();
  return "NEST-" + raw.match(/.{1,5}/g).join("-");
}

export function hashKey(key) {
  return createHash("sha256").update(String(key).trim().toUpperCase()).digest("hex");
}

// Device IDs are hashed before storage so the database never holds the raw machine identifier.
export function hashDevice(deviceId) {
  return createHash("sha256").update("nest-device:" + String(deviceId).trim()).digest("hex");
}

function encryptionKey() {
  const value = String(process.env.NEST_LICENSE_ENCRYPTION_KEY || "").trim();
  if (!value) throw new Error("NEST_LICENSE_ENCRYPTION_KEY is not set.");
  // A 64-char hex string is used directly; any other non-empty value is hashed
  // to a stable 32-byte key, so the env var does not have to be hex.
  if (/^[a-f0-9]{64}$/i.test(value)) return Buffer.from(value, "hex");
  return createHash("sha256").update(value).digest();
}

export function encryptKey(key) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(key, "utf8"), cipher.final()]);
  return [iv.toString("hex"), cipher.getAuthTag().toString("hex"), encrypted.toString("hex")].join(".");
}

export function decryptKey(value) {
  const [ivHex, tagHex, dataHex] = String(value || "").split(".");
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  return Buffer.concat([decipher.update(Buffer.from(dataHex, "hex")), decipher.final()]).toString("utf8");
}

// The response carries an Ed25519 signature. The plugin holds only the public key,
// so it can check that a cached entitlement was issued by the server and has not been edited.
export function signEntitlement(payload) {
  const pem = String(process.env.NEST_SIGNING_PRIVATE_KEY || "").replace(/\\n/g, "\n");
  if (!pem.includes("PRIVATE KEY")) throw new Error("NEST_SIGNING_PRIVATE_KEY is not configured.");
  const body = Buffer.from(JSON.stringify(payload), "utf8");
  return sign(null, body, createPrivateKey(pem)).toString("base64");
}

// Raw 32-byte Ed25519 public key (base64) that the plugin embeds to verify offline codes.
export function publicKeyB64() {
  const pem = String(process.env.NEST_SIGNING_PRIVATE_KEY || "").replace(/\\n/g, "\n");
  if (!pem.includes("PRIVATE KEY")) throw new Error("NEST_SIGNING_PRIVATE_KEY is not configured.");
  const der = createPublicKey(createPrivateKey(pem)).export({ type: "spki", format: "der" });
  return der.slice(der.length - 32).toString("base64");
}

// Offline activation code: base64(payloadJSON) + "." + base64(signature over those exact bytes).
// The panel decodes the first part to raw bytes, verifies the signature over them, then parses JSON.
export function makeOfflineToken(payload) {
  const pem = String(process.env.NEST_SIGNING_PRIVATE_KEY || "").replace(/\\n/g, "\n");
  if (!pem.includes("PRIVATE KEY")) throw new Error("NEST_SIGNING_PRIVATE_KEY is not configured.");
  const body = Buffer.from(JSON.stringify(payload), "utf8");
  const signature = sign(null, body, createPrivateKey(pem));
  return body.toString("base64") + "." + signature.toString("base64");
}

// Grace token for offline use (panel 1.3.2+): same signed format as an offline code, marked
// typ "grace". The panel allows offline use for 24 hours after issued_at, and refuses to accept
// a grace token as an offline activation code (or an offline code as a grace token).
export function makeGraceToken(payload) {
  return makeOfflineToken({ ...payload, typ: "grace" });
}

export async function deliverNestLicense(email, key, plan, reference) {
  if (!process.env.RESEND_API_KEY || !process.env.LICENSE_EMAIL_FROM) throw new Error("RESEND_API_KEY and LICENSE_EMAIL_FROM are required.");
  const devices = plan.devices || 1;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + process.env.RESEND_API_KEY,
      "Content-Type": "application/json",
      "Idempotency-Key": "nest-license-" + reference
    },
    body: JSON.stringify({
      from: process.env.LICENSE_EMAIL_FROM,
      to: [email],
      subject: "Your " + NEST_PRODUCT + " license",
      text: [
        "Thank you for purchasing " + NEST_PRODUCT + ".",
        "",
        "Plan: " + plan.label,
        "License key: " + key,
        plan.recurring ? "Billing: " + (plan.days === 30 ? "monthly" : "yearly") + ". Access renews while the subscription is active." : "Valid for: " + plan.days + " days",
        "Computers: " + devices,
        "",
        "Open the Nova Nesting panel in Adobe Illustrator (Window > Extensions) and enter this key to activate your computer.",
        "Order reference: " + reference
      ].join("\n")
    })
  });
  if (!response.ok) throw new Error("Nova Nesting license email failed with HTTP " + response.status + ".");
}
