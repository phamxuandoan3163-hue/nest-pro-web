import { eventFromRequest, recordEvent } from "../../../lib/site-stats";
import { options } from "../../../lib/trame-http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Website analytics beacon. The site sends it with navigator.sendBeacon (text/plain body,
// so the browser sends no preflight). Only the website's own pages are accepted.
const SITE_ORIGINS = ["https://ainovanesting.pro", "https://www.ainovanesting.pro"];

export async function POST(request) {
  const origin = request.headers.get("origin") || "";
  if (!SITE_ORIGINS.includes(origin)) return new Response(null, { status: 204 });

  const text = await request.text().catch(() => "");
  if (!text || text.length > 2000) return new Response(null, { status: 204 });
  let body = null;
  try { body = JSON.parse(text); } catch { return new Response(null, { status: 204 }); }

  const row = eventFromRequest(request, body);
  if (row) {
    try { await recordEvent(row); } catch (e) { console.error("track: " + (e && e.message)); }
  }
  return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": origin, "Vary": "Origin", "Cache-Control": "no-store" } });
}

export function OPTIONS(request) { return options(request); }
