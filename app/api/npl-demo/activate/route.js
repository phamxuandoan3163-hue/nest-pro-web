import {
  DEMO_KEY, json, preflight, validDeviceId, makeDeviceToken,
  licenseDetails, requireUnexpired
} from "../_lib.js";

export function OPTIONS() { return preflight(); }
export async function POST(request) {
  try {
    const input = await request.json();
    const key = String(input.licenseKey || input.key || "").toUpperCase().replace(/\s+/g, "");
    const deviceId = String(input.deviceId || "");
    if (key !== DEMO_KEY) {
      return json({ ok: false, valid: false, code: "INVALID_KEY", message: "Invalid demo key. Use the key displayed on the Nest-Pro License Demo page." }, 404);
    }
    if (!validDeviceId(deviceId)) {
      return json({ ok: false, valid: false, code: "INVALID_DEVICE", message: "Invalid device identifier. Reopen the CEP panel and retry." }, 400);
    }
    if (!requireUnexpired()) {
      return json({ ok: false, valid: false, code: "LICENSE_EXPIRED", message: "The demo license has expired." }, 403);
    }
    return json({ ...licenseDetails(), deviceToken: makeDeviceToken(deviceId), activated: true });
  } catch (_) {
    return json({ ok: false, code: "INVALID_REQUEST", message: "Request body must be valid JSON." }, 400);
  }
}
