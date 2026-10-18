import { randomUUID } from "node:crypto";
import { json, preflight, readDeviceId, readTrial, redisCommand, trialKey, trialResponse, parseLegacyTimes, TRIAL_MS, errorResponse } from "../_lib.js";

export function OPTIONS() { return preflight(); }
export async function POST(request) {
  let body;
  try { body = await request.json(); }
  catch (_) { return json({ ok: false, code: "INVALID_JSON", message: "Request body must be valid JSON." }, 400); }
  const deviceId = readDeviceId(body && body.deviceId);
  if (!deviceId) return json({ ok: false, code: "INVALID_DEVICE_ID", message: "The device identifier is invalid. Reopen the Nest-Pro panel and retry." }, 400);
  try {
    const now = Date.now();
    const legacy = parseLegacyTimes(body || {}, now);
    const record = {
      version: 1,
      id: "NPL-7D-" + randomUUID(),
      deviceId,
      startAt: legacy ? legacy.startAt : now,
      expiresAt: legacy ? legacy.expiresAt : now + TRIAL_MS,
      createdAt: now,
      source: legacy ? "legacy-migration" : "start-button"
    };
    const created = await redisCommand(["SET", trialKey(deviceId), JSON.stringify(record), "NX"]);
    if (created === "OK") return json(trialResponse(record, now));
    const existing = await readTrial(deviceId);
    if (!existing) return json({ ok: false, code: "TRIAL_RACE", message: "The trial was registered concurrently. Check status and retry." }, 409);
    return json(trialResponse(existing, now));
  } catch (error) {
    if (error && error.code === "INVALID_LEGACY_TRIAL") return json({ ok: false, code: error.code, message: error.message }, 400);
    return errorResponse(error);
  }
}
