import { createHmac, timingSafeEqual } from "node:crypto";
import { db, ensureLicenseSchema } from "../../../../lib/db";
import { decryptLicenseKey, deliverLicense, encryptLicenseKey, hashLicenseKey, makeLicenseKey, planForPrice } from "../../../../lib/license";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 15;

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

export async function POST(request) {
  const rawBody = await request.text();
  const secret = process.env.PADDLE_NOTIFICATION_SECRET;
  if (!signatureIsValid(rawBody, request.headers.get("paddle-signature"), secret)) {
    return Response.json({ error: "invalid_signature" }, { status: 401 });
  }

  let event;
  try { event = JSON.parse(rawBody); }
  catch { return Response.json({ error: "invalid_json" }, { status: 400 }); }

  const eventId = String(event?.event_id || "");
  const eventType = String(event?.event_type || "");
  if (!eventId || eventId.length > 200) return Response.json({ error: "missing_event_id" }, { status: 400 });

  const sql = db();
  await ensureLicenseSchema(sql);
  const seen = await sql`SELECT event_id FROM paddle_webhook_events WHERE event_id = ${eventId} LIMIT 1`;
  if (seen.length) return Response.json({ received: true, duplicate: true });

  if (eventType !== "transaction.completed") {
    await sql`INSERT INTO paddle_webhook_events(event_id,event_type) VALUES (${eventId},${eventType}) ON CONFLICT DO NOTHING`;
    return Response.json({ received: true, ignored: true });
  }

  const transaction = event?.data || {};
  if (transaction.status !== "completed") return Response.json({ error: "transaction_not_completed" }, { status: 400 });
  const transactionId = String(transaction.id || "");
  const items = Array.isArray(transaction.items) ? transaction.items : [];
  if (!transactionId || items.length !== 1) return Response.json({ error: "invalid_transaction_items" }, { status: 400 });
  const priceId = items[0]?.price_id || items[0]?.price?.id;
  const plan = planForPrice(priceId);
  if (!plan) return Response.json({ error: "unknown_price_id" }, { status: 400 });

  const email = String(transaction.customer?.email || transaction.billing_details?.email || transaction.customer_email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return Response.json({ error: "missing_customer_email" }, { status: 400 });

  let licenses = await sql`SELECT * FROM nova_licenses WHERE paddle_transaction_id = ${transactionId} LIMIT 1`;
  if (!licenses.length) {
    const key = makeLicenseKey();
    const keyHash = hashLicenseKey(key);
    const expiresAt = new Date(Date.now() + plan.days * 24 * 60 * 60 * 1000).toISOString();
    await sql`
      INSERT INTO nova_licenses(key_hash,key_cipher,plan_key,variant_id,paddle_transaction_id,customer_email,expires_at,max_activations)
      VALUES (${keyHash},${encryptLicenseKey(key)},${plan.key},${priceId},${transactionId},${email},${expiresAt},${plan.activations})
      ON CONFLICT (paddle_transaction_id) DO NOTHING
    `;
    licenses = await sql`SELECT * FROM nova_licenses WHERE paddle_transaction_id = ${transactionId} LIMIT 1`;
  }
  const license = licenses[0];
  await deliverLicense(license.customer_email, decryptLicenseKey(license.key_cipher), plan, transactionId);
  await sql`INSERT INTO paddle_webhook_events(event_id,event_type) VALUES (${eventId},${eventType}) ON CONFLICT DO NOTHING`;
  return Response.json({ received: true, fulfilled: true }, { headers: { "Cache-Control": "no-store" } });
}
