import { randomUUID } from "node:crypto";
import { json, preflight, readDeviceId, parseTrialTimes, trialResponse, TRIAL_MS, errorResponse } from "../_lib.js";

export function OPTIONS() { return preflight(); }
export async function POST(request) {
  let body;
  try { body = await request.json(); }
  catch (_) { return json({ ok: false, code: "INVALID_JSON", message: "Request body must be valid JSON." }, 400); }
  const deviceId = readDeviceId(body && body.deviceId);
  if (!deviceId) return json({ ok: false, code: "INVALID_DEVICE_ID", message: "The device identifier is invalid. Reopen the Nest-Pro panel and retry." }, 400);
  try {
    const now = Date.now();
    const localRecord = parseTrialTimes(body || {}, now);
    const record = localRecord || {
      version: 1,
      id: "NPL-7D-" + randomUUID(),
      deviceId,
      startAt: now,
      expiresAt: now + TRIAL_MS,
      source: "start-button"
    };
    record.deviceId = deviceId;
    return json(trialResponse(record, now));
  } catch (error) {
    return errorResponse(error);
  }
}
