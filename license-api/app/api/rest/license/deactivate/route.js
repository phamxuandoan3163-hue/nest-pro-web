import { db, ensureLicenseSchema } from "../../../../../lib/db";
import { hashLicenseKey } from "../../../../../lib/license";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  const form = new URLSearchParams(await request.text());
  const key = String(form.get("license_key") || "").trim();
  const instanceId = String(form.get("instance_id") || "").trim();
  if (!key || !instanceId) return Response.json({ error: "invalid_request" }, { status: 400 });

  const sql = db();
  await ensureLicenseSchema(sql);
  const result = await sql`
    UPDATE nova_license_devices
    SET deactivated_at=NOW()
    WHERE id=${instanceId} AND key_hash=${hashLicenseKey(key)} AND deactivated_at IS NULL
    RETURNING id
  `;
  return Response.json({ deactivated: result.length > 0 }, { headers: { "Cache-Control": "no-store" } });
}
