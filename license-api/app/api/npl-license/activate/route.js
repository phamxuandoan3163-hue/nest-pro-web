import {
  database, json, preflight, readDeviceId, deviceHash, keyHash, normalizeKey,
  getRequestMeta, upsertDevice, recordEvent, licensePayload, durationForPlan, safeError
} from "../../_npl-db.js";

export function OPTIONS() { return preflight(); }
export async function POST(request) {
  let body;
  try { body = await request.json(); }
  catch (_) { return json({ ok: false, code: "INVALID_JSON", message: "Request body must be valid JSON." }, 400); }
  const deviceId = readDeviceId(body && body.deviceId);
  const key = normalizeKey(body && body.licenseKey);
  if (!deviceId) return json({ ok: false, code: "INVALID_DEVICE_ID", message: "The device identifier is invalid." }, 400);
  if (!/^NPL-(30D|1Y)-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}$/.test(key)) {
    return json({ ok: false, code: "INVALID_LICENSE_KEY", message: "The license key format is invalid." }, 400);
  }
  try {
    const sql = await database();
    const hash = deviceHash(deviceId);
    const meta = getRequestMeta(request);
    const deviceRows = await sql`SELECT * FROM npl_devices WHERE device_hash = ${hash} LIMIT 1`;
    const device = deviceRows[0] || null;
    if ((!device || !device.privacy_consent_at) && body.privacyConsent !== true) {
      return json({ ok: false, code: "PRIVACY_CONSENT_REQUIRED", message: "Accept the privacy notice before activating this device. Nest-Pro records your device fingerprint, IP address, and approximate IP-based location for license administration." }, 403);
    }
    const hashedKey = keyHash(key);
    const licenseRows = await sql`SELECT * FROM npl_licenses WHERE key_hash = ${hashedKey} LIMIT 1`;
    if (!licenseRows.length) {
      if (body.privacyConsent === true) await upsertDevice(sql, deviceId, hash, meta, true);
      return json({ ok: false, code: "LICENSE_KEY_NOT_FOUND", message: "This license key was not found. Check the key and try again." }, 404);
    }
    let license = licenseRows[0];
    if (license.status === "revoked") return json({ ok: false, code: "LICENSE_REVOKED", message: "This license has been revoked. Contact the tool owner." }, 403);
    if (license.status === "expired" || (license.expires_at && new Date(license.expires_at).getTime() <= Date.now())) {
      return json({ ok: false, code: "LICENSE_EXPIRED", message: "This license key has expired. Purchase a new 30-day or 1-year plan." }, 403);
    }
    if (durationForPlan(license.plan) !== Number(license.duration_days)) {
      return json({ ok: false, code: "LICENSE_RECORD_INVALID", message: "License plan settings are inconsistent. Contact the tool owner." }, 500);
    }
    const licenseId = license.id;
    const activatedRows = await sql`UPDATE npl_licenses SET
        status = 'active',
        starts_at = COALESCE(starts_at, NOW()),
        expires_at = COALESCE(expires_at, NOW() + make_interval(days => duration_days)),
        updated_at = NOW()
      WHERE id = ${licenseId} AND status IN ('issued','active')
      RETURNING *`;
    if (!activatedRows.length) return json({ ok: false, code: "LICENSE_UNAVAILABLE", message: "This license cannot be activated." }, 403);
    license = activatedRows[0];
    if (new Date(license.expires_at).getTime() <= Date.now()) {
      await sql`UPDATE npl_licenses SET status = 'expired', updated_at = NOW() WHERE id = ${licenseId}`;
      return json({ ok: false, code: "LICENSE_EXPIRED", message: "This license has expired. Purchase a new plan." }, 403);
    }
    await upsertDevice(sql, deviceId, hash, meta, true);
    const activationRows = await sql`WITH license_lock AS MATERIALIZED (
        SELECT id, max_devices FROM npl_licenses
        WHERE id = ${licenseId} AND status = 'active' AND expires_at > NOW()
        FOR UPDATE
      ), current_device AS (
        SELECT a.id FROM npl_license_activations a
        WHERE a.license_id = ${licenseId} AND a.device_hash = ${hash} AND a.deactivated_at IS NULL
      ), occupied AS (
        SELECT COUNT(DISTINCT a.device_hash)::int AS n FROM npl_license_activations a
        WHERE a.license_id = ${licenseId} AND a.deactivated_at IS NULL
      )
      INSERT INTO npl_license_activations (
        license_id, device_hash, activated_at, last_seen_at,
        first_ip, last_ip, first_city, first_region, first_country,
        last_city, last_region, last_country, first_user_agent, last_user_agent
      ) SELECT ${licenseId}, ${hash}, NOW(), NOW(), ${meta.ip}::inet, ${meta.ip}::inet,
        ${meta.city}, ${meta.region}, ${meta.country}, ${meta.city}, ${meta.region}, ${meta.country},
        ${meta.userAgent}, ${meta.userAgent}
      FROM license_lock
      WHERE EXISTS (SELECT 1 FROM current_device)
         OR (SELECT n FROM occupied) < license_lock.max_devices
      ON CONFLICT (license_id, device_hash) WHERE deactivated_at IS NULL DO UPDATE SET
        last_seen_at = NOW(), last_ip = EXCLUDED.last_ip, last_city = EXCLUDED.last_city,
        last_region = EXCLUDED.last_region, last_country = EXCLUDED.last_country,
        last_user_agent = EXCLUDED.last_user_agent
      RETURNING id`;
    if (!activationRows.length) {
      return json({ ok: false, code: "DEVICE_LIMIT_REACHED", message: "This license has reached its active device limit or has expired. Ask the tool owner to reset an old device." }, 409);
    }
    await recordEvent(sql, "paid_license_activated", hash, licenseId, meta, { plan: license.plan, maxDevices: license.max_devices });
    const output = licensePayload({ ...license, license_id: license.id }, Date.now(), {
      maxDevices: Number(license.max_devices || 2),
      licenseStatus: license.status,
      activationVerified: true
    });
    return json(output, output.ok ? 200 : 500);
  } catch (error) {
    return safeError(error);
  }
}
