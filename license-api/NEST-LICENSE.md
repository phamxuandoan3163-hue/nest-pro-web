# Nova Nesting AI (Marker Making & Nesting) license API

License server for the Illustrator panel `com.novanest.panel` (2.6.0+). It is fully separate from
NOVA Trame: own routes, tables, signing key, encryption key, key prefix and device-hash salt.
Nothing in `/api/trame/*`, `lib/trame.js` or the `trame_*` tables is used or changed.

| | Nova Nesting | NOVA Trame |
|---|---|---|
| Routes | `/api/nest/*`, page `/nest-activate` | `/api/trame/*`, page `/trame-activate` |
| Tables | `nest_*` (created automatically on first request) | `trame_*` |
| Signing key | `NEST_SIGNING_PRIVATE_KEY` | `TRAME_SIGNING_PRIVATE_KEY` |
| Key encryption | `NEST_LICENSE_ENCRYPTION_KEY` | `TRAME_LICENSE_ENCRYPTION_KEY` |
| Key prefix | `NEST-` | `TRAME-` |
| Panel storage | `nns.*` | `nvt.*` |

Shared, read-only: `lib/db.js` (same database), `lib/trame-http.js` (CORS), `RESEND_API_KEY`,
`LICENSE_EMAIL_FROM`, `PADDLE_API_KEY`, `PADDLE_ENVIRONMENT`.

## Plans

All plans unlock every feature. Trial: 7 days, 1 computer, once per computer.

| Plan | Length | Computers |
|---|---|---|
| `monthly` | 30 days (renews with the subscription) | 1 |
| `yearly` | 365 days (renews with the subscription) | 1 |
| `yearly_pro` | 365 days (renews with the subscription) | 2 |

Change lengths or computers in `PLAN_DEFS` in `lib/nest.js`.

## Environment variables (Vercel project `nest-pro-license-api`)

Already set: `NEST_SIGNING_PRIVATE_KEY`, `NEST_LICENSE_ENCRYPTION_KEY` (production + preview).
The public key matching the signing key is `PUBKEY_B64` in the panel's `js/license.js`
(`GET /api/nest/pubkey` returns it too). Changing the signing key means a new panel release.

To set when the Paddle product is ready (no code change needed, redeploy after saving):

| Name | Value |
|---|---|
| `NEST_PADDLE_PRICES` | `pri_xxx:monthly,pri_yyy:yearly,pri_zzz:yearly_pro` (live and sandbox ids can be listed together) |
| `NEST_NOTIFICATION_SECRET` | the endpoint secret of the Paddle notification destination pointing at `https://api.ainovanesting.pro/api/nest/paddle/webhook` |
| `NEST_BUY_URL` | the Buy / Renew page; the panel opens the `renew_url` the API returns, so this link changes without a panel release |

Until `NEST_PADDLE_PRICES` is set, the webhook answers `unknown_price_id` and no paid key is
issued; trials work.

## Routes

| Route | Purpose |
|---|---|
| `POST /api/nest/trial` | 7-day trial (one per computer); returns key, entitlement, signed `token` |
| `POST /api/nest/license/activate` | bind a key to a computer (`max_devices` per plan) |
| `POST /api/nest/license/validate` | check key + computer; returns entitlement, signature and signed grace `token` |
| `POST /api/nest/license/deactivate` | free a computer slot |
| `POST /api/nest/offline` | offline activation code for a key + computer |
| `GET /api/nest/pubkey` | Ed25519 public key |
| `POST /api/nest/paddle/webhook` | Paddle `transaction.completed` / `subscription.*` |

Differences from the Trame copy it started from: computers per plan (`plan.devices`), the key
e-mail is re-sent on a Paddle retry if the first send failed, tables are created automatically,
price ids and the buy link come from environment variables.

## Panel side (2.6.0)

- An online "ok" is accepted only with a valid signed token for that computer, so a fake server
  (hosts file, proxy) cannot unlock the panel.
- Offline: up to 24 hours after the last online check, or until an offline code expires.
  A computer clock set back is detected and blocks offline use.
- Scan, Pair, Nest and Export need a valid license.
