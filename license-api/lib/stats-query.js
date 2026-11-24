import { db } from "./db";
import { ensureSiteEvents } from "./site-stats";

export const TZ = "Asia/Ho_Chi_Minh";

// List prices in USD (website pricing table), used only for an estimated revenue figure.
export const PLAN_PRICE = { monthly: 5, yearly: 50, yearly_pro: 60 };
export const PLAN_LABEL = { monthly: "Monthly", yearly: "Yearly", yearly_pro: "Yearly Pro", trial: "Dùng thử" };
// Live Paddle price ids; any other price id on a license is a sandbox (test) purchase.
const LIVE_PRICES = ["pri_01m7qg72fmshh1rbjncv4t5ywd", "pri_01m7qg72k6fhnz3e50yt55wf6k", "pri_01m7qg72p299r0vcmdm7ecqs9v"];

function dayKeys(days, now = new Date()) {
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" });
  const out = [];
  for (let i = days - 1; i >= 0; i--) out.push(fmt.format(new Date(now.getTime() - i * 86400000)));
  return out;
}

function maskEmail(email) {
  const e = String(email || "");
  const at = e.indexOf("@");
  if (at < 1) return e ? "***" : "";
  return e.slice(0, Math.min(2, at)) + "***" + e.slice(at);
}

// Fails with a readable error instead of leaving the page loading forever.
function withTimeout(promise, ms, what) {
  let timer;
  return Promise.race([
    promise,
    new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(what + " took longer than " + ms / 1000 + "s")), ms); })
  ]).finally(() => clearTimeout(timer));
}

export async function loadStats(days) {
  await withTimeout(ensureSiteEvents(), 15000, "Preparing the site_events table");
  const sql = db();
  const keys = dayKeys(days);
  const since = keys[0];
  // Midnight Vietnam time (UTC+7, no daylight saving) at the start of the range.
  const sinceTs = new Date(since + "T00:00:00+07:00");

  // The queries run one after another on purpose: Supabase's transaction pooler can stall
  // when many queries are pipelined on a single connection.
  const queries = () => [
    () => sql`SELECT type, COUNT(*)::int AS n, COUNT(DISTINCT visitor)::int AS v
        FROM site_events WHERE at >= ${sinceTs} GROUP BY type`,
    () => sql`SELECT to_char(at AT TIME ZONE ${TZ}, 'YYYY-MM-DD') AS d, type, COUNT(*)::int AS n, COUNT(DISTINCT visitor)::int AS v
        FROM site_events WHERE at >= ${sinceTs} GROUP BY 1, 2`,
    () => sql`SELECT country, COUNT(*)::int AS n, COUNT(DISTINCT visitor)::int AS v
        FROM site_events WHERE type = 'pageview' AND at >= ${sinceTs} GROUP BY country ORDER BY v DESC, n DESC LIMIT 15`,
    () => sql`SELECT country, region, city, COUNT(DISTINCT visitor)::int AS v
        FROM site_events WHERE type = 'pageview' AND at >= ${sinceTs} AND city <> '' GROUP BY 1, 2, 3 ORDER BY v DESC LIMIT 12`,
    () => sql`SELECT path, COUNT(*)::int AS n, COUNT(DISTINCT visitor)::int AS v
        FROM site_events WHERE type = 'pageview' AND at >= ${sinceTs} GROUP BY path ORDER BY n DESC LIMIT 10`,
    () => sql`SELECT referrer_host AS host, COUNT(DISTINCT visitor)::int AS v
        FROM site_events WHERE type = 'pageview' AND at >= ${sinceTs} AND referrer_host <> '' GROUP BY 1 ORDER BY v DESC LIMIT 8`,
    () => sql`SELECT device, COUNT(DISTINCT visitor)::int AS v
        FROM site_events WHERE type = 'pageview' AND at >= ${sinceTs} GROUP BY device ORDER BY v DESC`,
    () => sql`SELECT path, label, COUNT(*)::int AS n, COUNT(DISTINCT visitor)::int AS v
        FROM site_events WHERE type = 'download' AND at >= ${sinceTs} GROUP BY 1, 2 ORDER BY n DESC LIMIT 8`,
    () => sql`SELECT type, label, COUNT(*)::int AS n
        FROM site_events WHERE type IN ('checkout_open', 'checkout_done') AND at >= ${sinceTs} GROUP BY 1, 2`,
    () => sql`SELECT MIN(at) AS at FROM site_events`,
    () => sql`SELECT to_char(created_at AT TIME ZONE ${TZ}, 'YYYY-MM-DD') AS d, plan_key, price_id, COUNT(*)::int AS n
        FROM trame_licenses WHERE paddle_transaction_id IS NOT NULL AND plan_key <> 'trial' AND created_at >= ${sinceTs}
        GROUP BY 1, 2, 3`,
    () => sql`SELECT created_at, plan_key, price_id, customer_email, status, subscription_status
        FROM trame_licenses WHERE paddle_transaction_id IS NOT NULL AND plan_key <> 'trial'
        ORDER BY created_at DESC LIMIT 10`,
    () => sql`SELECT to_char(created_at AT TIME ZONE ${TZ}, 'YYYY-MM-DD') AS d, COUNT(*)::int AS n
        FROM trame_trials WHERE created_at >= ${sinceTs} GROUP BY 1`
  ];

  const results = [];
  for (const run of queries()) results.push(await withTimeout(run(), 15000, "A statistics query"));
  const [totals, daily, countries, cities, pages, referrers, devices, downloads, checkouts, first,
         purchases, recent, trials] = results;

  const total = (type, field) => (totals.find((r) => r.type === type) || {})[field] || 0;
  const series = keys.map((d) => {
    const pick = (type, field) => (daily.find((r) => r.d === d && r.type === type) || {})[field] || 0;
    const live = purchases.filter((r) => r.d === d && LIVE_PRICES.includes(r.price_id));
    return {
      d,
      visitors: pick("pageview", "v"),
      pageviews: pick("pageview", "n"),
      downloads: pick("download", "n"),
      purchases: live.reduce((s, r) => s + r.n, 0),
      trials: (trials.find((r) => r.d === d) || {}).n || 0
    };
  });

  const livePurchases = purchases.filter((r) => LIVE_PRICES.includes(r.price_id));
  const byPlan = Object.keys(PLAN_PRICE).map((plan) => ({
    plan,
    n: livePurchases.filter((r) => r.plan_key === plan).reduce((s, r) => s + r.n, 0)
  }));

  return {
    days,
    since,
    firstEventAt: first[0]?.at || null,
    totals: {
      visitors: total("pageview", "v"),
      pageviews: total("pageview", "n"),
      downloads: total("download", "n"),
      downloaders: total("download", "v"),
      checkoutOpen: total("checkout_open", "n"),
      checkoutDone: total("checkout_done", "n"),
      purchases: byPlan.reduce((s, r) => s + r.n, 0),
      revenue: byPlan.reduce((s, r) => s + r.n * PLAN_PRICE[r.plan], 0),
      sandboxPurchases: purchases.filter((r) => !LIVE_PRICES.includes(r.price_id)).reduce((s, r) => s + r.n, 0),
      trials: series.reduce((s, r) => s + r.trials, 0)
    },
    series,
    byPlan,
    countries,
    cities,
    pages,
    referrers,
    devices,
    downloads,
    checkouts,
    recent: recent.map((r) => ({
      at: r.created_at,
      plan: r.plan_key,
      sandbox: !LIVE_PRICES.includes(r.price_id),
      email: maskEmail(r.customer_email),
      status: r.status === "revoked" ? "revoked" : (r.subscription_status || "active")
    }))
  };
}
