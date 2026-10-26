"use client";
import { useState } from "react";

const input = { background: "#101314", color: "#e9eeee", border: "1px solid #41484a", borderRadius: 7, padding: "10px 12px", width: "100%", boxSizing: "border-box" };
const button = { background: "#dfe6e3", color: "#101516", border: "1px solid #dfe6e3", borderRadius: 7, padding: "10px 13px", cursor: "pointer", fontWeight: 800, fontSize: 12 };
const secondary = { ...button, background: "#22292b", color: "#e1e8e6", borderColor: "#485254" };
const th = { textAlign: "left", padding: 10, color: "#a6b1b1", fontSize: 10, textTransform: "uppercase", borderBottom: "1px solid #343b3d" };
const td = { padding: 10, borderBottom: "1px solid #282e30", fontSize: 12, verticalAlign: "top", overflowWrap: "anywhere" };

export default function LicenseAdminPage() {
  const [token, setToken] = useState("");
  const [section, setSection] = useState("devices");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [devices, setDevices] = useState([]);
  const [licenses, setLicenses] = useState([]);
  const [events, setEvents] = useState([]);
  const [plan, setPlan] = useState("30day");
  const [email, setEmail] = useState("");
  const [maxDevices, setMaxDevices] = useState("2");
  const [createdKey, setCreatedKey] = useState("");

  async function api(path, method = "GET", body) {
    const res = await fetch(path, {
      method, cache: "no-store",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token.trim() },
      body: body ? JSON.stringify(body) : undefined
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) throw new Error(data.message || ("Request failed: HTTP " + res.status));
    return data;
  }
  async function load(which = section) {
    if (!token.trim()) { setError("Enter the NPL_ADMIN_TOKEN configured in Vercel."); return; }
    setBusy(true); setError(""); setStatus("");
    try {
      if (which === "devices") { const d = await api("/api/npl-admin/devices"); setDevices(d.devices || []); }
      else if (which === "licenses") { const d = await api("/api/npl-admin/licenses"); setLicenses(d.licenses || []); }
      else { const d = await api("/api/npl-admin/events"); setEvents(d.events || []); }
      setSection(which); setStatus("Loaded current records from PostgreSQL.");
    } catch (e) { setError(String(e.message || e)); }
    finally { setBusy(false); }
  }
  async function createLicense() {
    setBusy(true); setError(""); setStatus(""); setCreatedKey("");
    try {
      const d = await api("/api/npl-admin/licenses", "POST", { action: "create", plan, customerEmail: email, maxDevices: Number(maxDevices) });
      setCreatedKey(d.licenseKey || "");
      setEmail("");
      const list = await api("/api/npl-admin/licenses");
      setLicenses(list.licenses || []); setSection("licenses");
      setStatus("Key created. Copy and send it now. The full key is not stored and cannot be retrieved later.");
    } catch (e) { setError(String(e.message || e)); }
    finally { setBusy(false); }
  }
  async function revoke(id) {
    if (!window.confirm("Revoke this license? The connected device will be blocked on its next check.")) return;
    setBusy(true); setError(""); setStatus("");
    try { await api("/api/npl-admin/licenses", "POST", { action: "revoke", licenseId: id }); setStatus("License revoked."); await load("licenses"); }
    catch (e) { setError(String(e.message || e)); }
    finally { setBusy(false); }
  }
  async function resetDevice(deviceHash, licenseId) {
    if (!window.confirm("Remove this device from the selected paid license?")) return;
    setBusy(true); setError(""); setStatus("");
    try { await api("/api/npl-admin/devices", "POST", { action: "deactivate_device", deviceHash, licenseId }); setStatus("Paid-license device seat reset."); await load("devices"); }
    catch (e) { setError(String(e.message || e)); }
    finally { setBusy(false); }
  }
  const fmt = v => v ? new Date(v).toLocaleString() : "—";
  const loc = (city, region, country) => [city, region, country].filter(Boolean).join(", ") || "Unknown";
  const table = { width: "100%", borderCollapse: "collapse", minWidth: 750 };

  return <main style={{ minHeight: "100vh", background: "#101314", color: "#e7edeb", padding: "26px 16px", fontFamily: "Arial,sans-serif" }}>
    <div style={{ maxWidth: 1320, margin: "0 auto" }}>
      <header style={{ borderBottom: "1px solid #343b3d", paddingBottom: 18, display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        <div><div style={{ color: "#9da9a8", letterSpacing: 2, fontSize: 11 }}>NEST-PRO LASER</div><h1 style={{ margin: "8px 0 4px", fontSize: 27 }}>License Control</h1><div style={{ color: "#95a09f", fontSize: 12 }}>7-day trial registry · device records · paid keys · event history</div></div>
        <a href="/api/npl-trial/health" style={{ color: "#cbd5d2", fontSize: 12 }}>API health ↗</a>
      </header>

      <section style={{ marginTop: 18, padding: 16, background: "#191e20", border: "1px solid #343b3d", borderRadius: 12 }}>
        <label style={{ display: "block", color: "#abb4b5", fontSize: 11, marginBottom: 7 }}>ADMIN TOKEN · KEPT IN THIS PAGE MEMORY ONLY</label>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 9 }}>
          <input style={input} type="password" autoComplete="off" value={token} onChange={e => setToken(e.target.value)} placeholder="Paste NPL_ADMIN_TOKEN" />
          <button style={button} disabled={busy} onClick={() => load(section)}>{busy ? "LOADING…" : "CONNECT / REFRESH"}</button>
        </div>
      </section>

      {error && <p role="alert" style={{ color: "#ffb8a6", background: "#332523", border: "1px solid #69463d", padding: 12, borderRadius: 8 }}>{error}</p>}
      {status && <p role="status" style={{ color: "#cdded7", background: "#1b2924", border: "1px solid #365349", padding: 12, borderRadius: 8 }}>{status}</p>}

      <nav style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "18px 0 12px" }}>
        {[["devices","DEVICES / TRIALS"],["licenses","PAID LICENSES"],["events","EVENT HISTORY"]].map(([id,label]) => <button key={id} style={section === id ? button : secondary} disabled={busy} onClick={() => load(id)}>{label}</button>)}
      </nav>

      {section === "licenses" && <section style={{ background: "#191e20", border: "1px solid #343b3d", borderRadius: 12, padding: 16, marginBottom: 14 }}>
        <h2 style={{ margin: "0 0 12px", fontSize: 16 }}>Issue paid license</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", alignItems: "end", gap: 10 }}>
          <label style={{ color: "#aab5b3", fontSize: 11 }}>PLAN<select value={plan} onChange={e => setPlan(e.target.value)} style={{ ...input, display: "block", marginTop: 6 }}><option value="30day">30 days</option><option value="1year">1 year (365 days)</option></select></label>
          <label style={{ color: "#aab5b3", fontSize: 11 }}>CUSTOMER EMAIL<input value={email} onChange={e => setEmail(e.target.value)} style={{ ...input, display: "block", marginTop: 6 }} placeholder="Optional" /></label>
          <label style={{ color: "#aab5b3", fontSize: 11 }}>DEVICE LIMIT (1–10)<input type="number" min="1" max="10" value={maxDevices} onChange={e => setMaxDevices(e.target.value)} style={{ ...input, display: "block", marginTop: 6 }} /></label>
          <button style={button} disabled={busy} onClick={createLicense}>CREATE KEY</button>
        </div>
        {createdKey && <div style={{ marginTop: 14, padding: 14, border: "1px solid #50635a", background: "#17231f", borderRadius: 8 }}><b style={{ display: "block", fontSize: 10, marginBottom: 7, color: "#9db1a7" }}>COPY THIS KEY NOW · SHOWN ONCE</b><code style={{ fontSize: 16, overflowWrap: "anywhere" }}>{createdKey}</code> <button style={{ ...secondary, marginLeft: 8 }} onClick={() => navigator.clipboard?.writeText(createdKey)}>COPY</button></div>}
      </section>}

      <section style={{ background: "#191e20", border: "1px solid #343b3d", borderRadius: 12, padding: 8, overflowX: "auto" }}>
        {section === "devices" && <table style={table}><thead><tr>{["DEVICE / STATE","FIRST SEEN","LAST SEEN","FIRST IP / LOCATION","LAST IP / LOCATION","LICENSE SEAT"].map(x => <th key={x} style={th}>{x}</th>)}</tr></thead><tbody>
          {devices.map(d => <tr key={d.device_hash}><td style={td}><b>…{d.device_id_hint}</b><div style={{ color: "#748082", fontSize: 10, marginTop: 4 }}>{d.device_hash}</div><div style={{ color: "#a4b5ad", marginTop: 4 }}>{d.active_license_plan ? "PAID: " + d.active_license_plan : d.trial_started_at ? (new Date(d.trial_expires_at).getTime() > Date.now() ? "TRIAL ACTIVE" : "TRIAL EXPIRED") : "REGISTERED"}</div><div style={{ color: "#8a9695", marginTop: 4 }}>Expiry: {fmt(d.trial_expires_at)}</div></td><td style={td}>{fmt(d.first_seen_at)}</td><td style={td}>{fmt(d.last_seen_at)}</td><td style={td}>{d.first_ip || "—"}<div style={{ color: "#9aa5a6", marginTop: 4 }}>{loc(d.first_city,d.first_region,d.first_country)}</div></td><td style={td}>{d.last_ip || "—"}<div style={{ color: "#9aa5a6", marginTop: 4 }}>{loc(d.last_city,d.last_region,d.last_country)}</div></td><td style={td}>{d.active_license_id ? <button style={secondary} disabled={busy} onClick={() => resetDevice(d.device_hash,d.active_license_id)}>RESET SEAT</button> : "No paid seat"}</td></tr>)}
          {!devices.length && <tr><td colSpan="6" style={td}>No device records yet. Connect to load database records.</td></tr>}
        </tbody></table>}
        {section === "licenses" && <table style={table}><thead><tr>{["KEY HINT / CUSTOMER","PLAN","STATUS","CREATED","START / EXPIRES","SEATS","ACTION"].map(x => <th key={x} style={th}>{x}</th>)}</tr></thead><tbody>
          {licenses.map(l => <tr key={l.id}><td style={td}><b>••••-{l.key_hint}</b><div style={{ color: "#8b9697", marginTop: 4 }}>{l.customer_email || "No email"}</div></td><td style={td}>{l.plan === "30day" ? "30 days" : "1 year"}</td><td style={td}>{String(l.status).toUpperCase()}</td><td style={td}>{fmt(l.created_at)}</td><td style={td}>{fmt(l.starts_at)}<div style={{ color: "#9aa5a6", marginTop: 4 }}>{fmt(l.expires_at)}</div></td><td style={td}>{l.active_devices} / {l.max_devices}</td><td style={td}>{l.status !== "revoked" && <button style={secondary} disabled={busy} onClick={() => revoke(l.id)}>REVOKE</button>}</td></tr>)}
          {!licenses.length && <tr><td colSpan="7" style={td}>No paid licenses yet.</td></tr>}
        </tbody></table>}
        {section === "events" && <table style={table}><thead><tr>{["WHEN","EVENT","IP / LOCATION","DEVICE / LICENSE","DETAILS"].map(x => <th key={x} style={th}>{x}</th>)}</tr></thead><tbody>
          {events.map(e => <tr key={e.id}><td style={td}>{fmt(e.occurred_at)}</td><td style={td}>{e.event_type}</td><td style={td}>{e.ip || "—"}<div style={{ color: "#9aa5a6", marginTop: 4 }}>{loc(e.city,e.region,e.country)}</div></td><td style={td}>{e.device_hash ? e.device_hash.slice(0,12) + "…" : "—"}<div style={{ color: "#657173", marginTop: 4 }}>{e.license_id || ""}</div></td><td style={td}><code>{JSON.stringify(e.details || {})}</code></td></tr>)}
          {!events.length && <tr><td colSpan="5" style={td}>No events yet.</td></tr>}
        </tbody></table>}
      </section>
      <p style={{ color: "#788485", fontSize: 11, lineHeight: 1.6, marginTop: 16 }}>IP address and approximate location are recorded only after consent and depend on Vercel's IP geolocation headers. No GPS or exact street address is collected. Full license keys are shown once, then only the key hash remains in the database.</p>
    </div>
  </main>;
}
