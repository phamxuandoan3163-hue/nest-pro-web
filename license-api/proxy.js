import { NextResponse } from "next/server";

// Protects the statistics dashboard at /stats.
// - If STATS_PASSWORD is not set on the server, /stats does not exist (404).
// - If it is set, the browser asks for it (HTTP Basic auth; any user name).
// Set STATS_PASSWORD only in the Vercel project settings, never in the repository.
export function proxy(request) {
  const password = process.env.STATS_PASSWORD;
  if (!password) return new NextResponse("Not found", { status: 404 });

  const [scheme, encoded] = (request.headers.get("authorization") || "").split(" ");
  if (scheme === "Basic" && encoded) {
    let supplied = "";
    try {
      const decoded = atob(encoded);
      supplied = decoded.slice(decoded.indexOf(":") + 1);
    } catch { supplied = ""; }
    if (supplied && supplied === password) return NextResponse.next();
  }
  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Nova Nesting stats", charset="UTF-8"' }
  });
}

export const config = { matcher: ["/stats", "/stats/:path*"] };
