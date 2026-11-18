import { publicKeyB64 } from "../../../../lib/trame";
import { json, options } from "../../../../lib/trame-http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    return json(request, { ok: true, algorithm: "ed25519", public_key: publicKeyB64() });
  } catch (e) {
    return json(request, { ok: false, error: "pubkey_unavailable" }, { status: 500 });
  }
}
export function OPTIONS(request) { return options(request); }
