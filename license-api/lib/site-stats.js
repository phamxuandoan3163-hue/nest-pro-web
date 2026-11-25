import { createHash } from "node:crypto";
import { db } from "./db";

// Website analytics stored in the same Postgres as the licenses.
// Privacy: no cookies, no IP address stored. A visitor is a hash of IP + browser + the day,
// with a server-side salt, so the same person counts once per day and cannot be traced
// across days or back to an IP.

export const EVENT_TYPES = ["pageview", "download", "checkout_open", "checkout_done"];

let ready = null;
export function ensureSiteEvents() {
  if (!ready) {
    const sql = db();
    ready = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS site_events (
          id BIGSERIAL PRIMARY KEY,
          at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          type TEXT NOT NULL,
          path TEXT NOT NULL DEFAULT '',
          label TEXT NOT NULL DEFAULT '',
          referrer_host TEXT NOT NULL DEFAULT '',
          country TEXT NOT NULL DEFAULT '',
          region TEXT NOT NULL DEFAULT '',
          city TEXT NOT NULL DEFAULT '',
          device TEXT NOT NULL DEFAULT '',
          visitor TEXT NOT NULL DEFAULT ''
        )`;
      await sql`CREATE INDEX IF NOT EXISTS site_events_at_type ON site_events (at, type)`;
    })().catch((e) => { ready = null; throw e; });
  }
  return ready;
}

function salt() {
  return String(process.env.STATS_SALT || process.env.TRAME_LICENSE_ENCRYPTION_KEY || "nova-stats");
}

export function visitorId(ip, userAgent, day) {
  return createHash("sha256").update(salt() + "|" + day + "|" + (ip || "") + "|" + (userAgent || "")).digest("hex").slice(0, 20);
}

export function isBot(userAgent) {
  return !userAgent || /bot|crawl|spider|slurp|headless|preview|facebookexternalhit|lighthouse|pingdom|uptime|curl|wget|python|node-fetch|axios/i.test(userAgent);
}

export function deviceOf(userAgent) {
  if (/ipad|tablet/i.test(userAgent)) return "tablet";
  if (/mobi|iphone|android/i.test(userAgent)) return "mobile";
  return "desktop";
}

function clip(value, max) {
  return String(value || "").replace(/[\u0000-\u001f]/g, "").trim().slice(0, max);
}

function headerText(request, name, max) {
  const raw = request.headers.get(name) || "";
  try { return clip(decodeURIComponent(raw), max); } catch { return clip(raw, max); }
}

// Turns a tracking request into a row, or null when it should be ignored.
export function eventFromRequest(request, body, now = new Date()) {
  const userAgent = request.headers.get("user-agent") || "";
  if (isBot(userAgent)) return null;
  const type = String(body?.type || "");
  if (!EVENT_TYPES.includes(type)) return null;

  let path = clip(body?.path, 200);
  if (!path.startsWith("/")) path = "/" + path;
  path = path.split(/[?#]/)[0];

  let referrerHost = "";
  try {
    const host = new URL(String(body?.referrer || "")).hostname.replace(/^www\./, "");
    if (host && !/(^|\.)ainovanesting\.pro$/.test(host)) referrerHost = clip(host, 120);
  } catch { /* no or invalid referrer */ }

  const ip = String(request.headers.get("x-forwarded-for") || "").split(",")[0].trim();
  return {
    type,
    path,
    label: clip(body?.label, 80),
    referrer_host: referrerHost,
    country: headerText(request, "x-vercel-ip-country", 2).toUpperCase(),
    region: headerText(request, "x-vercel-ip-country-region", 40),
    city: headerText(request, "x-vercel-ip-city", 80),
    device: deviceOf(userAgent),
    visitor: visitorId(ip, userAgent, now.toISOString().slice(0, 10))
  };
}

// Insert straight away; create the table only when it does not exist yet (error 42P01),
// so a normal visit costs one database round trip.
export async function recordEvent(row) {
  const sql = db();
  const insert = () => sql`INSERT INTO site_events ${sql(row, "type", "path", "label", "referrer_host", "country", "region", "city", "device", "visitor")}`;
  try {
    await insert();
  } catch (e) {
    if (!e || e.code !== "42P01") throw e;
    await ensureSiteEvents();
    await insert();
  }
}
