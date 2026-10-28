export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 15;

const EXPECTED_STORE_ID = "500658";
const EXPECTED_PRODUCT_ID = "1449378";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid_json", message: "Request body must be valid JSON." }, { status: 400 });
  }

  const licenseKey = typeof body?.license_key === "string" ? body.license_key.trim() : "";
  const instanceId = typeof body?.instance_id === "string" ? body.instance_id.trim() : "";

  if (!licenseKey || licenseKey.length > 512) {
    return Response.json({ error: "invalid_request", message: "license_key is required and must be 512 characters or fewer." }, { status: 400 });
  }
  if (instanceId.length > 256) {
    return Response.json({ error: "invalid_request", message: "instance_id must be 256 characters or fewer." }, { status: 400 });
  }

  const form = new URLSearchParams({ license_key: licenseKey });
  if (instanceId) form.set("instance_id", instanceId);

  let upstream;
  try {
    upstream = await fetch("https://api.lemonsqueezy.com/v1/licenses/validate", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: form.toString(),
      cache: "no-store"
    });
  } catch {
    return Response.json({ error: "upstream_unavailable", message: "License provider could not be reached." }, { status: 502 });
  }

  const payload = await upstream.json().catch(() => null);
  if (!upstream.ok || !payload) {
    return Response.json({ error: "upstream_error", message: "License provider returned an invalid response." }, { status: 502 });
  }

  const data = payload?.license_key || {};
  const meta = payload?.meta || {};
  const belongsToProduct = String(meta.store_id ?? "") === EXPECTED_STORE_ID && String(meta.product_id ?? "") === EXPECTED_PRODUCT_ID;
  const valid = Boolean(payload?.valid) && belongsToProduct;
  return Response.json({
    valid,
    error: !belongsToProduct ? "license_for_different_product" : (payload?.error || null),
    license: {
      status: data.status ?? null,
      activationLimit: data.activation_limit ?? null,
      activationUsage: data.activation_usage ?? null,
      expiresAt: data.expires_at ?? null,
      testMode: data.test_mode ?? null
    },
    meta: {
      storeId: meta.store_id ?? null,
      productId: meta.product_id ?? null,
      variantId: meta.variant_id ?? null
    }
  }, { headers: { "Cache-Control": "no-store" } });
}
