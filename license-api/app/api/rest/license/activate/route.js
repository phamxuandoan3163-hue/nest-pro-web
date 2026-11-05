import { randomUUID } from "node:crypto";
import { db, ensureLicenseSchema } from "../../../../../lib/db";
import { hashLicenseKey } from "../../../../../lib/license";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  const form = new URLSearchParams(await request.text());
  const key = String(form.get("license_key") || "").trim();
  const instanceName = String(form.get("instance_name") || "").trim().slice(0, 160);
  const marker = " - ";
  const splitAt = instanceName.lastIndexOf(marker);
  const deviceId = splitAt >= 0 ? instanceName.slice(splitAt + marker.length).trim() : "";
  const deviceName = splitAt >= 0 ? instanceName.slice(0, splitAt).trim() : instanceName;
  if (!key || key.length > 512 || !deviceId || deviceId.length > 100) {
    return Response.json({ error: "invalid_request", message: "A license key and stable device identifier are required." }, { status: 400 });
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
    return Response.json({ activated: false, error: "license_invalid_or_expired" }, { status: 200, headers: { "Cache-Control": "no-store" } });
  }

  const current = await sql`
    SELECT id,device_id,device_name FROM nova_license_devices
    WHERE key_hash = ${license.key_hash} AND device_id = ${deviceId} AND deactivated_at IS NULL LIMIT 1
  `;
  let device = current[0];
  if (!device) {
    const used = Number(license.activation_usage || 0);
    if (used >= Number(license.max_activations)) {
      return Response.json({ activated: false, error: "activation_limit_reached" }, { status: 200, headers: { "Cache-Control": "no-store" } });
    }
    device = { id: randomUUID(), device_id: deviceId, device_name: deviceName || "Nova Nesting device" };
    await sql`
      INSERT INTO nova_license_devices(id,key_hash,device_id,device_name)
      VALUES (${device.id},${license.key_hash},${deviceId},${device.device_name})
    `;
  }
  const count = await sql`SELECT COUNT(*)::int AS n FROM nova_license_devices WHERE key_hash=${license.key_hash} AND deactivated_at IS NULL`;
  return Response.json({
    activated: true,
    license_key: { status: "active", activation_limit: license.max_activations, activation_usage: Number(count[0]?.n || 0), expires_at: license.expires_at },
    instance: { id: device.id, name: device.device_name },
    meta: { store_id: "500658", product_id: "1449378", variant_id: license.variant_id }
  }, { headers: { "Cache-Control": "no-store" } });
}
