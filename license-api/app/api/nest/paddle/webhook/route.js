import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { NEST_RENEW_URL, decryptKey, deliverNestLicense, encryptKey, hashKey, makeNestKey, nestDb, planForPrice } from "../../../../../lib/nest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

function signatureIsValid(rawBody, header, secret) {
  secret = String(secret || "").trim();   // a pasted secret often carries a trailing space or newline
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

function paddleApiBase() {
  return process.env.PADDLE_ENVIRONMENT === "live" ? "https://api.paddle.com" : "https://sandbox-api.paddle.com";
}

async function emailFrom(transaction) {
  let email = String(transaction.customer?.email || transaction.billing_details?.email || transaction.customer_email || "").trim().toLowerCase();
  if (!email && transaction.customer_id && process.env.PADDLE_API_KEY) {
    const response = await fetch(paddleApiBase() + "/customers/" + encodeURIComponent(String(transaction.customer_id)), {
      headers: { Authorization: "Bearer " + process.env.PADDLE_API_KEY, Accept: "application/json" },
      cache: "no-store"
    });
    const payload = await response.json().catch(() => null);
    email = String(payload?.data?.email || "").trim().toLowerCase();
  }
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

export async function POST(request) {
  const rawBody = await request.text();
  if (!signatureIsValid(rawBody, request.headers.get("paddle-signature"), process.env.NEST_NOTIFICATION_SECRET)) {
    return Response.json({ error: "invalid_signature" }, { status: 401 });
  }
  let event;
  try { event = JSON.parse(rawBody); } catch { return Response.json({ error: "invalid_json" }, { status: 400 }); }

  const eventId = String(event?.event_id || "");
  const eventType = String(event?.event_type || "");
  if (!eventId || eventId.length > 200) return Response.json({ error: "missing_event_id" }, { status: 400 });

  const sql = await nestDb();
  const seen = await sql`SELECT event_id FROM nest_webhook_events WHERE event_id=${eventId} LIMIT 1`;
  if (seen[0]) return Response.json({ received: true, duplicate: true });
  const occurredAt = String(event.occurred_at || new Date().toISOString());

  if (eventType.startsWith("subscription.")) {
    const sub = event.data || {};
    const subscriptionId = String(sub.id || "");
    const periodEnd = sub.current_billing_period?.ends_at || null;
    if (subscriptionId) {
      // Cancelling stops renewal only; access runs until the paid period ends (expires_at).
      await sql`
        UPDATE nest_licenses SET
          subscription_status=${String(sub.status || eventType.slice(13))},
          expires_at=COALESCE(${periodEnd}::timestamptz, expires_at),
          subscription_event_at=${occurredAt}::timestamptz
        WHERE paddle_subscription_id=${subscriptionId}
          AND (subscription_event_at IS NULL OR subscription_event_at < ${occurredAt}::timestamptz)
      `;
    }
    await sql`INSERT INTO nest_webhook_events(event_id,event_type) VALUES (${eventId},${eventType}) ON CONFLICT DO NOTHING`;
    return Response.json({ received: true });
  }

  // Refunds and chargebacks arrive as Paddle "adjustments". Only a fully approved refund or any approved
  // chargeback takes the licence away; partial refunds, pending, rejected or reversed ones change nothing.
  // The licence is matched by the transaction that was refunded (the latest purchase on the key).
  if (eventType.startsWith("adjustment.")) {
    const adj = event.data || {};
    const action = String(adj.action || "");
    const approved = String(adj.status || "") === "approved";
    const full = String(adj.type || "full") === "full";
    const takesAccessAway = approved && ((action === "refund" && full) || action === "chargeback" || action === "chargeback_warranty");
    const refundedTxn = String(adj.transaction_id || "");
    let revoked = 0;
    if (takesAccessAway && refundedTxn) {
      const rows = await sql`
        UPDATE nest_licenses SET status='revoked'
        WHERE paddle_transaction_id=${refundedTxn} AND status != 'revoked'
        RETURNING key_hash
      `;
      revoked = rows.length;
    }
    await sql`INSERT INTO nest_webhook_events(event_id,event_type) VALUES (${eventId},${eventType}) ON CONFLICT DO NOTHING`;
    return Response.json({ received: true, revoked });
  }

  if (eventType !== "transaction.completed") {
    await sql`INSERT INTO nest_webhook_events(event_id,event_type) VALUES (${eventId},${eventType}) ON CONFLICT DO NOTHING`;
    return Response.json({ received: true, ignored: true });
  }

  const transaction = event.data || {};
  const item = firstItem(transaction);
  const priceId = item?.price_id || item?.price?.id || null;
  const plan = planForPrice(priceId);
  if (!item || !plan) return Response.json({ error: "unknown_price_id" }, { status: 400 });

  const transactionId = String(transaction.id || "");
  // One-time purchases have no subscription id: keep it null (an empty string would collide on the UNIQUE column).
  const subscriptionId = plan.recurring ? (String(transaction.subscription_id || "").trim() || null) : null;
  const periodEnd = item.billing_period?.ends_at || transaction.billing_period?.ends_at || null;
  const expiresAt = plan.recurring && periodEnd
    ? periodEnd
    : new Date(Date.now() + plan.days * 24 * 60 * 60 * 1000).toISOString();
  const email = await emailFrom(transaction);
  if (!email) return Response.json({ error: "invalid_customer_email" }, { status: 502 });

  let existing = subscriptionId
    ? await sql`SELECT * FROM nest_licenses WHERE paddle_subscription_id=${subscriptionId} LIMIT 1`
    : await sql`SELECT * FROM nest_licenses WHERE paddle_transaction_id=${transactionId} LIMIT 1`;

  // These plans are one-time purchases: there is no Paddle subscription to renew, so a customer
  // "renews" by buying again, which arrives as a brand-new transaction. Extend their existing key by
  // e-mail instead of minting a second, orphaned one they'd have to notice and re-enter in the panel.
  // Skipped once the key has been revoked (e.g. refunded): that purchase starts a fresh key.
  let renewingByEmail = false;
  if (!existing[0] && !subscriptionId) {
    const prior = await sql`
      SELECT * FROM nest_licenses WHERE customer_email=${email} AND status != 'revoked'
      ORDER BY created_at DESC LIMIT 1
    `;
    if (prior[0]) { existing = prior; renewingByEmail = true; }
  }

  if (existing[0]) {
    // Renewing early keeps whatever time is left instead of losing it; renewing after it lapsed
    // starts the new term from now. Paddle-driven subscription renewals keep using their own periodEnd.
    const renewedExpiresAt = renewingByEmail
      ? new Date(Math.max(new Date(existing[0].expires_at).getTime(), Date.now()) + plan.days * 24 * 60 * 60 * 1000).toISOString()
      : expiresAt;
    await sql`
      UPDATE nest_licenses SET expires_at=${renewedExpiresAt}::timestamptz, status='active',
        plan_key=${plan.key}, price_id=${priceId}, max_devices=GREATEST(max_devices, ${plan.devices || 1}),
        paddle_transaction_id=${renewingByEmail ? transactionId : existing[0].paddle_transaction_id},
        subscription_event_at=${occurredAt}::timestamptz
      WHERE key_hash=${existing[0].key_hash}
    `;
    // A Paddle retry after a failed first e-mail lands here: send the key if it was never sent.
    // The license itself is already saved above, so a delivery failure (Resend down, misconfigured
    // sender, etc.) must not turn into a 500: that would make Paddle retry the whole event forever
    // and the fulfilled purchase would never be acknowledged. Log it and let the next retry try again.
    if (!existing[0].email_sent_at) {
      try {
        await deliverNestLicense(email, decryptKey(existing[0].key_cipher), plan, existing[0].paddle_transaction_id || transactionId);
        await sql`UPDATE nest_licenses SET email_sent_at=NOW() WHERE key_hash=${existing[0].key_hash}`;
      } catch (e) {
        console.error("nest webhook: license e-mail delivery failed (will retry on next webhook):", e);
      }
    }
  } else {
    const key = makeNestKey();
    await sql`
      INSERT INTO nest_licenses(key_hash,key_cipher,plan_key,price_id,paddle_transaction_id,paddle_subscription_id,
        customer_email,expires_at,max_devices,status,subscription_status,subscription_event_at)
      VALUES (${hashKey(key)},${encryptKey(key)},${plan.key},${priceId},${transactionId},${subscriptionId},
        ${email},${expiresAt}::timestamptz,${plan.devices || 1},'active',${subscriptionId ? "active" : null},${subscriptionId ? occurredAt : null}::timestamptz)
      ON CONFLICT DO NOTHING
    `;
    const rows = await sql`SELECT * FROM nest_licenses WHERE paddle_transaction_id=${transactionId} LIMIT 1`;
    if (rows[0] && !rows[0].email_sent_at) {
      try {
        await deliverNestLicense(email, decryptKey(rows[0].key_cipher), plan, transactionId);
        await sql`UPDATE nest_licenses SET email_sent_at=NOW() WHERE key_hash=${rows[0].key_hash}`;
      } catch (e) {
        console.error("nest webhook: license e-mail delivery failed (will retry on next webhook):", e);
      }
    }
  }

  await sql`INSERT INTO nest_webhook_events(event_id,event_type) VALUES (${eventId},${eventType}) ON CONFLICT DO NOTHING`;
  return Response.json({ received: true, fulfilled: true, renew_url: NEST_RENEW_URL }, { headers: { "Cache-Control": "no-store" } });
}
