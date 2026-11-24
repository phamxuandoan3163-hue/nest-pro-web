import { createCipheriv, createDecipheriv, createHash, createPrivateKey, createPublicKey, randomBytes, sign } from "node:crypto";

export const TRAME_RENEW_URL = "https://ainovanesting.pro/trame-preview#pricing";
export const TRAME_TRIAL_MS = 7 * 24 * 60 * 60 * 1000;

// Paddle price IDs for the NOVA Trame product (product pro_01m7qg72cfttxg8jtz5jbn3zj1).
const PLANS = {
  // Live price IDs
  pri_01m7qg72fmshh1rbjncv4t5ywd: { key: "monthly", days: 30, recurring: true, label: "Monthly" },
  pri_01m7qg72k6fhnz3e50yt55wf6k: { key: "yearly", days: 365, recurring: true, label: "Yearly" },
  pri_01m7qg72p299r0vcmdm7ecqs9v: { key: "yearly_pro", days: 365, recurring: true, label: "Yearly Pro" },
  // Sandbox price IDs (for test-mode purchases)
  pri_01m7rwz94rp0hp0dhbmeneeda3: { key: "monthly", days: 30, recurring: true, label: "Monthly" },
  pri_01m7rx0ne8fb176wcf36ksecsa: { key: "yearly", days: 365, recurring: true, label: "Yearly" },
  pri_01m7rx1vyr86287gw855bhb00q: { key: "yearly_pro", days: 365, recurring: true, label: "Yearly Pro" }
};

// Style groups unlocked by each plan. Keys match the plugin's group ids.
const GROUPS = {
  trial: ["basic"],
  monthly: ["basic", "street", "shape", "pattern"],
  yearly: ["basic", "street", "shape", "pattern", "trend"],
  yearly_pro: ["basic", "street", "shape", "pattern", "trend", "vintage", "color"]
};

export function planForPrice(priceId) {
  return PLANS[String(priceId || "")] || null;
}

export function groupsFor(planKey) {
  return GROUPS[planKey] || [];
}

export function makeTrameKey() {
  const raw = randomBytes(20).toString("hex").toUpperCase();
  return "TRAME-" + raw.match(/.{1,5}/g).join("-");
}

export function hashKey(key) {
  return createHash("sha256").update(String(key).trim().toUpperCase()).digest("hex");
}

// Device IDs are hashed before storage so the database never holds the raw machine identifier.
export function hashDevice(deviceId) {
  return createHash("sha256").update("trame-device:" + String(deviceId).trim()).digest("hex");
}

function encryptionKey() {
  const value = String(process.env.TRAME_LICENSE_ENCRYPTION_KEY || "").trim();
  if (!value) throw new Error("TRAME_LICENSE_ENCRYPTION_KEY is not set.");
  // A 64-char hex string is used directly; any other non-empty value is hashed
  // to a stable 32-byte key, so the env var does not have to be hex.
  if (/^[a-f0-9]{64}$/i.test(value)) return Buffer.from(value, "hex");
  return createHash("sha256").update(value).digest();
}

export function encryptKey(key) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(key, "utf8"), cipher.final()]);
  return [iv.toString("hex"), cipher.getAuthTag().toString("hex"), encrypted.toString("hex")].join(".");
}

export function decryptKey(value) {
  const [ivHex, tagHex, dataHex] = String(value || "").split(".");
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  return Buffer.concat([decipher.update(Buffer.from(dataHex, "hex")), decipher.final()]).toString("utf8");
}

// The response carries an Ed25519 signature. The plugin holds only the public key,
// so it can check that a cached entitlement was issued by the server and has not been edited.
export function signEntitlement(payload) {
  const pem = String(process.env.TRAME_SIGNING_PRIVATE_KEY || "").replace(/\\n/g, "\n");
  if (!pem.includes("PRIVATE KEY")) throw new Error("TRAME_SIGNING_PRIVATE_KEY is not configured.");
  const body = Buffer.from(JSON.stringify(payload), "utf8");
  return sign(null, body, createPrivateKey(pem)).toString("base64");
}

// Raw 32-byte Ed25519 public key (base64) that the plugin embeds to verify offline codes.
export function publicKeyB64() {
  const pem = String(process.env.TRAME_SIGNING_PRIVATE_KEY || "").replace(/\\n/g, "\n");
  if (!pem.includes("PRIVATE KEY")) throw new Error("TRAME_SIGNING_PRIVATE_KEY is not configured.");
  const der = createPublicKey(createPrivateKey(pem)).export({ type: "spki", format: "der" });
  return der.slice(der.length - 32).toString("base64");
}

// Offline activation code: base64(payloadJSON) + "." + base64(signature over those exact bytes).
// The panel decodes the first part to raw bytes, verifies the signature over them, then parses JSON.
export function makeOfflineToken(payload) {
  const pem = String(process.env.TRAME_SIGNING_PRIVATE_KEY || "").replace(/\\n/g, "\n");
  if (!pem.includes("PRIVATE KEY")) throw new Error("TRAME_SIGNING_PRIVATE_KEY is not configured.");
  const body = Buffer.from(JSON.stringify(payload), "utf8");
  const signature = sign(null, body, createPrivateKey(pem));
  return body.toString("base64") + "." + signature.toString("base64");
}

// Grace token for offline use (panel 1.3.2+): same signed format as an offline code, marked
// typ "grace". The panel allows offline use for 24 hours after issued_at, and refuses to accept
// a grace token as an offline activation code (or an offline code as a grace token).
export function makeGraceToken(payload) {
  return makeOfflineToken({ ...payload, typ: "grace" });
}

export async function deliverTrameLicense(email, key, plan, reference) {
  if (!process.env.RESEND_API_KEY || !process.env.LICENSE_EMAIL_FROM) throw new Error("RESEND_API_KEY and LICENSE_EMAIL_FROM are required.");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + process.env.RESEND_API_KEY,
      "Content-Type": "application/json",
      "Idempotency-Key": "trame-license-" + reference
    },
    body: JSON.stringify({
      from: process.env.LICENSE_EMAIL_FROM,
      to: [email],
      subject: "Your NOVA Trame Studio license",
      text: [
        "Thank you for purchasing NOVA Trame Studio.",
        "",
        "Plan: " + plan.label,
        "License key: " + key,
        plan.recurring ? "Billing: " + (plan.days === 30 ? "monthly" : "yearly") + ". Access renews while the subscription is active." : "Valid for: " + plan.days + " days",
        "Devices: 1",
        "",
        "Open NOVA Trame Studio in Photoshop and enter this key to activate your computer.",
        "Order reference: " + reference
      ].join("\n")
    })
  });
  if (!response.ok) throw new Error("Trame license email failed with HTTP " + response.status + ".");
}
