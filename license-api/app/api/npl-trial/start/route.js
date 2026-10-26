import {
  database, json, preflight, readDeviceId, deviceHash, getRequestMeta,
  upsertDevice, recordEvent, licensePayload, TRIAL_MS, safeError
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
    const hash = deviceHash(deviceId);
    const meta = getRequestMeta(request);
    const existingRows = await sql`SELECT * FROM npl_devices WHERE device_hash = ${hash} LIMIT 1`;
    const existing = existingRows[0] || null;
    const alreadyConsented = !!(existing && existing.privacy_consent_at);
    if (!alreadyConsented && body.privacyConsent !== true) {
      return json({ ok: false, code: "PRIVACY_CONSENT_REQUIRED", message: "Accept the privacy notice before starting the trial. Nest-Pro records your device fingerprint, IP address, and approximate IP-based location for trial-abuse prevention." }, 403);
    }
    if (existing && existing.trial_started_at && existing.trial_expires_at) {
      await upsertDevice(sql, deviceId, hash, meta, true);
      await recordEvent(sql, "trial_start_recheck", hash, null, meta, { outcome: "existing-trial-preserved" });
      const result = licensePayload({ ...existing, plan: "trial7" }, Date.now(), { deviceRegistered: true });
      return json(result, result.ok ? 200 : 500);
    }
    const pastPaid = await sql`SELECT l.id, l.status, l.starts_at, l.expires_at
      FROM npl_license_activations a JOIN npl_licenses l ON l.id = a.license_id
      WHERE a.device_hash = ${hash} ORDER BY a.activated_at DESC LIMIT 1`;
    if (pastPaid.length) {
      return json({ ok: false, code: "TRIAL_NOT_AVAILABLE", message: "This device has already used a paid license. Activate a 30-day or 1-year key to continue." }, 403);
    }
    const now = Date.now();
    const hasLegacyStart = Object.prototype.hasOwnProperty.call(body, "legacyStartAt");
    const hasLegacyExpiry = Object.prototype.hasOwnProperty.call(body, "legacyExpiresAt");
    if (hasLegacyStart !== hasLegacyExpiry) {
      return json({ ok: false, code: "INVALID_EXISTING_TRIAL", message: "Existing trial data is incomplete and cannot be migrated." }, 400);
    }
    let startAt = now;
    let expiresAt = now + TRIAL_MS;
    if (hasLegacyStart && hasLegacyExpiry) {
      startAt = Number(body.legacyStartAt);
      expiresAt = Number(body.legacyExpiresAt);
      if (!Number.isSafeInteger(startAt) || !Number.isSafeInteger(expiresAt) || expiresAt - startAt !== TRIAL_MS || startAt > now + 300000 || expiresAt > now + TRIAL_MS + 300000) {
        return json({ ok: false, code: "INVALID_EXISTING_TRIAL", message: "The existing trial dates are invalid and cannot be granted a fresh seven days." }, 400);
      }
    }
    await upsertDevice(sql, deviceId, hash, meta, true);
    const rows = await sql`UPDATE npl_devices SET
        trial_started_at = COALESCE(trial_started_at, ${new Date(startAt).toISOString()}::timestamptz),
        trial_expires_at = COALESCE(trial_expires_at, ${new Date(expiresAt).toISOString()}::timestamptz),
        privacy_consent_at = COALESCE(privacy_consent_at, NOW()),
        last_seen_at = NOW(), updated_at = NOW()
      WHERE device_hash = ${hash}
      RETURNING *`;
    const record = rows[0];
    const newTrial = Number(new Date(record.trial_started_at).getTime()) === startAt && Number(new Date(record.trial_expires_at).getTime()) === expiresAt;
    await recordEvent(sql, newTrial ? "trial_started" : "trial_start_recheck", hash, null, meta, {
      plan: "trial7", source: hasLegacyStart ? "legacy-migration" : "start-button",
      durationDays: 7, databaseRecordIsAuthoritative: true
    });
    const result = licensePayload({ ...record, plan: "trial7" }, Date.now(), { deviceRegistered: true });
    return json(result, result.ok ? 200 : 500);
  } catch (error) {
    return safeError(error);
  }
}
