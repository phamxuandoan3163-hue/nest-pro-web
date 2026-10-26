import {
  database, json, preflight, readDeviceId, deviceHash, getRequestMeta,
  upsertDevice, recordEvent, licensePayload, safeError
} from "../../_npl-db.js";

export function OPTIONS() { return preflight(); }
export async function POST(request) {
  let body;
  try { body = await request.json(); }
  catch (_) { return json({ ok: false, code: "INVALID_JSON", message: "Request body must be valid JSON." }, 400); }
  const deviceId = readDeviceId(body && body.deviceId);
  if (!deviceId) return json({ ok: false, code: "INVALID_DEVICE_ID", message: "The device identifier is invalid. Reopen the Nest-Pro panel and retry." }, 400);
  try {
    const sql = await database();
    await sql`UPDATE npl_licenses SET status = 'expired', updated_at = NOW()
      WHERE status = 'active' AND expires_at IS NOT NULL AND expires_at <= NOW()`;
    const hash = deviceHash(deviceId);
    const existingRows = await sql`SELECT * FROM npl_devices WHERE device_hash = ${hash} LIMIT 1`;
    if (!existingRows.length) {
      return json({ ok: true, databaseBacked: true, state: "NOT_STARTED", trialType: "7-day", serverTime: Date.now(), message: "No trial or paid license has been registered for this device." });
    }
    const existing = existingRows[0];
    const meta = getRequestMeta(request);
    if (existing.privacy_consent_at) {
      const shouldLog = !existing.last_seen_at || (Date.now() - new Date(existing.last_seen_at).getTime()) >= 5 * 60 * 1000;
      await upsertDevice(sql, deviceId, hash, meta, true);
      if (shouldLog) await recordEvent(sql, "license_status_check", hash, null, meta, { consentRecorded: true });
    }
    const licenseRows = await sql`
      SELECT l.id AS license_id, l.plan, l.status AS license_status, l.starts_at, l.expires_at,
             l.max_devices, a.activated_at, a.last_seen_at
      FROM npl_license_activations a
      JOIN npl_licenses l ON l.id = a.license_id
      WHERE a.device_hash = ${hash} AND a.deactivated_at IS NULL
      ORDER BY a.activated_at DESC
      LIMIT 1`;
    if (licenseRows.length) {
      const license = licenseRows[0];
      const result = licensePayload(license, Date.now(), { maxDevices: Number(license.max_devices || 1), licenseStatus: license.license_status });
      if (!result.ok) return json(result, 500);
      if (license.license_status === "revoked") {
        result.state = "EXPIRED";
        result.message = "This license has been revoked. Contact the tool owner or purchase a new plan.";
      } else if (license.license_status === "expired") {
        result.state = "EXPIRED";
        result.message = "This paid license has expired. Choose an upgrade plan to continue.";
      }
      return json(result);
    }
    if (existing.trial_started_at && existing.trial_expires_at) {
      const result = licensePayload({ ...existing, plan: "trial7" }, Date.now(), { licenseStatus: "trial", deviceRegistered: true });
      return json(result, result.ok ? 200 : 500);
    }
    const oldLicense = await sql`SELECT l.id, l.plan, l.status, l.starts_at, l.expires_at
      FROM npl_license_activations a JOIN npl_licenses l ON l.id = a.license_id
      WHERE a.device_hash = ${hash}
      ORDER BY a.activated_at DESC LIMIT 1`;
    if (oldLicense.length) {
      const l = oldLicense[0];
      if (l.starts_at && l.expires_at) {
        const result = licensePayload({ ...l, license_id: l.id }, Date.now(), { licenseStatus: l.status });
        result.state = "EXPIRED";
        result.message = "This device has already used a paid license. Activate a new paid key to continue.";
        return json(result);
      }
      return json({ ok: false, code: "TRIAL_NOT_AVAILABLE", message: "This device has already used a paid license. Trial is not available for this device." }, 403);
    }
    return json({ ok: true, databaseBacked: true, state: "NOT_STARTED", trialType: "7-day", serverTime: Date.now(), message: "No trial has been started on this device." });
  } catch (error) {
    return safeError(error);
  }
}
