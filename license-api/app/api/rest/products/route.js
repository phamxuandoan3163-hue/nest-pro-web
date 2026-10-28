export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 15;

const STORE_ID = "500658";
const PRODUCT_ID = "1449378";

async function lemonGet(path) {
  const apiKey = process.env.LEMON_SQUEEZY_API_KEY;
  if (!apiKey) {
    return { error: "Server is not configured with Lemon Squeezy API credentials." };
  }

  const response = await fetch(new URL(path, "https://api.lemonsqueezy.com"), {
    method: "GET",
    headers: {
      Accept: "application/vnd.api+json",
      Authorization: `Bearer ${apiKey}`
    },
    cache: "no-store"
  });

  if (!response.ok) {
    return { error: `Lemon Squeezy returned HTTP ${response.status}.`, status: response.status };
  }
  return response.json();
}

export async function GET() {
  if (!process.env.LEMON_SQUEEZY_API_KEY) {
    return Response.json({
      error: "server_not_configured",
      message: "The server administrator must configure LEMON_SQUEEZY_API_KEY in Vercel."
    }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }

  const [productPayload, variantsPayload] = await Promise.all([
    lemonGet(`/v1/products/${PRODUCT_ID}`),
    lemonGet(`/v1/variants?filter[product_id]=${PRODUCT_ID}&page[size]=50`)
  ]);

  if (productPayload.error || variantsPayload.error) {
    return Response.json({
      error: "upstream_error",
      message: productPayload.error || variantsPayload.error
    }, {
      status: productPayload.status || variantsPayload.status || 502,
      headers: { "Cache-Control": "no-store" }
    });
  }

  const product = productPayload?.data;
  const p = product?.attributes || {};
  const variants = Array.isArray(variantsPayload?.data) ? variantsPayload.data.map((item) => {
    const a = item?.attributes || {};
    const cents = Number(a.price);
    return {
      id: String(item.id),
      productId: String(a.product_id ?? ""),
      name: a.name ?? "",
      description: a.description ?? "",
      priceCents: Number.isFinite(cents) ? cents : null,
      currency: a.currency ?? p.currency ?? null,
      isSubscription: Boolean(a.is_subscription),
      interval: a.interval ?? null,
      intervalCount: a.interval_count ?? null,
      status: a.status ?? null,
      testMode: Boolean(a.test_mode)
    };
  }) : [];

  return Response.json({
    storeId: STORE_ID,
    product: {
      id: String(product?.id || PRODUCT_ID),
      name: p.name ?? null,
      slug: p.slug ?? null,
      description: p.description ?? null,
      status: p.status ?? null,
      currency: p.currency ?? null,
      buyNowUrl: p.buy_now_url ?? null,
      testMode: Boolean(p.test_mode)
    },
    variants
  }, { headers: { "Cache-Control": "no-store" } });
}
