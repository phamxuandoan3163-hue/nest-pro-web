export default function Home() {
  return <main style={{ fontFamily: "Arial,sans-serif", maxWidth: 760, margin: "56px auto", padding: "0 20px", color: "#202627", lineHeight: 1.6 }}>
    <p style={{ letterSpacing: 2, fontSize: 12, color: "#657071" }}>NEST-PRO LASER · ONLINE SERVICES</p>
    <h1>Nest-Pro License Server</h1>
    <p>This service validates Nest-Pro Laser trials and paid license activations. PostgreSQL is the authoritative record for trial start and expiry.</p>
    <p><a href="/api/npl-trial/health">Check API health</a> · <a href="/admin">Open admin dashboard</a></p>
    <p style={{ fontSize: 13, color: "#657071" }}>Trial service is ready only when the health endpoint returns HTTP 200 with databaseReady=true. If it reports a missing configuration, add DATABASE_URL, NPL_LICENSE_PEPPER and NPL_ADMIN_TOKEN to Vercel environment variables, then redeploy.</p>
  </main>;
}
