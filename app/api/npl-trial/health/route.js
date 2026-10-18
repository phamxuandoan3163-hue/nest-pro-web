import { json, preflight } from "../_lib.js";

export function OPTIONS() { return preflight(); }
export async function GET() {
  const configured = Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
  return json({
    ok: configured,
    service: "nest-pro-laser-online-trial",
    apiVersion: "1.0.0",
    mode: "online-7-day-trial",
    storageConfigured: configured,
    serverTime: Date.now(),
    message: configured ? "Online trial API is configured." : "Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in Vercel, then redeploy."
  }, configured ? 200 : 503);
}
