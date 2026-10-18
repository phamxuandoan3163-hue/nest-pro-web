import { json, preflight } from "../_lib.js";

export function OPTIONS() { return preflight(); }
export async function GET() {
  return json({
    ok: true,
    service: "nest-pro-laser-online-trial",
    apiVersion: "1.1.0",
    mode: "online-7-day-trial",
    storageConfigured: true,
    verification: "online-clock",
    persistence: "local-device-record",
    serverTime: Date.now(),
    message: "Online trial time verification API is ready. Trial timestamps are stored locally by the CEP. This mode does not provide server-side anti-reset storage."
  });
}
