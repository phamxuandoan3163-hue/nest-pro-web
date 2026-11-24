import { db } from "../../../../../lib/db";
import { groupsFor, hashDevice, hashKey, makeGraceToken, signEntitlement, TRAME_RENEW_URL } from "../../../../../lib/trame";
import { clientIp, json, options } from "../../../../../lib/trame-http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Token lifetime: the plugin must check in at least once a day to keep working.
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const key = String(body?.license_key || "").trim();
  const deviceId = String(body?.device_id || "").trim();
  if (!key || key.length > 64 || !deviceId || deviceId.length > 200) {
    return json(request, { ok: false, state: "INVALID_REQUEST" }, { status: 400 });
  }

  const sql = db();
  const keyHash = hashKey(key);
  const rows = await sql`SELECT * FROM trame_licenses WHERE key_hash=${keyHash} LIMIT 1`;
  const license = rows[0];
  if (!license) return json(request, { ok: false, state: "INVALID_KEY" });
  if (license.status !== "active") return json(request, { ok: false, state: "REVOKED" });

  const now = Date.now();
  const expiresAt = new Date(license.expires_at).getTime();
  if (now >= expiresAt) {
    return json(request, { ok: false, state: "EXPIRED", expires_at: license.expires_at, renew_url: TRAME_RENEW_URL });
  }

  const deviceHash = hashDevice(deviceId);
  const found = await sql`
    SELECT id FROM trame_license_devices
    WHERE key_hash=${keyHash} AND device_hash=${deviceHash} AND deactivated_at IS NULL LIMIT 1
  `;
  if (!found[0]) return json(request, { ok: false, state: "DEVICE_NOT_ACTIVATED" });

  await sql`UPDATE trame_license_devices SET last_seen_at=NOW(), last_ip=${clientIp(request)} WHERE id=${found[0].id}`;

  const issuedAt = now;
  const payload = {
    v: 1,
    plan: license.plan_key,
    groups: groupsFor(license.plan_key),
    device_hash: deviceHash,
    expires_at: license.expires_at,
    issued_at: new Date(issuedAt).toISOString(),
    valid_until: new Date(Math.min(issuedAt + TOKEN_TTL_MS, expiresAt)).toISOString()
  };
  return json(request, {
    ok: true,
    state: "ACTIVE",
    entitlement: payload,
    signature: signEntitlement(payload),
    token: makeGraceToken(payload),
    renew_url: TRAME_RENEW_URL
  });
}

export function OPTIONS(request) { return options(request); }
