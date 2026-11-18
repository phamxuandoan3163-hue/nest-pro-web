import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { db } from "../../../../../lib/db";
import { decryptKey, deliverTrameLicense, encryptKey, hashKey, makeTrameKey, planForPrice, TRAME_RENEW_URL } from "../../../../../lib/trame";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

function signatureIsValid(rawBody, header, secret) {
  if (!header || !secret) return false;
  const parts = Object.fromEntries(header.split(";").map((part) => {
    const i = part.indexOf("=");
    return i < 0 ? ["", ""] : [part.slice(0, i).trim(), part.slice(i + 1).trim()];
  }));
  const timestamp = Number(parts.ts);
  const received = parts.h1 || "";
  if (!Number.isFinite(timestamp) || Math.abs(Date.now() / 1000 - timestamp) > 300 || !/^[a-f0-9]{64}$/i.test(received)) return false;
  const expected = createHmac("sha256", secret).update(String(timestamp) + ":" + rawBody, "utf8").digest("hex");
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(received, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

function firstItem(transaction) {
  const items = Array.isArray(transaction.items) && transaction.items.length
    ? transaction.items
    : (Array.isArray(transaction.details?.line_items) ? transaction.details.line_items : []);
  return items.length === 1 && Number(items[0].quantity || 1) === 1 ? items[0] : null;
}

function emailFrom(transaction) {
  const email = String(transaction.customer?.email || transaction.billing_details?.email || transaction.customer_email || "").trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

export async function POST(request) {
  const rawBody = await request.text();
  if (!signatureIsValid(rawBody, request.headers.get("paddle-signature"), process.env.TRAME_NOTIFICATION_SECRET)) {
    return Response.json({ error: "invalid_signature" }, { status: 401 });
  }
  let event;
  try { event = JSON.parse(rawBody); } catch { return Response.json({ error: "invalid_json" }, { status: 400 }); }

  const eventId = String(event?.event_id || "");
  const eventType = String(event?.event_type || "");
  if (!eventId || eventId.length > 200) return Response.json({ error: "missing_event_id" }, { status: 400 });

  const sql = db();
  const seen = await sql`SELECT event_id FROM trame_webhook_events WHERE event_id=${eventId} LIMIT 1`;
  if (seen[0]) return Response.json({ received: true, duplicate: true });
  const occurredAt = String(event.occurred_at || new Date().toISOString());

  if (eventType.startsWith("subscription.")) {
    const sub = event.data || {};
    const subscriptionId = String(sub.id || "");
    const periodEnd = sub.current_billing_period?.ends_at || null;
    if (subscriptionId) {
      // Cancelling stops renewal only; access runs until the paid period ends (expires_at).
      await sql`
        UPDATE trame_licenses SET
          subscription_status=${String(sub.status || eventType.slice(13))},
          expires_at=COALESCE(${periodEnd}::timestamptz, expires_at),
          subscription_event_at=${occurredAt}::timestamptz
        WHERE paddle_subscription_id=${subscriptionId}
          AND (subscription_event_at IS NULL OR subscription_event_at < ${occurredAt}::timestamptz)
      `;
    }
    await sql`INSERT INTO trame_webhook_events(event_id,event_type) VALUES (${eventId},${eventType}) ON CONFLICT DO NOTHING`;
    return Response.json({ received: true });
  }

  if (eventType !== "transaction.completed") {
    await sql`INSERT INTO trame_webhook_events(event_id,event_type) VALUES (${eventId},${eventType}) ON CONFLICT DO NOTHING`;
    return Response.json({ received: true, ignored: true });
  }

  const transaction = event.data || {};
  const item = firstItem(transaction);
  const priceId = item?.price_id || item?.price?.id || null;
  const plan = planForPrice(priceId);
  if (!item || !plan) return Response.json({ error: "unknown_price_id" }, { status: 400 });

  const transactionId = String(transaction.id || "");
  const subscriptionId = plan.recurring ? String(transaction.subscription_id || "") : null;
  const periodEnd = item.billing_period?.ends_at || transaction.billing_period?.ends_at || null;
  const expiresAt = plan.recurring && periodEnd
    ? periodEnd
    : new Date(Date.now() + plan.days * 24 * 60 * 60 * 1000).toISOString();
  const email = emailFrom(transaction);
  if (!email) return Response.json({ error: "invalid_customer_email" }, { status: 502 });

  const existing = subscriptionId
    ? await sql`SELECT * FROM trame_licenses WHERE paddle_subscription_id=${subscriptionId} LIMIT 1`
    : await sql`SELECT * FROM trame_licenses WHERE paddle_transaction_id=${transactionId} LIMIT 1`;

  if (existing[0]) {
    // Renewal: extend the same key.
    await sql`
      UPDATE trame_licenses SET expires_at=${expiresAt}::timestamptz, status='active',
        plan_key=${plan.key}, price_id=${priceId}, subscription_event_at=${occurredAt}::timestamptz
      WHERE key_hash=${existing[0].key_hash}
    `;
  } else {
    const key = makeTrameKey();
    await sql`
      INSERT INTO trame_licenses(key_hash,key_cipher,plan_key,price_id,paddle_transaction_id,paddle_subscription_id,
        customer_email,expires_at,max_devices,status,subscription_status,subscription_event_at)
      VALUES (${hashKey(key)},${encryptKey(key)},${plan.key},${priceId},${transactionId},${subscriptionId},
        ${email},${expiresAt}::timestamptz,1,'active',${subscriptionId ? "active" : null},${subscriptionId ? occurredAt : null}::timestamptz)
      ON CONFLICT DO NOTHING
    `;
    const rows = await sql`SELECT * FROM trame_licenses WHERE paddle_transaction_id=${transactionId} LIMIT 1`;
    if (rows[0] && !rows[0].email_sent_at) {
      await deliverTrameLicense(email, decryptKey(rows[0].key_cipher), plan, transactionId);
      await sql`UPDATE trame_licenses SET email_sent_at=NOW() WHERE key_hash=${rows[0].key_hash}`;
    }
  }

  await sql`INSERT INTO trame_webhook_events(event_id,event_type) VALUES (${eventId},${eventType}) ON CONFLICT DO NOTHING`;
  return Response.json({ received: true, fulfilled: true, renew_url: TRAME_RENEW_URL }, { headers: { "Cache-Control": "no-store" } });
}
