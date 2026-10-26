# Database-backed Nest-Pro trial build

This branch is intended for the PostgreSQL-backed 7-day trial server. Before enabling customer trials, deploy this server source and configure `DATABASE_URL`, `NPL_ADMIN_TOKEN`, and `NPL_LICENSE_PEPPER` as Vercel environment variables. Verify `/api/npl-trial/health` returns `databaseReady: true`.
