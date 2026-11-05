import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

export const STORE_ID = "500658";
export const PRODUCT_ID = "1449378";

const sandboxPlans = {
  "pri_01m6p22fft85kps6amjeca7jnh": { key: "monthly", days: 30, activations: 1, label: "30-Day License" },
  "pri_01m6p22fr8gvdze7nqpc4v0mz8": { key: "annual", days: 365, activations: 1, label: "1-Year License" },
  "pri_01m6p22gqb9n68a73ggqdcvsm": { key: "annual_pro", days: 365, activations: 2, label: "1-Year Pro License" }
};
const livePlans = {
  "pri_01m6p0xa84j4whhqbv1cy41098": { key: "monthly", days: 30, activations: 1, label: "30-Day License" },
  "pri_01m6p0xajv913pfmn9e6mkv17v": { key: "annual", days: 365, activations: 1, label: "1-Year License" },
  "pri_01m6p0xawy63yr90bqnk3rm2bq": { key: "annual_pro", days: 365, activations: 2, label: "1-Year Pro License" }
};

export function planForPrice(priceId) {
  const plans = process.env.PADDLE_ENVIRONMENT === "live" ? livePlans : sandboxPlans;
  return plans[String(priceId || "")] || null;
}

function encryptionKey() {
  const value = String(process.env.LICENSE_ENCRYPTION_KEY || "");
  if (!/^[a-f0-9]{64}$/i.test(value)) throw new Error("LICENSE_ENCRYPTION_KEY must be 32 bytes encoded as 64 hex characters.");
  return Buffer.from(value, "hex");
}

export function makeLicenseKey() {
  const raw = randomBytes(20).toString("hex").toUpperCase();
  return "NOVA-" + raw.match(/.{1,5}/g).join("-");
}

export function hashLicenseKey(key) {
  return createHash("sha256").update(String(key).trim().toUpperCase()).digest("hex");
}

export function encryptLicenseKey(key) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(key, "utf8"), cipher.final()]);
  return [iv.toString("hex"), cipher.getAuthTag().toString("hex"), encrypted.toString("hex")].join(".");
}

export function decryptLicenseKey(value) {
  const [ivHex, tagHex, dataHex] = String(value || "").split(".");
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  return Buffer.concat([decipher.update(Buffer.from(dataHex, "hex")), decipher.final()]).toString("utf8");
}

export async function deliverLicense(email, key, plan, transactionId) {
  if (!process.env.RESEND_API_KEY || !process.env.LICENSE_EMAIL_FROM) throw new Error("RESEND_API_KEY and LICENSE_EMAIL_FROM are required for fulfillment.");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + process.env.RESEND_API_KEY,
      "Content-Type": "application/json",
      "Idempotency-Key": "nova-license-" + transactionId
    },
    body: JSON.stringify({
      from: process.env.LICENSE_EMAIL_FROM,
      to: [email],
      subject: "Your Nova Nesting license",
      text: [
        "Thank you for your Nova Nesting purchase.",
        "",
        "Plan: " + plan.label,
        "License key: " + key,
        "Valid for: " + plan.days + " days",
        "Devices: " + plan.activations,
        "",
        "Open Nova Nesting in Illustrator and enter this key to activate your device.",
        "Order reference: " + transactionId
      ].join("\n")
    })
  });
  if (!response.ok) throw new Error("License email delivery failed with HTTP " + response.status + ".");
}
