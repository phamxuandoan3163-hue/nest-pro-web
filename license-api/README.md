# Nest-Pro Laser License Server v2

This service provides a server-authoritative 7-day trial and paid-key validation for the Nest-Pro Laser CEP panel. PostgreSQL is the source of truth; deleting local CEP files does not reset a registered trial while the machine fingerprint remains stable.

## Required Vercel environment variables
- `DATABASE_URL`: pooled PostgreSQL/Neon URL with SSL.
- `NPL_LICENSE_PEPPER`: stable high-entropy server secret (at least 32 characters) used to hash device fingerprints and license keys. Do not rotate after keys/trials exist.
- `NPL_ADMIN_TOKEN`: high-entropy secret protecting `/admin` and all `/api/npl-admin/*` routes.

Set all three variables in the Vercel project for Production and Preview, then redeploy. Do not commit these values to Git or embed them in the CEP files.

## Health verification
Open `/api/npl-trial/health`. The service is ready only when it returns HTTP 200 with `ok: true` and `databaseReady: true`. Missing configuration or database access returns an error and the CEP tool fails closed.

## Routes
- `GET /api/npl-trial/health`
- `POST /api/npl-trial/status` with `{ "deviceId": "16 hex characters" }`
- `POST /api/npl-trial/start` with `{ "deviceId": "...", "privacyConsent": true }`
- `POST /api/npl-license/activate` with `{ "licenseKey": "...", "deviceId": "...", "privacyConsent": true }`
- `GET/POST /api/npl-admin/licenses` to issue or revoke keys
- `GET/POST /api/npl-admin/devices` to view devices or reset a paid activation
- `GET /api/npl-admin/events`
- `/admin` administration dashboard

Admin routes require `Authorization: Bearer <NPL_ADMIN_TOKEN>`.

## Data/privacy
After the user accepts the privacy notice, the server stores a keyed hash of the device identifier, trial/license dates, consent timestamp, IP address, approximate IP-derived city/region/country if Vercel provides those headers, and user-agent for abuse prevention and license administration. No GPS coordinates or precise street address are collected. Review local privacy requirements and add a retention/deletion policy before commercial release.

## Paid plans
The admin creates 30-day or 365-day keys after confirming payment separately. Keys are displayed only once and stored as HMAC hashes. Term begins at the first successful activation. Automatic payment webhooks are not included yet.
