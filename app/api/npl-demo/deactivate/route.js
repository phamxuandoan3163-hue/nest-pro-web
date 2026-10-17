import { json, preflight, validDeviceId, makeDeviceToken, secureEqual } from "../_lib.js";

export function OPTIONS() { return preflight(); }
export async function POST(request) {
  try {
    const input = await request.json();
    const deviceId = String(input.deviceId || "");
    const token = String(input.deviceToken || "");
    if (!validDeviceId(deviceId) || !/^[a-f0-9]{64}$/i.test(token) || !secureEqual(token, makeDeviceToken(deviceId))) {
      return json({ ok: false, code: "DEVICE_NOT_ACTIVE", message: "No valid demo activation exists on this device." }, 401);
    }
    return json({ ok: true, deactivated: true, demo: true, message: "Demo device deactivated. The demo key can be activated again." });
  } catch (_) {
    return json({ ok: false, code: "INVALID_REQUEST", message: "Request body must be valid JSON." }, 400);
  }
}
