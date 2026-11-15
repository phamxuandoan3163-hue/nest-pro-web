# Nova Nesting Paddle Sandbox licensing

This branch uses Paddle Sandbox for the Nova Nesting pricing page and license fulfillment. Keep it in Preview until the end-to-end checklist passes. The page initializes Paddle.js in Sandbox mode, shows Paddle-localized totals, opens a one-page overlay, and redirects to /welcome after successful checkout.

## Sandbox catalog

Product: Nova-Nesting — pro_01m6p22f2sz05sx2n0vqfkfgxq

All six active prices are recurring subscriptions. Amounts below are the USD catalog amounts before any location-based tax; the page and checkout show Paddle formatted localized totals.

| Tier | Monthly price | Monthly price ID | Yearly price | Yearly price ID |
| --- | ---: | --- | ---: | --- |
| Starter | $9.90/month | pri_01m7dhh5w6s5p813d21czxhxsk | $42/year | pri_01m7dhh649rzh6vwg49j3aprkc |
| Pro | $9.90/month | pri_01m7dhh6chhq7byvejq080tr9h | $63.90/year | pri_01m7dhh6mb1w7becawn2dja6s8 |
| Advanced | $9.90/month | pri_01m7dhh6vrjrsm1z12y8g3ahe3 | $95.90/year | pri_01m7dhh73b6hva9sv9qv1brrnc |

Starter and Pro allow one device activation. Advanced allows two. The backend still recognizes the three older one-time Sandbox prices for compatibility, but the pricing page uses the six recurring prices above.

## License API Preview configuration

Set these in Vercel project nest-pro-license-api, Preview only, scoped to branch codex/paddle-sandbox-licensing:

- PADDLE_ENVIRONMENT=sandbox
- PADDLE_API_KEY: Sandbox server key with customer.read only. Used only when the signed transaction notification does not include the customer email.
- DATABASE_URL: PostgreSQL connection string for Supabase.
- PADDLE_NOTIFICATION_SECRET: signing secret for the Sandbox notification destination.
- LICENSE_ENCRYPTION_KEY: 32 random bytes encoded as 64 hex characters; keep stable for license recovery.
- RESEND_API_KEY and LICENSE_EMAIL_FROM: a Resend sending key restricted to the verified sender domain, and a verified from address.
- LICENSE_ALLOWED_ORIGINS=https://ainovanesting.pro,https://www.ainovanesting.pro,null

Never place the Paddle API key or notification secret in frontend code. The webhook verifies Paddle-Signature before processing events.

## Website Preview configuration

Set NEXT_PUBLIC_PADDLE_ENV=sandbox and NEXT_PUBLIC_PADDLE_SANDBOX_CLIENT_TOKEN to a client-side token from the Sandbox account. The client token starts with test_. Do not set live credentials on this branch.

## Sandbox notification destination

Active destination: https://nest-pro-license-api-git-codex-pad-3479c7-phamxuandoan3163-8276.vercel.app/api/rest/paddle/webhook

Subscribe it to transaction.completed and these subscription events: subscription.created, subscription.trialing, subscription.activated, subscription.updated, subscription.past_due, subscription.paused, subscription.resumed, and subscription.canceled. Keep its signing secret in the matching Preview variable. Do not send Live notifications to this Preview endpoint.

## License API behavior

- POST /api/rest/paddle/webhook verifies the signature, accepts completed transactions with known Sandbox price IDs, stores license records, and sends a license email.
- Subscription lifecycle events update license status, expiry, plan, scheduled cancellation, and access.
- POST /api/rest/license/activate activates one device seat within the plan limit.
- POST /api/rest/license/validate checks expiry, status, and device activation.
- POST /api/rest/license/deactivate releases one device seat.

Webhook processing is idempotent by event and transaction IDs. License keys are stored as hashes plus encrypted delivery copies; do not log or expose keys.

## Sandbox verification checklist

1. Open the Preview /pricing page. Check monthly and yearly totals, and confirm Subscribe opens the one-page Paddle overlay for the same plan and term.
2. Complete one test checkout yourself with a Paddle Sandbox test card, then check that it redirects to /welcome.
3. In Paddle Sandbox, confirm transaction.completed reached the notification destination and returned 2xx.
4. Confirm the customer, subscription, license, and webhook event records exist in Supabase; confirm the license email arrived.
5. Activate the license in the CEP panel. Check the device limit, deactivation, and reactivation.
6. Test subscription upgrade, scheduled cancellation, and immediate cancellation. Confirm each webhook updates subscription status and access correctly.
7. Replay a notification and confirm it does not issue a duplicate key or email.

The REST /health endpoint only confirms the API process is responding; it does not verify Supabase connectivity. Check the database after a test event.

Do not switch PADDLE_ENVIRONMENT to live, deploy these checkout buttons to Production, or accept real customer payments until Sandbox verification and the separate go-live checks pass.