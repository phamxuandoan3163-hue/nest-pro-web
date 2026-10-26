import { database, json, preflight, safeError } from "../../_npl-db.js";

export function OPTIONS() { return preflight(); }
export async function GET() {
  try {
    const sql = await database();
    const rows = await sql`SELECT NOW() AS server_time, current_database() AS database_name`;
    return json({
      ok: true,
      service: "nest-pro-laser-license-server",
      apiVersion: "2.0.0",
      databaseConfigured: true,
      databaseReady: true,
      serverTime: new Date(rows[0].server_time).getTime(),
      message: "Database-backed license and trial API is ready."
    });
  } catch (error) {
    return safeError(error);
  }
}
