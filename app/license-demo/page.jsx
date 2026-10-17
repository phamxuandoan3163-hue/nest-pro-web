"use client";

import { useEffect, useState } from "react";

const key = "NPL-NEST-26XX-TEST-ABCD";

export default function LicenseDemoPage() {
  const [service, setService] = useState("Checking the demo API…");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState("");

  async function checkHealth() {
    try {
      const response = await fetch("/api/npl-demo/health", { cache: "no-store" });
      const data = await response.json();
      setService(response.ok && data.ok ? "Demo API is online" : "Demo API returned an error");
    } catch (_) {
      setService("Cannot reach the demo API");
    }
  }
  async function runTest(path) {
    setBusy(true);
    setResult("");
    try {
      const deviceId = "deadbeef0123456789abcdef01234567";
      const response = await fetch("/api/npl-demo/" + path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(path === "activate"
          ? { licenseKey: key, deviceId, deviceLabel: "Web demo" }
          : path === "validate"
            ? { deviceToken: window.__nplDemoToken || "", deviceId }
            : { deviceToken: window.__nplDemoToken || "", deviceId })
      });
      const data = await response.json();
      if (path === "activate" && data.deviceToken) window.__nplDemoToken = data.deviceToken;
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult("Request failed: " + String(error));
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => { checkHealth(); }, []);

  return (
    <main style={{ minHeight: "100vh", background: "#101213", color: "#ecefed", padding: "36px 18px", fontFamily: "Arial, sans-serif" }}>
      <section style={{ maxWidth: 720, margin: "0 auto", border: "1px solid #343a3c", borderRadius: 16, background: "#191d1f", padding: 24, boxShadow: "0 20px 70px #0005" }}>
        <p style={{ fontSize: 12, letterSpacing: 2, color: "#9fa9ab", margin: 0 }}>NEST-PRO · DEVELOPER PREVIEW</p>
        <h1 style={{ fontSize: 30, margin: "12px 0 8px" }}>License Demo</h1>
        <p style={{ color: "#b8c0c1", lineHeight: 1.6, marginTop: 0 }}>Trang thử nghiệm cho bản CEP của Nest-Pro Laser. Dùng để kiểm tra luồng kết nối, kích hoạt, xác thực và khóa RUN. Không sử dụng cho khách hàng trả phí.</p>
        <div style={{ padding: 14, borderRadius: 10, background: "#111516", border: "1px solid #343a3c", margin: "18px 0" }}>
          <div style={{ color: "#96a2a4", fontSize: 12, marginBottom: 7 }}>DEMO KEY</div>
          <code style={{ fontSize: 17, letterSpacing: 1, overflowWrap: "anywhere" }}>{key}</code>
          <button onClick={() => navigator.clipboard?.writeText(key)} style={buttonStyle}>Copy key</button>
        </div>
        <div style={{ padding: "12px 14px", borderRadius: 9, background: "#212728", color: "#cbd3d3" }}>
          Service status: <strong>{service}</strong>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 18 }}>
          <button disabled={busy} onClick={() => runTest("activate")} style={buttonStyle}>1. Test activate</button>
          <button disabled={busy} onClick={() => runTest("validate")} style={buttonStyle}>2. Test validate</button>
          <button disabled={busy} onClick={() => runTest("deactivate")} style={buttonStyle}>3. Test deactivate</button>
          <button disabled={busy} onClick={checkHealth} style={buttonStyle}>Check service</button>
        </div>
        <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", fontSize: 12, lineHeight: 1.5, background: "#0d1011", border: "1px solid #303638", borderRadius: 10, padding: 14, marginTop: 18, minHeight: 70 }}>{result || "Test API responses appear here."}</pre>
        <p style={{ color: "#919b9d", fontSize: 12, lineHeight: 1.6, marginBottom: 0 }}>DEMO ONLY: the key and signing logic are intentionally public in this isolated preview. Device seats are not persisted in this demo. Replace with the database-backed server before issuing any paid licenses.</p>
      </section>
    </main>
  );
}

const buttonStyle = {
  color: "#151819",
  background: "#e2e6e5",
  border: "1px solid #f0f2f1",
  borderRadius: 8,
  padding: "10px 14px",
  fontWeight: 700,
  cursor: "pointer",
  marginRight: 8
};
