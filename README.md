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


## Releasing a NOVA Trame plugin update

Since plugin 1.2.0, the panel reads `public/trame/latest.json` from the website each time it
opens. When that version is newer than its own, it shows a "new version available" notice with
a Download button. The panel never installs anything by itself.

To publish a new version (example: 1.3.0):

1. In the plugin source, set the same version in three places:
   - `com.nova.tramestudio/update.js` → `var VERSION = "1.3.0";`
   - `com.nova.tramestudio/CSXS/manifest.xml` → `ExtensionBundleVersion` and both `Extension Version` values.
   - Release notes at the top of `README-EN.txt` and `README-VI.txt`.
2. Zip the `NOVA-NESTING-TRAME-SET UP` folder and replace `public/trame/NOVA-NESTING-TRAME-SET_UP.zip`.
3. Set `"version": "1.3.0"` in `public/trame/latest.json`.
4. Commit the zip and `latest.json` together and deploy. Installed panels show the notice the next time they open.

Keep steps 2 and 3 in the same deploy, so the notice never points to an older zip.
Users update by downloading the zip, unzipping it and running the installer again; their license is kept.

## Nest-Pro Laser online seven-day trial API (review build)

Routes:
- GET /api/npl-trial/health
- POST /api/npl-trial/status with { "deviceId": "16 lowercase hex characters" }
- POST /api/npl-trial/start with { "deviceId": "16 lowercase hex characters" }
- For an existing local trial record, include legacyStartAt and legacyExpiresAt to preserve its original seven-day window.

This review build verifies current time online and keeps the trial timestamps in the local ExtendScript user-data file. It requires no database credentials, so it can be installed and tested without configuring Redis. **It is not a server-persisted anti-reset license:** deleting the local user-data record may allow a fresh trial. Production anti-reset licensing must use a persistent database / Redis and the online API must be configured with the corresponding credentials.
