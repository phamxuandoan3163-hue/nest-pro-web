import { createHmac, timingSafeEqual } from "node:crypto";
import { db } from "../../../../../lib/db";
import { decryptLicenseKey, deliverLicense, encryptLicenseKey, hashLicenseKey, makeLicenseKey, planForPrice } from "../../../../../lib/license";

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

function eventItems(transaction) {
  if (Array.isArray(transaction.items) && transaction.items.length) return transaction.items;
  return Array.isArray(transaction.details?.line_items) ? transaction.details.line_items : [];
}

function priceIdFor(item) {
  return item?.price_id || item?.price?.id || null;
}

function paddleApiBase() {
  if (process.env.PADDLE_ENVIRONMENT === "sandbox") return "https://sandbox-api.paddle.com";
  if (process.env.PADDLE_ENVIRONMENT === "live") return "https://api.paddle.com";
  throw new Error("PADDLE_ENVIRONMENT must be explicitly set to sandbox or live.");
}

async function transactionCustomerEmail(transaction, existingLicense) {
  const savedEmail = String(existingLicense?.customer_email || "").trim().toLowerCase();
  if (savedEmail) return savedEmail;
  let email = String(transaction.customer?.email || transaction.billing_details?.email || transaction.customer_email || "").trim().toLowerCase();
  if (email) return email;

  const customerId = String(transaction.customer_id || "");
  const apiKey = process.env.PADDLE_API_KEY;
  if (!customerId || !apiKey) throw new Error("A Paddle API key with customer.read is required when the webhook payload omits the customer email.");
  const response = await fetch(paddleApiBase() + "/customers/" + encodeURIComponent(customerId), {
    headers: { Authorization: "Bearer " + apiKey, Accept: "application/json" },
    cache: "no-store"
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.data?.email) throw new Error("Paddle customer lookup failed.");
  email = String(payload.data.email).trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Paddle returned an invalid customer email.");
  return email;
}

async function syncSubscriptionEvent(sql, event, eventType) {
  const subscription = event?.data || {};
  const subscriptionId = String(subscription.id || "");
  if (!subscriptionId) return { ignored: true, reason: "missing_subscription_id" };

  const existingRows = await sql`SELECT * FROM nova_licenses WHERE paddle_subscription_id=${subscriptionId} LIMIT 1`;
  const existing = existingRows[0];
  if (!existing) return { ignored: true, reason: "subscription_license_not_created_yet" };

  const occurredAt = String(event.occurred_at || new Date().toISOString());
  const currentStatus = eventType === "subscription.canceled"
    ? "canceled"
    : String(subscription.status || eventType.slice("subscription.".length));
  const periodEnd = subscription.current_billing_period?.ends_at || existing.expires_at;
  const scheduledChange = subscription.scheduled_change || null;
  const scheduledCancelAt = scheduledChange?.action === "cancel" ? scheduledChange.effective_at || null : null;
  const mappedItem = Array.isArray(subscription.items) ? subscription.items[0] : null;
  const newPriceId = priceIdFor(mappedItem);
  const plan = newPriceId ? planForPrice(newPriceId) : null;
  const periodEndMs = new Date(periodEnd).getTime();
  const accessStatus = ["active", "trialing"].includes(currentStatus)
    || (currentStatus === "past_due" && Number.isFinite(periodEndMs) && periodEndMs > Date.now());
  const licenseStatus = accessStatus ? "active" : "revoked";

  const updated = await sql`
    UPDATE nova_licenses SET
      plan_key=COALESCE(${plan?.key || null},plan_key),
      variant_id=COALESCE(${newPriceId},variant_id),
      expires_at=COALESCE(${periodEnd || null}::timestamptz,expires_at),
      max_activations=COALESCE(${plan?.activations || null},max_activations),
      status=${licenseStatus},
      subscription_status=${currentStatus},
      scheduled_cancel_at=${scheduledCancelAt}::timestamptz,
      subscription_event_at=${occurredAt}::timestamptz
    WHERE paddle_subscription_id=${subscriptionId}
      AND (subscription_event_at IS NULL OR subscription_event_at < ${occurredAt}::timestamptz)
    RETURNING key_hash
  `;
  return { synced: updated.length > 0, stale: updated.length === 0, status: currentStatus, license_status: licenseStatus };
}

export async function POST(request) {
  const startedAt = Date.now();
  const mark = (step) => console.log(JSON.stringify({ webhook_step: step, ms: Date.now() - startedAt }));
  const rawBody = await request.text();
  if (!signatureIsValid(rawBody, request.headers.get("paddle-signature"), process.env.PADDLE_NOTIFICATION_SECRET)) {
    return Response.json({ error: "invalid_signature" }, { status: 401 });
  }

  let event;
  try { event = JSON.parse(rawBody); }
  catch { return Response.json({ error: "invalid_json" }, { status: 400 }); }

  const eventId = String(event?.event_id || "");
  const eventType = String(event?.event_type || "");
  if (!eventId || eventId.length > 200) return Response.json({ error: "missing_event_id" }, { status: 400 });

  mark("verified:" + eventType);
  const sql = db();
  const seen = await sql`SELECT event_id FROM paddle_webhook_events WHERE event_id = ${eventId} LIMIT 1`;
  mark("dedupe_checked");
  if (seen.length) return Response.json({ received: true, duplicate: true });

  if (eventType.startsWith("subscription.")) {
    const result = await syncSubscriptionEvent(sql, event, eventType);
    mark("subscription_synced");
    await sql`INSERT INTO paddle_webhook_events(event_id,event_type) VALUES (${eventId},${eventType}) ON CONFLICT DO NOTHING`;
    mark("done");
    return Response.json({ received: true, ...result }, { headers: { "Cache-Control": "no-store" } });
  }

  if (eventType !== "transaction.completed") {
    await sql`INSERT INTO paddle_webhook_events(event_id,event_type) VALUES (${eventId},${eventType}) ON CONFLICT DO NOTHING`;
    return Response.json({ received: true, ignored: true });
  }

  const transaction = event?.data || {};
  if (transaction.status !== "completed") return Response.json({ error: "transaction_not_completed" }, { status: 400 });
  const transactionId = String(transaction.id || "");
  const items = eventItems(transaction);
  if (!transactionId || items.length !== 1 || Number(items[0]?.quantity || 1) !== 1) {
    return Response.json({ error: "invalid_transaction_items" }, { status: 400 });
  }

  const item = items[0];
  const priceId = priceIdFor(item);
  const plan = planForPrice(priceId);
  if (!plan) return Response.json({ error: "unknown_price_id" }, { status: 400 });

  const subscriptionId = plan.recurring ? String(transaction.subscription_id || "") : null;
  const periodEnd = item?.billing_period?.ends_at || transaction.billing_period?.ends_at || null;
  if (plan.recurring && (!subscriptionId || !periodEnd || !Number.isFinite(new Date(periodEnd).getTime()))) {
    return Response.json({ error: "subscription_period_missing" }, { status: 500 });
  }
  const occurredAt = String(event.occurred_at || new Date().toISOString());

  let existingRows = plan.recurring
    ? await sql`SELECT * FROM nova_licenses WHERE paddle_subscription_id=${subscriptionId} LIMIT 1`
    : await sql`SELECT * FROM nova_licenses WHERE paddle_transaction_id=${transactionId} LIMIT 1`;
  const existingLicense = existingRows[0] || null;
  mark("license_looked_up");
  const email = await transactionCustomerEmail(transaction, existingLicense);
  mark("customer_email_resolved");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "invalid_customer_email" }, { status: 502 });
  }

  const expiresAt = plan.recurring
    ? periodEnd
    : new Date(Date.now() + plan.days * 24 * 60 * 60 * 1000).toISOString();
  if (existingLicense) {
    if (!plan.recurring || !existingLicense.subscription_event_at || new Date(existingLicense.subscription_event_at).getTime() < new Date(occurredAt).getTime()) {
      await sql`
        UPDATE nova_licenses SET
          plan_key=${plan.key},
          variant_id=${priceId},
          paddle_transaction_id=${transactionId},
          customer_email=${email},
          expires_at=${expiresAt}::timestamptz,
          max_activations=${plan.activations},
          status='active',
          subscription_status=${plan.recurring ? "active" : null},
          subscription_event_at=${plan.recurring ? occurredAt : null}::timestamptz
        WHERE key_hash=${existingLicense.key_hash}
      `;
    }
  } else {
    const key = makeLicenseKey();
    await sql`
      INSERT INTO nova_licenses(
        key_hash,key_cipher,plan_key,variant_id,paddle_transaction_id,paddle_subscription_id,
        customer_email,expires_at,max_activations,status,subscription_status,subscription_event_at
      )
      VALUES (
        ${hashLicenseKey(key)},${encryptLicenseKey(key)},${plan.key},${priceId},${transactionId},${subscriptionId},
        ${email},${expiresAt}::timestamptz,${plan.activations},'active',
        ${plan.recurring ? "active" : null},${plan.recurring ? occurredAt : null}::timestamptz
      )
      ON CONFLICT DO NOTHING
    `;
  }

  existingRows = plan.recurring
    ? await sql`SELECT * FROM nova_licenses WHERE paddle_subscription_id=${subscriptionId} LIMIT 1`
    : await sql`SELECT * FROM nova_licenses WHERE paddle_transaction_id=${transactionId} LIMIT 1`;
  const license = existingRows[0];
  mark("license_persisted");
  if (!license) return Response.json({ error: "license_not_persisted" }, { status: 500 });

  if (!license.license_email_sent_at) {
    await deliverLicense(license.customer_email, decryptLicenseKey(license.key_cipher), plan, transactionId);
    await sql`UPDATE nova_licenses SET license_email_sent_at=NOW() WHERE key_hash=${license.key_hash} AND license_email_sent_at IS NULL`;
    mark("email_sent");
  }

  await sql`INSERT INTO paddle_webhook_events(event_id,event_type) VALUES (${eventId},${eventType}) ON CONFLICT DO NOTHING`;
  mark("done");
  return Response.json({ received: true, fulfilled: true, recurring: Boolean(plan.recurring) }, { headers: { "Cache-Control": "no-store" } });
}
