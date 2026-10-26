import {
  database, json, preflight, checkAdmin, makeLicenseKey, keyHash,
  recordEvent, getRequestMeta, safeError, durationForPlan
} from "../../_npl-db.js";

export function OPTIONS() { return preflight(); }
export async function GET(request) {
  const auth = checkAdmin(request);
  if (!auth.ok) return json({ ok: false, code: "ADMIN_UNAUTHORIZED", message: auth.message }, auth.status);
  try {
    const sql = await database();
    const rows = await sql`SELECT l.id, l.key_hint, l.plan, l.duration_days, l.status, l.customer_email,
        l.max_devices, l.starts_at, l.expires_at, l.created_at, l.updated_at,
        (SELECT COUNT(DISTINCT a.device_hash)::int FROM npl_license_activations a WHERE a.license_id = l.id AND a.deactivated_at IS NULL) AS active_devices
      FROM npl_licenses l ORDER BY l.created_at DESC LIMIT 300`;
    return json({ ok: true, licenses: rows });
  } catch (error) { return safeError(error); }
}
export async function POST(request) {
  const auth = checkAdmin(request);
  if (!auth.ok) return json({ ok: false, code: "ADMIN_UNAUTHORIZED", message: auth.message }, auth.status);
  let body;
  try { body = await request.json(); }
  catch (_) { return json({ ok: false, code: "INVALID_JSON", message: "Request body must be valid JSON." }, 400); }
  try {
    const sql = await database();
    const action = String(body.action || "create");
    const meta = getRequestMeta(request);
    if (action === "revoke") {
      const id = String(body.licenseId || "");
      if (!/^[a-f0-9-]{36}$/i.test(id)) return json({ ok: false, code: "INVALID_LICENSE_ID", message: "Invalid license identifier." }, 400);
      const rows = await sql`UPDATE npl_licenses SET status = 'revoked', updated_at = NOW() WHERE id = ${id} RETURNING id, key_hint, plan, status`;
      if (!rows.length) return json({ ok: false, code: "LICENSE_NOT_FOUND", message: "License was not found." }, 404);
      await recordEvent(sql, "admin_license_revoked", null, id, meta, { keyHint: rows[0].key_hint });
      return json({ ok: true, license: rows[0] });
    }
    const plan = String(body.plan || "");
    const durationDays = durationForPlan(plan);
    if (!durationDays || (plan !== "30day" && plan !== "1year")) {
      return json({ ok: false, code: "INVALID_PLAN", message: "Plan must be 30day or 1year." }, 400);
    }
    const maxDevices = Math.max(1, Math.min(10, Math.floor(Number(body.maxDevices) || 2)));
    const email = String(body.customerEmail || "").trim().slice(0, 320) || null;
    const key = makeLicenseKey(plan);
    const hash = keyHash(key);
    const hint = key.slice(-4);
    const rows = await sql`INSERT INTO npl_licenses (key_hash, key_hint, plan, duration_days, status, customer_email, max_devices)
      VALUES (${hash}, ${hint}, ${plan}, ${durationDays}, 'issued', ${email}, ${maxDevices})
      RETURNING id, key_hint, plan, duration_days, status, customer_email, max_devices, starts_at, expires_at, created_at`;
    await recordEvent(sql, "admin_license_created", null, rows[0].id, meta, { plan, durationDays, maxDevices, customerEmail: email });
    return json({ ok: true, license: rows[0], licenseKey: key, note: "Copy this key now; the full key is never stored or shown again." }, 201);
  } catch (error) { return safeError(error); }
}
