import { createMcpHandler } from "mcp-handler";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 20;

const STORE_ID = "500658";
const PRODUCT_ID = "1449378";

const EXPECTED_VARIANTS = [
  {
    id: "2262437",
    name: "Monthly License",
    price: 990,
    activationLimit: 1,
    length: [
      { value: 30, unit: "day" },
      { value: 1, unit: "month" }
    ]
  },
  {
    id: "2262444",
    name: "Annual License",
    price: 6390,
    activationLimit: 1,
    length: [{ value: 1, unit: "year" }]
  },
  {
    id: "2303959",
    name: "Annual Pro",
    price: 9590,
    activationLimit: 2,
    length: [{ value: 1, unit: "year" }]
  },
  {
    id: "2303969",
    name: "Free Trial",
    price: 0,
    activationLimit: 1,
    length: [{ value: 7, unit: "day" }]
  }
];

function safeErrorMessage(error) {
  const message = String(error?.message || "");
  if (message.includes("LEMON_SQUEEZY_API_KEY")) {
    return "Server setup incomplete: add LEMON_SQUEEZY_API_KEY to the nest-pro-license-api Vercel project environment variables, then redeploy.";
  }
  return message || "Unknown Lemon Squeezy API error.";
}

function result(data) {
  return {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    structuredContent: data
  };
}

function errorResult(error) {
  return {
    isError: true,
    content: [{ type: "text", text: safeErrorMessage(error) }]
  };
}

