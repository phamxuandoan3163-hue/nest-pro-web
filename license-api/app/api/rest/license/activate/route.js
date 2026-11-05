import { randomUUID } from "node:crypto";
import { db, ensureLicenseSchema } from "../../../../../lib/db";
import { hashLicenseKey } from "../../../../../lib/license";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  const form = new URLSearchParams(await request.text());
  const key = String(form.get("license_key") || "").trim();
  const instanceName = String(form.get("instance_name") || "").trim().slice(0, 160);
  const splitAt = instanceName.lastIndexOf(" - ");
  const deviceId = splitAt >= 0 ? instanceName.slice(splitAt + 3).trim() : "";
  const deviceName = splitAt >= 0 ? instanceName.slice(0, splitAt).trim() : instanceName;
  if (!key || key.length > 512 || !deviceId || deviceId.length > 100) {
    return Response.json({ error: "invalid_request", message: "A license key and stable device identifier are required." }, { status: 400 });
  }

  const sql = db();
  await ensureLicenseSchema(sql);
  const result = await sql.begin(async (tx) => {
    const rows = await tx`SELECT * FROM nova_licenses WHERE key_hash=${hashLicenseKey(key)} FOR UPDATE`;
    const license = rows[0];
    if (!license || license.status !== "active" || new Date(license.expires_at).getTime() <= Date.now()) return { error: "license_invalid_or_expired" };
    const existing = await tx`
      SELECT id,device_name,deactivated_at FROM nova_license_devices
      WHERE key_hash=${license.key_hash} AND device_id=${deviceId} LIMIT 1
    `;
    if (existing[0] && !existing[0].deactivated_at) {
      await tx`UPDATE nova_license_devices SET last_seen_at=NOW() WHERE id=${existing[0].id}`;
      return { license, device: existing[0] };
    }
    const count = await tx`SELECT COUNT(*)::int AS n FROM nova_license_devices WHERE key_hash=${license.key_hash} AND deactivated_at IS NULL`;
    if (Number(count[0]?.n || 0) >= Number(license.max_activations)) return { error: "activation_limit_reached" };
    let device;
    if (existing[0]) {
      const updated = await tx`
        UPDATE nova_license_devices SET device_name=${deviceName || "Nova Nesting device"}, activated_at=NOW(), last_seen_at=NOW(), deactivated_at=NULL
        WHERE id=${existing[0].id} RETURNING id,device_name
      `;
      device = updated[0];
    } else {
      const inserted = await tx`
        INSERT INTO nova_license_devices(id,key_hash,device_id,device_name)
        VALUES (${randomUUID()},${license.key_hash},${deviceId},${deviceName || "Nova Nesting device"})
        RETURNING id,device_name
      `;
      device = inserted[0];
    }
    return { license, device };
  });

  if (result.error) return Response.json({ activated: false, error: result.error }, { headers: { "Cache-Control": "no-store" } });
  const count = await sql`SELECT COUNT(*)::int AS n FROM nova_license_devices WHERE key_hash=${result.license.key_hash} AND deactivated_at IS NULL`;
  return Response.json({
    activated: true,
    license_key: { status: "active", activation_limit: result.license.max_activations, activation_usage: Number(count[0]?.n || 0), expires_at: result.license.expires_at },
    instance: { id: result.device.id, name: result.device.device_name },
    meta: { store_id: "500658", product_id: "1449378", variant_id: result.license.variant_id }
  }, { headers: { "Cache-Control": "no-store" } });
}
