"use client";
import { useState } from "react";

export default function TrameActivate() {
  const [key, setKey] = useState("");
  const [device, setDevice] = useState("");
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr(""); setCode(""); setBusy(true);
    try {
      const r = await fetch("/api/trame/offline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ license_key: key.trim(), device_id: device.trim() })
      });
      const data = await r.json();
      if (!data.ok) {
        const map = {
          license_invalid_or_expired: "Key is invalid or has expired.",
          activation_limit_reached: "This key is already activated on another computer.",
          invalid_request: "Please enter both the license key and the device code."
        };
        setErr(map[data.error] || "Could not create the activation code.");
      } else {
        setCode(data.code);
      }
    } catch (_) {
      setErr("Network error. Please try again.");
    }
    setBusy(false);
  }

  const box = { width: "100%", padding: "10px 12px", fontSize: 14, border: "1px solid #c7cdcf", borderRadius: 8, boxSizing: "border-box", fontFamily: "monospace" };
  return <main style={{ fontFamily: "Arial,sans-serif", maxWidth: 560, margin: "48px auto", padding: "0 20px", color: "#1a2022" }}>
    <p style={{ letterSpacing: 2, fontSize: 12, color: "#596366" }}>NOVA TRAME · OFFLINE ACTIVATION</p>
    <h1 style={{ marginTop: 4 }}>Activate NOVA Trame offline</h1>
    <p style={{ color: "#485257" }}>Use this page when the plugin can't reach the license server (for example, a firewall blocks Photoshop). Open the plugin, copy the two values it shows, generate a code here, then paste the code back into the plugin.</p>
    <form onSubmit={submit}>
      <label style={{ fontSize: 13, fontWeight: 700 }}>License key</label>
      <input style={{ ...box, margin: "6px 0 16px" }} value={key} onChange={(e) => setKey(e.target.value)} placeholder="TRAME-XXXXX-XXXXX-XXXXX-XXXXX-XXXXX" autoComplete="off" spellCheck={false} />
      <label style={{ fontSize: 13, fontWeight: 700 }}>Device code (from the plugin)</label>
      <input style={{ ...box, margin: "6px 0 16px" }} value={device} onChange={(e) => setDevice(e.target.value)} placeholder="Paste the device code shown in the plugin" autoComplete="off" spellCheck={false} />
      <button disabled={busy} type="submit" style={{ background: "#1f6feb", color: "#fff", border: 0, borderRadius: 8, padding: "11px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>{busy ? "Generating…" : "Generate activation code"}</button>
    </form>
    {err && <p style={{ color: "#b3261e", marginTop: 18 }}>{err}</p>}
    {code && <div style={{ marginTop: 22 }}>
      <label style={{ fontSize: 13, fontWeight: 700 }}>Activation code — copy all of it into the plugin</label>
      <textarea readOnly value={code} onFocus={(e) => e.target.select()} style={{ ...box, height: 120, marginTop: 6, wordBreak: "break-all" }} />
      <button onClick={() => navigator.clipboard && navigator.clipboard.writeText(code)} style={{ marginTop: 8, background: "#111", color: "#fff", border: 0, borderRadius: 8, padding: "9px 16px", fontSize: 13, cursor: "pointer" }}>Copy code</button>
    </div>}
    <p style={{ fontSize: 12, color: "#687174", marginTop: 28 }}>The code is tied to the device code you entered and stops working when the license expires. It does not use up an extra device.</p>
  </main>;
}
