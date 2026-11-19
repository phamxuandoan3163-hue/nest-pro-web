import postgres from "postgres";

let sqlClient;

export function db() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured.");
  if (!sqlClient) {
    sqlClient = postgres(process.env.DATABASE_URL, {
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10,
      // Supabase's transaction-mode pooler (port 6543) does not support
      // named prepared statements, which postgres.js uses by default.
      prepare: false
    });
  }
  return sqlClient;
}
