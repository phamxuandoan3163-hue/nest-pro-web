import { randomUUID } from "node:crypto";
import { db } from "../../../../lib/db";
import { groupsFor, hashDevice, hashKey, makeOfflineToken } from "../../../../lib/trame";
import { clientIp, json, options } from "../../../../lib/trame-http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Issues a signed offline activation code for a key + device. The device is bound and
// counted the same way as online activation, so one key still unlocks only one computer.
// The code is valid until the license expiry, so recurring plans must re-activate each period.
export async function POST(request) {
  const body = await request.json().catch(() => null);
  const key = String(body?.license_key || "").trim().toUpperCase();
  const deviceId = String(body?.device_id || "").trim();
  const deviceName = String(body?.device_name || "").trim().slice(0, 160);
  if (!key || key.length > 64 || !deviceId || deviceId.length > 200) {
    return json(request, { ok: false, error: "invalid_request" }, { status: 400 });
  }

  const sql = db();
  const keyHash = hashKey(key);
  const deviceHash = hashDevice(deviceId);
  const result = await sql.begin(async (tx) => {
    const rows = await tx`SELECT * FROM trame_licenses WHERE key_hash=${keyHash} FOR UPDATE`;
    const license = rows[0];
    if (!license || license.status !== "active" || new Date(license.expires_at).getTime() <= Date.now()) {
      return { error: "license_invalid_or_expired" };
    }
    const existing = await tx`
      SELECT id, deactivated_at FROM trame_license_devices WHERE key_hash=${keyHash} AND device_hash=${deviceHash} LIMIT 1
    `;
    if (!existing[0] || existing[0].deactivated_at) {
      const count = await tx`SELECT COUNT(*)::int AS n FROM trame_license_devices WHERE key_hash=${keyHash} AND deactivated_at IS NULL`;
      if (Number(count[0].n) >= Number(license.max_devices)) return { error: "activation_limit_reached" };
      if (existing[0]) {
        await tx`UPDATE trame_license_devices SET deactivated_at=NULL, activated_at=NOW(), last_seen_at=NOW(), device_name=${deviceName}, last_ip=${clientIp(request)} WHERE id=${existing[0].id}`;
      } else {
        await tx`INSERT INTO trame_license_devices(id,key_hash,device_hash,device_name,last_ip) VALUES (${randomUUID()},${keyHash},${deviceHash},${deviceName},${clientIp(request)})`;
      }
    }
    return { license };
  });

  if (result.error) return json(request, { ok: false, error: result.error }, { status: 409 });

  const license = result.license;
  const payload = {
    v: 1,
    mode: "offline",
    plan: license.plan_key,
    groups: groupsFor(license.plan_key),
    device_hash: deviceHash,
    expires_at: license.expires_at,
    issued_at: new Date().toISOString()
  };
  return json(request, { ok: true, code: makeOfflineToken(payload), expires_at: license.expires_at, plan: license.plan_key });
}
export function OPTIONS(request) { return options(request); }
