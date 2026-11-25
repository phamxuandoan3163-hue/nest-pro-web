import { randomUUID } from "node:crypto";
import { hashDevice, hashKey, nestDb } from "../../../../../lib/nest";
import { clientIp, json, options } from "../../../../../lib/trame-http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const key = String(body?.license_key || "").trim();
  const deviceId = String(body?.device_id || "").trim();
  const deviceName = String(body?.device_name || "").trim().slice(0, 160);
  if (!key || key.length > 64 || !deviceId || deviceId.length > 200) {
    return json(request, { activated: false, error: "invalid_request" }, { status: 400 });
  }

  const sql = await nestDb();
  const keyHash = hashKey(key);
  const deviceHash = hashDevice(deviceId);
  const result = await sql.begin(async (tx) => {
    const rows = await tx`SELECT * FROM nest_licenses WHERE key_hash=${keyHash} FOR UPDATE`;
    const license = rows[0];
    if (!license || license.status !== "active" || new Date(license.expires_at).getTime() <= Date.now()) {
      return { error: "license_invalid_or_expired" };
    }
    const existing = await tx`
      SELECT id, deactivated_at FROM nest_license_devices WHERE key_hash=${keyHash} AND device_hash=${deviceHash} LIMIT 1
    `;
    if (existing[0] && !existing[0].deactivated_at) {
      await tx`UPDATE nest_license_devices SET last_seen_at=NOW() WHERE id=${existing[0].id}`;
      return { license };
    }
    const count = await tx`
      SELECT COUNT(*)::int AS n FROM nest_license_devices WHERE key_hash=${keyHash} AND deactivated_at IS NULL
    `;
    if (Number(count[0].n) >= Number(license.max_devices)) return { error: "activation_limit_reached" };
    if (existing[0]) {
      await tx`UPDATE nest_license_devices SET deactivated_at=NULL, activated_at=NOW(), last_seen_at=NOW(), device_name=${deviceName} WHERE id=${existing[0].id}`;
    } else {
      await tx`
        INSERT INTO nest_license_devices(id,key_hash,device_hash,device_name,last_ip)
        VALUES (${randomUUID()},${keyHash},${deviceHash},${deviceName},${clientIp(request)})
      `;
    }
    return { license };
  });

  if (result.error) return json(request, { activated: false, error: result.error }, { status: 409 });
  return json(request, { activated: true, plan: result.license.plan_key, expires_at: result.license.expires_at });
}

export function OPTIONS(request) { return options(request); }
