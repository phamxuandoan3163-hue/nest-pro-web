"use client";

import { useEffect, useState } from "react";
import { Cookie, Settings2, X } from "lucide-react";

const STORAGE_KEY = "nova-nesting-cookie-consent-v1";

const initialPreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
};

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [preferences, setPreferences] = useState(initialPreferences);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        const timer = window.setTimeout(() => setVisible(true), 650);
        return () => window.clearTimeout(timer);
      }
      const parsed = JSON.parse(saved);
      setPreferences({ ...initialPreferences, ...parsed.preferences, necessary: true });
    } catch {
      setVisible(true);
    }
  }, []);

  function saveConsent(nextPreferences, choice) {
    const consent = {
      preferences: { ...nextPreferences, necessary: true },
      choice,
      updatedAt: new Date().toISOString(),
      version: 1,
    };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    } catch {
      // The banner still closes if browser storage is unavailable.
    }
    setPreferences(consent.preferences);
    setVisible(false);
    setSettingsOpen(false);
  }

  if (!visible) return null;

  const toggleStyle = (checked) => ({
    appearance: "none",
    width: 38,
    height: 22,
    borderRadius: 999,
    background: checked ? "#2563eb" : "#d1d5db",
    position: "relative",
    cursor: "pointer",
    flexShrink: 0,
    margin: 0,
    transition: "background 160ms ease",
  });

  const switchDot = (checked) => ({
    position: "absolute",
    top: 3,
    left: checked ? 19 : 3,
    width: 16,
    height: 16,
    borderRadius: "50%",
    background: "#fff",
    transition: "left 160ms ease",
    pointerEvents: "none",
  });

  function PreferenceRow({ title, description, name, locked = false }) {
    const checked = preferences[name];
    return (
      <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "13px 0", borderBottom: "1px solid #e5e7eb", cursor: locked ? "default" : "pointer" }}>
        <span>
          <span style={{ display: "block", color: "#111827", fontWeight: 650, fontSize: 14 }}>{title}</span>
          <span style={{ display: "block", color: "#6b7280", fontSize: 12, lineHeight: 1.5, marginTop: 3 }}>{description}</span>
        </span>
        <span style={{ position: "relative", display: "inline-flex" }}>
          <input
            type="checkbox"
            checked={checked}
            disabled={locked}
            onChange={(event) => setPreferences((current) => ({ ...current, [name]: event.target.checked }))}
            aria-label={title}
            style={{ ...toggleStyle(checked), opacity: locked ? 0.7 : 1 }}
          />
          <span aria-hidden="true" style={switchDot(checked)} />
        </span>
      </label>
    );
  }

  const buttonBase = {
    borderRadius: 10,
    minHeight: 42,
    padding: "10px 14px",
    fontSize: 13,
    fontWeight: 650,
    cursor: "pointer",
    transition: "transform 120ms ease, background 120ms ease",
  };

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-title"
      aria-describedby="cookie-description"
      style={{ position: "fixed", zIndex: 9999, left: 20, bottom: 20, width: "min(440px, calc(100vw - 40px))", maxHeight: "calc(100vh - 40px)", overflowY: "auto", background: "#fff", color: "#111827", border: "1px solid rgba(15,23,42,.10)", borderRadius: 18, boxShadow: "0 20px 65px rgba(15,23,42,.22)", fontFamily: "inherit" }}
    >
      <div style={{ padding: "22px 22px 20px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style={{ width: 42, height: 42, display: "grid", placeItems: "center", borderRadius: 12, background: "#eff6ff", color: "#2563eb", flexShrink: 0 }}>
            <Cookie size={22} strokeWidth={1.8} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 id="cookie-title" style={{ margin: "1px 0 6px", fontSize: 18, lineHeight: 1.25, letterSpacing: "-.025em", fontWeight: 750 }}>
              Your privacy matters
            </h2>
            <p id="cookie-description" style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: "#4b5563" }}>
              Nova Nesting uses essential storage to keep this site working. With your permission, optional cookies can help us understand site usage and improve your experience.
            </p>
          </div>
          <button type="button" onClick={() => saveConsent(initialPreferences, "dismissed")} aria-label="Close cookie notice" style={{ border: 0, background: "transparent", color: "#6b7280", padding: 4, cursor: "pointer" }}>
            <X size={18} />
          </button>
        </div>

        {settingsOpen ? (
          <div style={{ marginTop: 16 }}>
            <p style={{ margin: "0 0 4px", fontSize: 13, color: "#4b5563", lineHeight: 1.5 }}>Choose which optional categories you allow. Essential storage is always active.</p>
            <PreferenceRow title="Strictly necessary" description="Security, basic site functions and remembering your choice." name="necessary" locked />
            <PreferenceRow title="Analytics" description="Helps us understand visits and improve the website." name="analytics" />
            <PreferenceRow title="Marketing" description="Used for advertising or measuring promotional campaigns." name="marketing" />
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button type="button" onClick={() => saveConsent(preferences, "custom")} style={{ ...buttonBase, flex: 1, border: 0, background: "#111827", color: "#fff" }}>Save my choices</button>
              <button type="button" onClick={() => saveConsent(initialPreferences, "rejected")} style={{ ...buttonBase, border: "1px solid #d1d5db", background: "#fff", color: "#111827" }}>Reject optional</button>
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9, marginTop: 18 }}>
              <button type="button" onClick={() => saveConsent({ necessary: true, analytics: true, marketing: true }, "accepted")} style={{ ...buttonBase, border: 0, background: "#2563eb", color: "#fff" }}>Accept all</button>
              <button type="button" onClick={() => saveConsent(initialPreferences, "rejected")} style={{ ...buttonBase, border: "1px solid #d1d5db", background: "#fff", color: "#111827" }}>Reject optional</button>
            </div>
            <button type="button" onClick={() => setSettingsOpen(true)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, width: "100%", marginTop: 9, padding: "9px 12px", border: 0, background: "transparent", color: "#4b5563", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              <Settings2 size={15} /> Customize preferences
            </button>
          </>
        )}
        <p style={{ margin: "13px 0 0", paddingTop: 12, borderTop: "1px solid #f1f5f9", color: "#9ca3af", fontSize: 11, lineHeight: 1.5 }}>
          You can change your choice later by clearing this site&apos;s saved preferences.
        </p>
      </div>
    </div>
  );
}
