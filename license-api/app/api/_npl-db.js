import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { isIP } from "node:net";
import { neon } from "@neondatabase/serverless";

export const TRIAL_MS = 7 * 24 * 60 * 60 * 1000;
export const PLAN_DAYS = Object.freeze({ trial7: 7, "30day": 30, "1year": 365 });
let schemaPromise = null;
let cachedUrl = "";
let cachedSql = null;

export function apiHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Max-Age": "86400",
    "Cache-Control": "no-store, max-age=0",
    "Pragma": "no-cache",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
    "Vary": "Origin"
  };
}
export function json(data, status = 200) {
  return Response.json(data, { status, headers: apiHeaders() });
}
export function preflight() { return new Response(null, { status: 204, headers: apiHeaders() }); }
export function configError(message) {
  const e = new Error(message);
  e.code = "SERVER_CONFIGURATION_REQUIRED";
  return e;
}
export function getSql() {
  const url = String(process.env.DATABASE_URL || "").trim();
  const pepper = String(process.env.NPL_LICENSE_PEPPER || "").trim();
  if (!url) throw configError("License database is not configured. Set DATABASE_URL in Vercel Environment Variables, then redeploy.");
  if (pepper.length < 32) throw configError("NPL_LICENSE_PEPPER must be a random secret of at least 32 characters in Vercel Environment Variables.");
  if (url !== cachedUrl || !cachedSql) {
    cachedUrl = url;
    cachedSql = neon(url, { fetchOptions: { cache: "no-store" } });
    schemaPromise = null;
  }
  return cachedSql;
}
export async function ensureSchema(sql) {
  if (!schemaPromise) {
    schemaPromise = (async () => {
      await sql`CREATE TABLE IF NOT EXISTS npl_devices (
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
      )`;
      await sql`CREATE TABLE IF NOT EXISTS npl_licenses (
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
      )`;
      await sql`CREATE TABLE IF NOT EXISTS npl_license_activations (
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
      )`;
      await sql`CREATE UNIQUE INDEX IF NOT EXISTS npl_active_activation_once ON npl_license_activations (license_id, device_hash) WHERE deactivated_at IS NULL`;
      await sql`CREATE INDEX IF NOT EXISTS npl_activations_device_idx ON npl_license_activations (device_hash, last_seen_at DESC)`;
      await sql`CREATE INDEX IF NOT EXISTS npl_licenses_status_idx ON npl_licenses (status, expires_at DESC)`;
      await sql`CREATE TABLE IF NOT EXISTS npl_license_events (
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
      )`;
      await sql`CREATE INDEX IF NOT EXISTS npl_events_time_idx ON npl_license_events (occurred_at DESC)`;
      await sql`CREATE INDEX IF NOT EXISTS npl_events_device_idx ON npl_license_events (device_hash, occurred_at DESC)`;
      return true;
    })().catch((error) => { schemaPromise = null; throw error; });
  }
  return schemaPromise;
}
export async function database() {
  const sql = getSql();
  await ensureSchema(sql);
  return sql;
}
export function getPepper() {
  const value = String(process.env.NPL_LICENSE_PEPPER || "");
  if (value.length < 32) throw configError("NPL_LICENSE_PEPPER is missing or too short.");
  return value;
}
export function deviceHash(deviceId) {
  return createHmac("sha256", getPepper()).update("Nest-Pro-Device-v1:" + String(deviceId).toLowerCase()).digest("hex");
}
export function keyHash(key) {
  return createHmac("sha256", getPepper()).update("Nest-Pro-License-v1:" + normalizeKey(key)).digest("hex");
}
export function normalizeKey(value) { return String(value || "").toUpperCase().replace(/[^A-Z0-9-]/g, "").trim(); }
export function validDeviceId(value) { return typeof value === "string" && /^[a-f0-9]{16}$/i.test(value); }
export function getRequestMeta(request) {
  const h = request.headers;
  let ip = String(h.get("x-real-ip") || "").trim();
  if (!ip) {
    const forwarded = String(h.get("x-forwarded-for") || "").split(",").map(x => x.trim()).filter(Boolean);
    ip = forwarded.length ? forwarded[0] : "";
  }
  if (!isIP(ip)) ip = null;
  function decodeHeader(name) {
    const raw = String(h.get(name) || "").trim();
    if (!raw) return null;
    try { return decodeURIComponent(raw).slice(0, 160); } catch (_) { return raw.slice(0, 160); }
  }
  return {
    ip,
    city: decodeHeader("x-vercel-ip-city"),
    region: decodeHeader("x-vercel-ip-country-region"),
    country: decodeHeader("x-vercel-ip-country"),
    userAgent: String(h.get("user-agent") || "").slice(0, 500) || null
  };
}
export function readDeviceId(value) {
  const result = String(value || "").toLowerCase();
  return validDeviceId(result) ? result : null;
}
export function timestamp(value) {
  if (value === null || typeof value === "undefined") return null;
  const d = value instanceof Date ? value : new Date(value);
  const n = d.getTime();
  return Number.isFinite(n) ? n : null;
}
export function licensePayload(row, now = Date.now(), extra = {}) {
  const plan = String(row.plan || "trial7");
  const startAt = timestamp(row.trial_started_at || row.starts_at || row.start_at);
  const expiresAt = timestamp(row.trial_expires_at || row.expires_at);
  const serverTime = now;
  if (startAt === null || expiresAt === null || !PLAN_DAYS[plan]) {
    return { ok: false, code: "LICENSE_RECORD_INVALID", message: "The database license record is incomplete. Contact the tool owner." };
  }
  const expectedMs = PLAN_DAYS[plan] * 86400000;
  if (expiresAt - startAt !== expectedMs) {
    return { ok: false, code: "LICENSE_RECORD_INVALID", message: "The database license dates failed validation. Contact the tool owner." };
  }
  const expired = serverTime >= expiresAt;
  return {
    ok: true,
    databaseBacked: true,
    state: expired ? "EXPIRED" : "ACTIVE",
    plan,
    startAt,
    expiresAt,
    serverTime,
    remainingMs: Math.max(0, expiresAt - serverTime),
    licenseId: row.license_id || row.id || null,
    message: expired ? "The license period has expired." : "Online license verified.",
    ...extra
  };
}
export async function recordEvent(sql, type, device, licenseId, meta, details = {}) {
  await sql`INSERT INTO npl_license_events (event_type, device_hash, license_id, ip, city, region, country, user_agent, details)
    VALUES (${type}, ${device || null}, ${licenseId || null}, ${meta && meta.ip ? meta.ip : null}::inet,
      ${meta && meta.city || null}, ${meta && meta.region || null}, ${meta && meta.country || null},
      ${meta && meta.userAgent || null}, ${JSON.stringify(details)}::jsonb)`;
}
export async function upsertDevice(sql, deviceId, hash, meta, consent = true) {
  const rows = await sql`INSERT INTO npl_devices (
      device_hash, device_id_hint, first_seen_at, last_seen_at, privacy_consent_at,
      first_ip, last_ip, first_city, first_region, first_country, last_city, last_region, last_country,
      first_user_agent, last_user_agent
    ) VALUES (
      ${hash}, ${String(deviceId).slice(-4)}, NOW(), NOW(), ${consent ? new Date().toISOString() : null}::timestamptz,
      ${meta.ip}::inet, ${meta.ip}::inet, ${meta.city}, ${meta.region}, ${meta.country},
      ${meta.city}, ${meta.region}, ${meta.country}, ${meta.userAgent}, ${meta.userAgent}
    ) ON CONFLICT (device_hash) DO UPDATE SET
      device_id_hint = EXCLUDED.device_id_hint,
      last_seen_at = NOW(), updated_at = NOW(),
      privacy_consent_at = COALESCE(npl_devices.privacy_consent_at, EXCLUDED.privacy_consent_at),
      last_ip = CASE WHEN npl_devices.privacy_consent_at IS NOT NULL OR EXCLUDED.privacy_consent_at IS NOT NULL THEN EXCLUDED.last_ip ELSE npl_devices.last_ip END,
      last_city = CASE WHEN npl_devices.privacy_consent_at IS NOT NULL OR EXCLUDED.privacy_consent_at IS NOT NULL THEN EXCLUDED.last_city ELSE npl_devices.last_city END,
      last_region = CASE WHEN npl_devices.privacy_consent_at IS NOT NULL OR EXCLUDED.privacy_consent_at IS NOT NULL THEN EXCLUDED.last_region ELSE npl_devices.last_region END,
      last_country = CASE WHEN npl_devices.privacy_consent_at IS NOT NULL OR EXCLUDED.privacy_consent_at IS NOT NULL THEN EXCLUDED.last_country ELSE npl_devices.last_country END,
      last_user_agent = CASE WHEN npl_devices.privacy_consent_at IS NOT NULL OR EXCLUDED.privacy_consent_at IS NOT NULL THEN EXCLUDED.last_user_agent ELSE npl_devices.last_user_agent END
    RETURNING *`;
  return rows[0];
}
export function durationForPlan(plan) { return PLAN_DAYS[String(plan)] || 0; }
export function checkAdmin(request) {
  const expected = String(process.env.NPL_ADMIN_TOKEN || "");
  if (expected.length < 32) return { ok: false, status: 503, message: "Admin access is not configured. Set NPL_ADMIN_TOKEN in Vercel Environment Variables." };
  const auth = String(request.headers.get("authorization") || "");
  const supplied = auth.indexOf("Bearer ") === 0 ? auth.slice(7) : "";
  const a = Buffer.from(expected, "utf8"), b = Buffer.from(supplied, "utf8");
  const equal = a.length === b.length && a.length > 0 && timingSafeEqual(a, b);
  return equal ? { ok: true } : { ok: false, status: 401, message: "Invalid admin token." };
}
export function makeLicenseKey(plan) {
  const prefix = plan === "30day" ? "NPL-30D" : "NPL-1Y";
  const group = () => randomBytes(2).toString("hex").toUpperCase();
  return prefix + "-" + group() + "-" + group() + "-" + group();
}
export function safeError(error) {
  const code = String(error && error.code || "");
  const message = code === "SERVER_CONFIGURATION_REQUIRED"
    ? String(error.message)
    : "License database request failed. Check DATABASE_URL, database availability, and the schema setup.";
  return json({ ok: false, code: code || "DATABASE_ERROR", message }, code === "SERVER_CONFIGURATION_REQUIRED" ? 503 : 500);
}
