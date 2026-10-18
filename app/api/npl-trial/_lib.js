export const TRIAL_MS = 7 * 24 * 60 * 60 * 1000;
const KEY_PREFIX = "npl:trial:7d:v1:";

export function responseHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Cache-Control": "no-store, max-age=0",
    "Pragma": "no-cache",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
    "Vary": "Origin"
  };
}

export function json(data, status = 200) {
  return Response.json(data, { status, headers: responseHeaders() });
}

export function preflight() {
  return new Response(null, { status: 204, headers: responseHeaders() });
}

export function readDeviceId(value) {
  const deviceId = String(value || "").toLowerCase();
  return /^[a-f0-9]{16}$/.test(deviceId) ? deviceId : null;
}

function redisConfig() {
  const url = String(process.env.UPSTASH_REDIS_REST_URL || "").replace(/\/+$/, "");
  const token = String(process.env.UPSTASH_REDIS_REST_TOKEN || "");
  if (!url || !token || !/^https:\/\//i.test(url)) {
    const error = new Error("Online trial storage is not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in Vercel, then redeploy.");
    error.code = "STORAGE_NOT_CONFIGURED";
    throw error;
  }
  return { url, token };
}

export async function redisCommand(args) {
  const config = redisConfig();
  const response = await fetch(config.url, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + config.token,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(args),
    cache: "no-store"
  });
  let payload;
  try { payload = await response.json(); } catch (_) { payload = null; }
  if (!response.ok || !payload || payload.error) {
    const error = new Error("License storage request failed. Check the Upstash credentials and database status.");
    error.code = "STORAGE_REQUEST_FAILED";
    throw error;
  }
  return payload.result;
}

export function trialKey(deviceId) {
  return KEY_PREFIX + deviceId;
}

export async function readTrial(deviceId) {
  const raw = await redisCommand(["GET", trialKey(deviceId)]);
  if (raw === null || typeof raw === "undefined") return null;
  let record;
  try { record = JSON.parse(String(raw)); } catch (_) {
    const error = new Error("The stored trial record is invalid. Do not start a new trial automatically.");
    error.code = "TRIAL_RECORD_INVALID";
    throw error;
  }
  if (!record || record.version !== 1 || record.deviceId !== deviceId || !Number.isFinite(Number(record.startAt)) || !Number.isFinite(Number(record.expiresAt)) || Number(record.expiresAt) - Number(record.startAt) !== TRIAL_MS) {
    const error = new Error("The stored trial record failed validation. Contact the tool owner.");
    error.code = "TRIAL_RECORD_INVALID";
    throw error;
  }
  return record;
}

export function trialResponse(record, now = Date.now()) {
  const startAt = Number(record.startAt);
  const expiresAt = Number(record.expiresAt);
  const expired = now >= expiresAt;
  return {
    ok: true,
    state: expired ? "EXPIRED" : "ACTIVE",
    trialType: "7-day",
    startAt,
    expiresAt,
    serverTime: now,
    remainingMs: Math.max(0, expiresAt - now),
    trialRecordId: String(record.id || "NPL-7D-" + record.deviceId.slice(0, 8)).toUpperCase(),
    message: expired ? "The online seven-day trial has expired on this device." : "Online trial verified."
  };
}

export function errorResponse(error) {
  const message = String(error && error.message ? error.message : error || "Unknown server error");
  if (error && error.code === "STORAGE_NOT_CONFIGURED") {
    return json({ ok: false, code: error.code, message }, 503);
  }
  if (error && error.code === "TRIAL_RECORD_INVALID") {
    return json({ ok: false, code: error.code, message }, 500);
  }
  return json({ ok: false, code: (error && error.code) || "LICENSE_SERVER_ERROR", message }, 500);
}

export function parseLegacyTimes(body, now) {
  const hasStart = Object.prototype.hasOwnProperty.call(body, "legacyStartAt");
  const hasExpiry = Object.prototype.hasOwnProperty.call(body, "legacyExpiresAt");
  if (!hasStart && !hasExpiry) return null;
  if (!hasStart || !hasExpiry) {
    const error = new Error("Legacy trial migration requires both legacyStartAt and legacyExpiresAt.");
    error.code = "INVALID_LEGACY_TRIAL";
    throw error;
  }
  const startAt = Number(body.legacyStartAt);
  const expiresAt = Number(body.legacyExpiresAt);
  if (!Number.isSafeInteger(startAt) || !Number.isSafeInteger(expiresAt) || expiresAt - startAt !== TRIAL_MS || startAt > now + 300000 || expiresAt > now + TRIAL_MS + 300000) {
    const error = new Error("The existing local trial has invalid dates and cannot be migrated automatically.");
    error.code = "INVALID_LEGACY_TRIAL";
    throw error;
  }
  return { startAt, expiresAt };
}
