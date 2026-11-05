# NovaNesting Paddle Sandbox licensing

This branch adds a Paddle Sandbox checkout and license fulfillment path. Keep it in preview until the checkout, webhook, email, and CEP activation flow have passed the checklist below. The website code intentionally initializes Paddle.js in **Sandbox** mode.

## Sandbox catalog

Product:
- Nova-Nesting — `pro_01m6p22f2sz05sx2n0vqfkfgxq`

Prices:
- Monthly, $9.90, 30 days, 1 device — `pri_01m6p22fft85kps6amjeca7jnh`
- Annual, $63.90, 365 days, 1 device — `pri_01m6p22fr8gvdze7nqpc4v0mz8`
- Annual Pro, $95.90, 365 days, 2 devices — `pri_01m6p22gqb9n68a73ggqdcvsm`

These are one-time purchases. The 7-day free trial is not a Paddle price in this integration.

## Configure the license API preview

Use the Vercel project `nest-pro-license-api` and set these variables in **Preview** only:

- `PADDLE_ENVIRONMENT=sandbox`
- `DATABASE_URL`: PostgreSQL connection string for the license database
- `PADDLE_NOTIFICATION_SECRET`: signing secret from the Sandbox notification destination
- `LICENSE_ENCRYPTION_KEY`: 32 random bytes as 64 hexadecimal characters; preserve it for key recovery
- `RESEND_API_KEY` and `LICENSE_EMAIL_FROM`: transactional email credentials and a verified sender
- `LICENSE_ALLOWED_ORIGINS=https://ainovanesting.pro,https://www.ainovanesting.pro,null`

The email sender's domain must be verified with the email provider. Do not put the Paddle API key or notification secret in frontend code.

## Configure the website preview

In the website project's **Preview** environment, set `NEXT_PUBLIC_PADDLE_SANDBOX_CLIENT_TOKEN` to a client-side token created in Paddle Sandbox. The site loads Paddle.js in Sandbox mode and uses only the three Sandbox price IDs above.

## Register a Sandbox notification destination

After the license API preview has a stable URL, add a notification destination in the Paddle Sandbox dashboard:

- URL: `https://<license-api-preview-host>/api/rest/paddle/webhook`
- Event: `transaction.completed`

Copy the destination's signing secret into the matching Preview environment variable. Do not point Paddle Live notifications at this preview URL.

## License API contract

- `POST /api/rest/license/activate` — activate a purchased key on one device, rejecting activations beyond the plan limit
- `POST /api/rest/license/validate` — verify expiry, status, and the device activation
- `POST /api/rest/license/deactivate` — release one device seat
- `POST /api/rest/paddle/webhook` — verify `Paddle-Signature`, accept only completed known-price transactions, issue a random key, store its hash plus encrypted delivery copy, and email it

The webhook is idempotent by Paddle event and transaction IDs. The API stores license keys encrypted for email retries and stores SHA-256 hashes for activation lookup. Device activation serializes on the license row so simultaneous requests cannot exceed the purchased seat count.

## Sandbox verification checklist

1. Confirm the checkout page shows the three Sandbox prices and opens a Paddle Sandbox checkout.
2. Complete each plan using Paddle's Sandbox test payment flow.
3. Confirm Paddle sends one `transaction.completed` notification per purchase and the endpoint returns success.
4. Confirm the buyer receives a key email; verify the key activates on one device for Monthly/Annual and two devices for Annual Pro.
5. Verify the next device is rejected at the plan limit, deactivation releases a seat, and expired/revoked keys fail validation.
6. Replay a completed notification and confirm it does not create another key or email delivery.
7. Inspect Preview logs and database; do not log or expose license keys.

Do not switch `PADDLE_ENVIRONMENT` to `live`, deploy these buttons to production, or open checkout to real customers until Sandbox verification is complete and the user's migration guardrail is explicitly satisfied.
