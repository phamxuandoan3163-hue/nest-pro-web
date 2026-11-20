import { NextResponse } from "next/server";

// Protects the internal CMS at /admin.
// - If ADMIN_PASSWORD is not set on the server, /admin does not exist (404).
// - If it is set, the browser must send HTTP Basic auth with that password.
// Set ADMIN_PASSWORD only in the hosting environment, never in the repository.
export function proxy(request) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    return new NextResponse("Not found", { status: 404 });
  }

  const header = request.headers.get("authorization") || "";
  const [scheme, encoded] = header.split(" ");
  if (scheme === "Basic" && encoded) {
    let supplied = "";
    try {
      const decoded = atob(encoded);
      const index = decoded.indexOf(":");
      supplied = index >= 0 ? decoded.slice(index + 1) : "";
    } catch {
      supplied = "";
    }
    if (supplied === password) {
      return NextResponse.next();
    }
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Nova Nesting CMS", charset="UTF-8"' }
  });
}

export const config = {
  matcher: ["/admin", "/admin/:path*"]
};
