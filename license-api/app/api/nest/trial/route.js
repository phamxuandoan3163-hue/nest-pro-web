import { randomUUID } from "node:crypto";
import { NEST_RENEW_URL, NEST_TRIAL_MS, encryptKey, groupsFor, hashDevice, hashKey, makeGraceToken, makeNestKey, nestDb, signEntitlement } from "../../../../lib/nest";
import { clientIp, json, options } from "../../../../lib/trame-http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// One 7-day trial per computer, bound to that computer's device id.
export async function POST(request) {
  const body = await request.json().catch(() => null);
  const deviceId = String(body?.device_id || "").trim();
  const deviceName = String(body?.device_name || "").trim().slice(0, 160);
  if (!deviceId || deviceId.length > 200) return json(request, { ok: false, error: "invalid_request" }, { status: 400 });

  const sql = await nestDb();
  const deviceHash = hashDevice(deviceId);
  const key = makeNestKey();
  const keyHash = hashKey(key);
  const expiresAt = new Date(Date.now() + NEST_TRIAL_MS).toISOString();

  const created = await sql.begin(async (tx) => {
    const used = await tx`SELECT device_hash FROM nest_trials WHERE device_hash=${deviceHash} LIMIT 1`;
    if (used[0]) return false;
    await tx`
      INSERT INTO nest_licenses(key_hash,key_cipher,plan_key,expires_at,max_devices,status)
      VALUES (${keyHash},${encryptKey(key)},'trial',${expiresAt}::timestamptz,1,'active')
    `;
    await tx`INSERT INTO nest_trials(device_hash,key_hash) VALUES (${deviceHash},${keyHash})`;
    await tx`
      INSERT INTO nest_license_devices(id,key_hash,device_hash,device_name,last_ip)
      VALUES (${randomUUID()},${keyHash},${deviceHash},${deviceName},${clientIp(request)})
    `;
    return true;
  });
  if (!created) return json(request, { ok: false, error: "trial_already_used", renew_url: NEST_RENEW_URL }, { status: 409 });

  const payload = {
    v: 1,
    plan: "trial",
    groups: groupsFor("trial"),
    device_hash: deviceHash,
    expires_at: expiresAt,
    issued_at: new Date().toISOString(),
    valid_until: new Date(Math.min(Date.now() + 24 * 60 * 60 * 1000, Date.parse(expiresAt))).toISOString()
  };
  return json(request, { ok: true, license_key: key, expires_at: expiresAt, entitlement: payload, signature: signEntitlement(payload), token: makeGraceToken(payload), renew_url: NEST_RENEW_URL });
}

export function OPTIONS(request) { return options(request); }
