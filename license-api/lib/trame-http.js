// "null" is the origin a CEP panel sends for its local HTML page.
const defaultOrigins = ["https://ainovanesting.pro", "https://www.ainovanesting.pro", "null"];

function allowedOrigin(request) {
  const origin = request?.headers?.get("origin") || "";
  const configured = String(process.env.TRAME_ALLOWED_ORIGINS || defaultOrigins.join(","))
    .split(",").map((v) => v.trim()).filter((v) => v && v !== "*");
  return configured.includes(origin) ? origin : "";
}

export function clientIp(request) {
  return String(request.headers.get("x-forwarded-for") || "").split(",")[0].trim() || null;
}

export function json(request, data, init = {}) {
  const origin = allowedOrigin(request);
  const headers = {
    "Vary": "Origin",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    ...(origin ? { "Access-Control-Allow-Origin": origin } : {}),
    ...(init.headers || {})
  };
  return Response.json(data, { ...init, headers });
}

export function options(request) {
  const origin = allowedOrigin(request);
  return new Response(null, { status: 204, headers: {
    "Vary": "Origin",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    ...(origin ? { "Access-Control-Allow-Origin": origin } : {})
  } });
}
