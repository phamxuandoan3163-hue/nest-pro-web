import postgres from "postgres";

let sqlClient;

export function db() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured.");
  if (!sqlClient) sqlClient = postgres(process.env.DATABASE_URL, { max: 1, idle_timeout: 20, connect_timeout: 10 });
  return sqlClient;
}