async function lemonGet(path, params = {}) {
  const apiKey = process.env.LEMON_SQUEEZY_API_KEY;
  if (!apiKey) {
    throw new Error("LEMON_SQUEEZY_API_KEY is missing.");
  }

  const url = new URL(path, "https://api.lemonsqueezy.com");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${apiKey}`
    },
    next: { revalidate: 20 }
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      `Lemon Squeezy API returned HTTP ${response.status}. Check the API key and whether it belongs to the correct Live/Test store.`
    );
  }
  return body;
}

function mapVariant(item) {
  const a = item?.attributes || {};
  const priceCents = Number.isFinite(Number(a.price)) ? Number(a.price) : null;
  return {
    id: String(item?.id || ""),
    productId: String(a.product_id ?? ""),
    name: a.name ?? "",
    description: a.description ?? "",
    priceCents,
    priceUSD: priceCents === null ? null : (priceCents / 100).toFixed(2),
    isSubscription: Boolean(a.is_subscription),
    interval: a.interval ?? null,
    intervalCount: a.interval_count ?? null,
    hasLicenseKeys: Boolean(a.has_license_keys),
    activationLimit: a.is_license_limit_unlimited ? "unlimited" : Number(a.license_activation_limit ?? 0),
    licenseLength: a.is_license_length_unlimited
      ? "unlimited"
      : { value: Number(a.license_length_value ?? 0), unit: a.license_length_unit ?? null },
    status: a.status ?? null,
    statusFormatted: a.status_formatted ?? null,
    testMode: Boolean(a.test_mode)
  };
}

async function listVariantsRaw() {
  const payload = await lemonGet("/v1/variants", {
    "filter[product_id]": PRODUCT_ID,
    "page[size]": 50
  });
  return Array.isArray(payload?.data) ? payload.data : [];
}

const handler = createMcpHandler((server) => {
  server.registerTool(
    "get_store_summary",
    {
      title: "Get Lemon Squeezy store summary",
      description: "Read basic metadata for the configured Lemon Squeezy store. This tool does not return customers, orders, payment methods, or secret values.",
      inputSchema: z.object({}),
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false }
    },
    async () => {
      try {
        const payload = await lemonGet(`/v1/stores/${STORE_ID}`);
        const a = payload?.data?.attributes || {};
        return result({
          storeId: String(payload?.data?.id || STORE_ID),
          name: a.name ?? null,
          slug: a.slug ?? null,
          url: a.url ?? a.domain ?? null,
          currency: a.currency ?? null,
          country: a.country ?? null,
          testMode: Boolean(a.test_mode)
        });
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.registerTool(
    "get_nest_pro_laser_product",
    {
      title: "Get Nest-Pro Laser product",
      description: "Read the configured Nest-Pro Laser product's public product and checkout metadata. Does not read customers, orders, or license keys.",
      inputSchema: z.object({}),
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false }
    },
    async () => {
      try {
        const payload = await lemonGet(`/v1/products/${PRODUCT_ID}`);
        const a = payload?.data?.attributes || {};
        return result({
          productId: String(payload?.data?.id || PRODUCT_ID),
          storeId: String(a.store_id ?? STORE_ID),
          name: a.name ?? null,
          slug: a.slug ?? null,
          description: a.description ?? null,
          status: a.status ?? null,
          statusFormatted: a.status_formatted ?? null,
          price: a.price ?? null,
          currency: a.currency ?? null,
          buyNowUrl: a.buy_now_url ?? null,
          hasVariants: Boolean(a.has_variants),
          testMode: Boolean(a.test_mode)
        });
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.registerTool(
    "list_nest_pro_laser_variants",
    {
      title: "List Nest-Pro Laser variants",
      description: "Read the four configured product variants: Monthly License, Annual License, Annual Pro, and Free Trial. Exposes only variant metadata and license settings, never actual license keys or customer information.",
      inputSchema: z.object({}),
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false }
    },
    async () => {
      try {
        const variants = (await listVariantsRaw()).map(mapVariant);
        return result({
          storeId: STORE_ID,
          productId: PRODUCT_ID,
          variants
        });
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.registerTool(
    "audit_nest_pro_license_variants",
    {
      title: "Audit the four license variants",
      description: "Compare the current Lemon Squeezy variant settings with the planned Nova Nesting AI prices, license duration, and activation limits. Read-only; makes no changes.",
      inputSchema: z.object({}),
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false }
    },
    async () => {
      try {
        const current = (await listVariantsRaw()).map((item) => ({
          id: String(item?.id || ""),
          attributes: item?.attributes || {}
        }));
        const audit = EXPECTED_VARIANTS.map((expected) => {
          const actual = current.find((item) => item.id === expected.id);
          if (!actual) {
            return {
              ...expected,
              found: false,
              ok: false,
              issues: ["Variant ID not found under configured product."]
            };
          }

          const a = actual.attributes;
          const currentPrice = Number(a.price);
          const actualLimit = a.is_license_limit_unlimited ? "unlimited" : Number(a.license_activation_limit ?? 0);
          const lengthMatches = expected.length.some((candidate) =>
            Number(a.license_length_value) === candidate.value &&
            String(a.license_length_unit || "").toLowerCase().replace(/s$/, "") === candidate.unit
          );
          const checks = {
            name: String(a.name || "").trim().toLowerCase() === expected.name.toLowerCase(),
            price: currentPrice === expected.price,
            licenseKeysEnabled: a.has_license_keys === true,
            activationLimit: actualLimit === expected.activationLimit,
            licenseLength: a.is_license_length_unlimited !== true && lengthMatches,
            productId: String(a.product_id ?? "") === PRODUCT_ID
          };
          const issues = Object.entries(checks)
            .filter(([, passed]) => !passed)
            .map(([key]) => key);
          return {
            id: expected.id,
            expectedName: expected.name,
            actualName: a.name ?? null,
            expectedPriceUSD: (expected.price / 100).toFixed(2),
            actualPriceUSD: Number.isFinite(currentPrice) ? (currentPrice / 100).toFixed(2) : null,
            expectedActivationLimit: expected.activationLimit,
            actualActivationLimit: actualLimit,
            actualLicenseLength: a.is_license_length_unlimited
              ? "unlimited"
              : { value: Number(a.license_length_value ?? 0), unit: a.license_length_unit ?? null },
            licenseKeysEnabled: a.has_license_keys === true,
            status: a.status ?? null,
            testMode: Boolean(a.test_mode),
            checks,
            found: true,
            ok: issues.length === 0,
            issues
          };
        });
        return result({
          storeId: STORE_ID,
          productId: PRODUCT_ID,
          allPassed: audit.every((item) => item.ok),
          variants: audit
        });
      } catch (error) {
        return errorResult(error);
      }
    }
  );
});

export { handler as GET, handler as POST, handler as DELETE };
