import { database, json, preflight, checkAdmin, safeError } from "../../_npl-db.js";

export function OPTIONS() { return preflight(); }
export async function GET(request) {
  const auth = checkAdmin(request);
  if (!auth.ok) return json({ ok: false, code: "ADMIN_UNAUTHORIZED", message: auth.message }, auth.status);
  try {
    const sql = await database();
    const rows = await sql`SELECT id, event_type, device_hash, license_id, occurred_at,
        ip::text AS ip, city, region, country, user_agent, details
      FROM npl_license_events ORDER BY occurred_at DESC LIMIT 300`;
    return json({ ok: true, events: rows });
  } catch (error) { return safeError(error); }
}
