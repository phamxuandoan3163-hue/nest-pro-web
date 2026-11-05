import { db, ensureLicenseSchema } from "../../../../../lib/db";
import { hashLicenseKey } from "../../../../../lib/license";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  const form = new URLSearchParams(await request.text());
  const key = String(form.get("license_key") || "").trim();
  const instanceId = String(form.get("instance_id") || "").trim();
  if (!key || key.length > 512 || instanceId.length > 256) {
    return Response.json({ error: "invalid_request" }, { status: 400 });
  }

  const sql = db();
  await ensureLicenseSchema(sql);
  const rows = await sql`
    SELECT l.*, COUNT(d.id) FILTER (WHERE d.deactivated_at IS NULL)::int AS activation_usage
    FROM nova_licenses l
    LEFT JOIN nova_license_devices d ON d.key_hash = l.key_hash
    WHERE l.key_hash = ${hashLicenseKey(key)}
    GROUP BY l.key_hash LIMIT 1
  `;
  const license = rows[0];
  if (!license || license.status !== "active" || new Date(license.expires_at).getTime() <= Date.now()) {
    return Response.json({ valid: false, error: "license_invalid_or_expired" }, { headers: { "Cache-Control": "no-store" } });
  }

  let device = null;
  if (instanceId) {
    const found = await sql`
      SELECT id,device_name FROM nova_license_devices
      WHERE id = ${instanceId} AND key_hash = ${license.key_hash} AND deactivated_at IS NULL LIMIT 1
    `;
    device = found[0] || null;
    if (!device) return Response.json({ valid: false, error: "device_not_activated" }, { headers: { "Cache-Control": "no-store" } });
    await sql`UPDATE nova_license_devices SET last_seen_at=NOW() WHERE id=${device.id}`;
  }

  return Response.json({
    valid: true,
    license_key: { status: "active", activation_limit: license.max_activations, activation_usage: Number(license.activation_usage || 0), expires_at: license.expires_at },
    instance: device ? { id: device.id, name: device.device_name } : null,
    meta: { store_id: "500658", product_id: "1449378", variant_id: license.variant_id }
  }, { headers: { "Cache-Control": "no-store" } });
}
