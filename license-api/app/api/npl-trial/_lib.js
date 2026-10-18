export const TRIAL_MS = 7 * 24 * 60 * 60 * 1000;

export function responseHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
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
export function parseTrialTimes(body, now) {
  const hasStart = Object.prototype.hasOwnProperty.call(body || {}, "legacyStartAt");
  const hasExpiry = Object.prototype.hasOwnProperty.call(body || {}, "legacyExpiresAt");
  if (!hasStart && !hasExpiry) return null;
  if (!hasStart || !hasExpiry) {
    const error = new Error("Both trial start and expiry timestamps are required.");
    error.code = "INVALID_TRIAL_TIMES";
    throw error;
  }
  const startAt = Number(body.legacyStartAt);
  const expiresAt = Number(body.legacyExpiresAt);
  if (!Number.isSafeInteger(startAt) || !Number.isSafeInteger(expiresAt) ||
      expiresAt - startAt !== TRIAL_MS || startAt > now + 300000 ||
      expiresAt > now + TRIAL_MS + 300000) {
    const error = new Error("The local trial record has invalid timestamps and cannot be approved.");
    error.code = "INVALID_TRIAL_TIMES";
    throw error;
  }
  return {
    version: 1,
    id: "NPL-ONLINE-TRIAL-" + String(startAt).slice(-8),
    deviceId: "",
    startAt,
    expiresAt,
    source: "local-device-record"
  };
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
    trialRecordId: String(record.id || "NPL-7D-" + String(startAt).slice(-8)).toUpperCase(),
    verification: "online-clock",
    persistence: "local-device-record",
    message: expired ? "The seven-day trial has expired." : "Online time verification passed."
  };
}
export function errorResponse(error) {
  const invalid = error && error.code === "INVALID_TRIAL_TIMES";
  return json({
    ok: false,
    code: (error && error.code) || "LICENSE_SERVER_ERROR",
    message: String(error && error.message ? error.message : error || "Unknown server error")
  }, invalid ? 400 : 500);
}
