import crypto from "node:crypto";

export const DEMO_KEY = "NPL-NEST-26XX-TEST-ABCD";
export const DEMO_LICENSE_ID = "NPL-DEMO-TRIAL";
export const DEMO_EXPIRES_AT = "2026-12-31T23:59:59.000Z";
// TEST ONLY. This deterministic secret deliberately supports preview testing only.
// Replace the entire demo implementation with the database-backed Phase 1 service before selling licenses.
const DEMO_SECRET = "nest-pro-laser-preview-demo-only-2026-change-before-production";

export function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "no-store, max-age=0",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer"
  };
}
export function json(data, status=200) {
  return Response.json(data, { status, headers: corsHeaders() });
}
export function preflight() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}
export function parseBody(request) {
  // Request.json() is handled by each route so malformed JSON can be reported cleanly.
}
export function validDeviceId(value) {
  return typeof value === "string" && /^[a-f0-9]{32}$/i.test(value);
}
export function makeDeviceToken(deviceId) {
  return crypto.createHmac("sha256", DEMO_SECRET)
    .update([DEMO_LICENSE_ID, String(deviceId), DEMO_EXPIRES_AT].join("|"))
    .digest("hex");
}
export function secureEqual(a, b) {
  const aa = Buffer.from(String(a || ""), "utf8");
  const bb = Buffer.from(String(b || ""), "utf8");
  return aa.length === bb.length && aa.length > 0 && crypto.timingSafeEqual(aa, bb);
}
export function licenseDetails() {
  const exp = new Date(DEMO_EXPIRES_AT);
  return {
    ok: true,
    valid: true,
    demo: true,
    licenseId: DEMO_LICENSE_ID,
    expiresAt: DEMO_EXPIRES_AT,
    offlineUntil: DEMO_EXPIRES_AT,
    serverTime: new Date().toISOString(),
    maxDevices: 2,
    activeDevices: 1,
    licenseStatus: exp.getTime() > Date.now() ? "active" : "expired"
  };
}
export function requireUnexpired() {
  return new Date(DEMO_EXPIRES_AT).getTime() > Date.now();
}
