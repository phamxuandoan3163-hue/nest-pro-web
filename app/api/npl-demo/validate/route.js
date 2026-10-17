import {
  json, preflight, validDeviceId, makeDeviceToken, secureEqual,
  licenseDetails, requireUnexpired
} from "../_lib.js";

export function OPTIONS() { return preflight(); }
export async function POST(request) {
  try {
    const input = await request.json();
    const deviceId = String(input.deviceId || "");
    const deviceToken = String(input.deviceToken || "");
    if (!validDeviceId(deviceId) || !/^[a-f0-9]{64}$/i.test(deviceToken)) {
      return json({ ok: false, valid: false, code: "LICENSE_DEVICE_INVALID", message: "No valid demo activation was found. Activate your demo key again." }, 401);
    }
    if (!requireUnexpired() || !secureEqual(deviceToken, makeDeviceToken(deviceId))) {
      return json({ ok: false, valid: false, code: requireUnexpired() ? "LICENSE_DEVICE_INVALID" : "LICENSE_EXPIRED", message: requireUnexpired() ? "This device activation is invalid." : "The demo license has expired." }, 403);
    }
    return json(licenseDetails());
  } catch (_) {
    return json({ ok: false, code: "INVALID_REQUEST", message: "Request body must be valid JSON." }, 400);
  }
}
