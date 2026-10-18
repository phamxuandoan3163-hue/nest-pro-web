import { database, json, preflight, checkAdmin, getRequestMeta, recordEvent, safeError } from "../../_npl-db.js";

export function OPTIONS() { return preflight(); }
export async function GET(request) {
  const auth = checkAdmin(request);
  if (!auth.ok) return json({ ok: false, code: "ADMIN_UNAUTHORIZED", message: auth.message }, auth.status);
  try {
    const sql = await database();
    const rows = await sql`SELECT d.device_hash, d.device_id_hint, d.first_seen_at, d.last_seen_at,
        d.trial_started_at, d.trial_expires_at, d.privacy_consent_at,
        d.first_ip::text AS first_ip, d.last_ip::text AS last_ip,
        d.first_city, d.first_region, d.first_country, d.last_city, d.last_region, d.last_country,
        d.first_user_agent, d.last_user_agent,
        (SELECT l.id FROM npl_license_activations a JOIN npl_licenses l ON l.id=a.license_id
          WHERE a.device_hash=d.device_hash AND a.deactivated_at IS NULL ORDER BY a.activated_at DESC LIMIT 1) AS active_license_id,
        (SELECT l.plan FROM npl_license_activations a JOIN npl_licenses l ON l.id=a.license_id
          WHERE a.device_hash=d.device_hash AND a.deactivated_at IS NULL ORDER BY a.activated_at DESC LIMIT 1) AS active_license_plan
      FROM npl_devices d ORDER BY d.last_seen_at DESC LIMIT 500`;
    return json({ ok: true, devices: rows });
  } catch (error) { return safeError(error); }
}
export async function POST(request) {
  const auth = checkAdmin(request);
  if (!auth.ok) return json({ ok: false, code: "ADMIN_UNAUTHORIZED", message: auth.message }, auth.status);
  let body;
  try { body = await request.json(); } catch (_) { return json({ ok: false, message: "Request body must be valid JSON." }, 400); }
  if (String(body.action || "") !== "deactivate_device") return json({ ok: false, code: "UNKNOWN_ACTION", message: "Unsupported device action." }, 400);
  const deviceHash = String(body.deviceHash || "");
  const licenseId = String(body.licenseId || "");
  if (!/^[a-f0-9]{64}$/i.test(deviceHash) || !/^[a-f0-9-]{36}$/i.test(licenseId)) return json({ ok: false, code: "INVALID_DEVICE_OR_LICENSE", message: "Device or license identifier is invalid." }, 400);
  try {
    const sql = await database();
    const rows = await sql`UPDATE npl_license_activations SET deactivated_at = NOW(), last_seen_at = NOW()
      WHERE device_hash = ${deviceHash} AND license_id = ${licenseId} AND deactivated_at IS NULL RETURNING id`;
    if (!rows.length) return json({ ok: false, code: "ACTIVATION_NOT_FOUND", message: "No matching active device activation was found." }, 404);
    await recordEvent(sql, "admin_device_deactivated", deviceHash, licenseId, getRequestMeta(request), { source: "admin-dashboard" });
    return json({ ok: true, deactivated: true });
  } catch (error) { return safeError(error); }
}
