import { db } from "../../../../../lib/db";
import { hashDevice, hashKey } from "../../../../../lib/trame";
import { json, options } from "../../../../../lib/trame-http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const key = String(body?.license_key || "").trim();
  const deviceId = String(body?.device_id || "").trim();
  if (!key || key.length > 64 || !deviceId || deviceId.length > 200) {
    return json(request, { error: "invalid_request" }, { status: 400 });
  }
  const sql = db();
  const result = await sql`
    UPDATE trame_license_devices SET deactivated_at=NOW()
    WHERE key_hash=${hashKey(key)} AND device_hash=${hashDevice(deviceId)} AND deactivated_at IS NULL
    RETURNING id
  `;
  return json(request, { deactivated: result.length > 0 });
}

export function OPTIONS(request) { return options(request); }
