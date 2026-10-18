import { json, preflight, readDeviceId, parseTrialTimes, trialResponse, errorResponse } from "../_lib.js";

export function OPTIONS() { return preflight(); }
export async function POST(request) {
  let body;
  try { body = await request.json(); }
  catch (_) { return json({ ok: false, code: "INVALID_JSON", message: "Request body must be valid JSON." }, 400); }
  const deviceId = readDeviceId(body && body.deviceId);
  if (!deviceId) return json({ ok: false, code: "INVALID_DEVICE_ID", message: "The device identifier is invalid. Reopen the Nest-Pro panel and retry." }, 400);
  try {
    const now = Date.now();
    const record = parseTrialTimes(body || {}, now);
    if (!record) {
      return json({ ok: true, state: "NOT_STARTED", trialType: "7-day", serverTime: now, verification: "online-clock", persistence: "local-device-record", message: "No local trial record was provided." });
    }
    record.deviceId = deviceId;
    return json(trialResponse(record, now));
  } catch (error) {
    return errorResponse(error);
  }
}
