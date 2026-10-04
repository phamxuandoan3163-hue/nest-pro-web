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
