import { corsHeaders, json, preflight } from "../_lib.js";

export function OPTIONS() { return preflight(); }
export async function GET() {
  return json({
    ok: true,
    service: "nest-pro-license-demo",
    apiVersion: "demo-1.0",
    mode: "DEMO_ONLY",
    database: "not-required-for-preview",
    note: "This endpoint is for testing the CEP activation flow only."
  });
}
