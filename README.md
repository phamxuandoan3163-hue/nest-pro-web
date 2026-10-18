# Nest-Pro Web V11 — Dark UI + CMS Admin

This version is based on the Nest-Pro V10 Airo-style landing page and adds:

- A darker visual system for the public website.
- `/admin` CMS editor for hero, navigation, features, workflow, pricing, FAQ, theme colors and footer copy.
- Live persistence through browser localStorage.
- Export / Import JSON so content can be moved to another machine or connected to a real database later.

## Run
npm install
npm run dev

Public site: http://localhost:3000
Admin CMS: http://localhost:3000/admin

## Important
The included CMS is a frontend/local CMS intended to be easy to run immediately. For production multi-user editing and cloud persistence on Vercel, connect the same schema to Supabase, Neon/Postgres, or another database + authentication layer.


## Nest-Pro Laser online seven-day trial API (review build)

Routes:
- GET /api/npl-trial/health
- POST /api/npl-trial/status with { "deviceId": "16 lowercase hex characters" }
- POST /api/npl-trial/start with { "deviceId": "16 lowercase hex characters" }
- For an existing local trial record, include legacyStartAt and legacyExpiresAt to preserve its original seven-day window.

This review build verifies current time online and keeps the trial timestamps in the local ExtendScript user-data file. It requires no database credentials, so it can be installed and tested without configuring Redis. **It is not a server-persisted anti-reset license:** deleting the local user-data record may allow a fresh trial. Production anti-reset licensing must use a persistent database / Redis and the online API must be configured with the corresponding credentials.
