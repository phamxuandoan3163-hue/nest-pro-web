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
opens. When that version is newer than its own, it shows a "new version available" notice.

Since plugin 1.3.0 the notice has an **Update** button that installs the new version by itself:
it downloads the zip from this site, compares its SHA-256 with the `sha256` in `latest.json`,
checks the package (right plugin, expected version, nothing outside the panel folder), backs up
the current files, copies the new files over the panel folder and restores the backup if copying
fails. The new version runs after Photoshop is restarted. If `latest.json` has no `sha256`, or
anything fails, the button falls back to opening the download page. Panels older than 1.3.0 only
show the notice and open the download page, so they update by hand once.

To publish a new version (example: 1.3.1):

1. In the plugin source, set the same version in three places:
   - `com.nova.tramestudio/update.js` → `var VERSION = "1.3.1";`
   - `com.nova.tramestudio/CSXS/manifest.xml` → `ExtensionBundleVersion` and both `Extension Version` values.
   - Release notes at the top of `README-EN.txt` and `README-VI.txt`.
2. Zip the `NOVA-NESTING-TRAME-SET UP` folder and replace `public/trame/NOVA-NESTING-TRAME-SET_UP.zip`.
   Keep the folder names and file layout; the panel looks for `com.nova.tramestudio/CSXS/manifest.xml` inside the zip.
3. Run `node scripts/make-latest.js 1.3.1`. It checks that the zip really contains that version and writes
   `public/trame/latest.json` with the version, the zip's SHA-256 and today's date.
4. Commit the zip and `latest.json` together and deploy. Installed panels show the notice the next time they open.

Keep steps 2 and 3 in the same deploy, so the notice never points to an older zip. Run step 3 again
whenever the zip changes, even without a version change; a wrong checksum makes the Update button refuse to install.

**Trying an update before you publish it.** Put a file `update-test.json` in the installed panel folder
(`%APPDATA%\Adobe\CEP\extensions\com.nova.tramestudio` on Windows, `~/Library/Application Support/Adobe/CEP/extensions/com.nova.tramestudio` on Mac):

```json
{ "latest_url": "http://127.0.0.1:8099/latest.json" }
```

Only addresses on the same computer (`http://localhost/…` or `http://127.0.0.1/…`) are accepted. Serve a folder holding
a `latest.json` and the newer zip with `python -m http.server 8099 --bind 127.0.0.1`, reopen the panel and press Update.
A successful update deletes `update-test.json` along with the other files the new version does not contain.

## Nest-Pro Laser online seven-day trial API (review build)

Routes:
- GET /api/npl-trial/health
- POST /api/npl-trial/status with { "deviceId": "16 lowercase hex characters" }
- POST /api/npl-trial/start with { "deviceId": "16 lowercase hex characters" }
- For an existing local trial record, include legacyStartAt and legacyExpiresAt to preserve its original seven-day window.

This review build verifies current time online and keeps the trial timestamps in the local ExtendScript user-data file. It requires no database credentials, so it can be installed and tested without configuring Redis. **It is not a server-persisted anti-reset license:** deleting the local user-data record may allow a fresh trial. Production anti-reset licensing must use a persistent database / Redis and the online API must be configured with the corresponding credentials.
