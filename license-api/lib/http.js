const defaultOrigins = ["https://ainovanesting.pro", "https://www.ainovanesting.pro"];

function allowedOrigin(request) {
  const origin = request?.headers?.get("origin") || "";
  const configured = String(process.env.LICENSE_ALLOWED_ORIGINS || defaultOrigins.join(","))
    .split(",").map((value) => value.trim()).filter((value) => value && value !== "*");
  return configured.includes(origin) ? origin : "";
}

export function json(request, data, init = {}) {
  const origin = allowedOrigin(request);
  const headers = {
    "Vary": "Origin",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Accept, Content-Type",
    "Access-Control-Max-Age": "86400",
    ...(origin ? { "Access-Control-Allow-Origin": origin } : {}),
    ...(init.headers || {})
  };
  return Response.json(data, { ...init, headers });
}

export function options(request) {
  const origin = allowedOrigin(request);
  const headers = {
    "Vary": "Origin",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Accept, Content-Type",
    "Access-Control-Max-Age": "86400",
    ...(origin ? { "Access-Control-Allow-Origin": origin } : {})
  };
  return new Response(null, { status: 204, headers });
}
