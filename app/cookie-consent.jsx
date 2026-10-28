"use client";

import { useEffect, useState } from "react";
import { Cookie, Settings2, X, ArrowRight, ShieldCheck } from "lucide-react";

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
    background: checked ? "#e9e8e2" : "#353b3d",
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
    background: "#f2f2ef",
    transition: "left 160ms ease",
    pointerEvents: "none",
  });

  function PreferenceRow({ title, description, name, locked = false }) {
    const checked = preferences[name];
    return (
      <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "9px 0", borderBottom: "1px solid #2b3031", cursor: locked ? "default" : "pointer" }}>
        <span>
          <span style={{ display: "block", color: "#f2f2ef", fontWeight: 650, fontSize: 13 }}>{title}</span>
          <span style={{ display: "block", color: "#999f9f", fontSize: 11, lineHeight: 1.65, marginTop: 3 }}>{description}</span>
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
    borderRadius: 999,
    minHeight: 38,
    padding: "7px 14px",
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
      style={{ position: "fixed", zIndex: 9999, right: 24, bottom: 24, width: "min(460px, calc(100vw - 32px))", maxHeight: "calc(100vh - 40px)", overflowY: "auto", background: "#141819", color: "#f2f2ef", border: "1px solid #303637", borderRadius: 20, boxShadow: "0 28px 90px rgba(0,0,0,.48)", fontFamily: "inherit" }}
    >
      <div style={{ padding: "19px 25px 16px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style={{ width: 38, height: 38, display: "grid", placeItems: "center", borderRadius: 12, background: "#1d2223", color: "#f0efe9", border: "1px solid #3b4243", flexShrink: 0 }}>
            <Cookie size={22} strokeWidth={1.8} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: "1px 0 6px", color: "#929999", fontSize: 9, fontWeight: 800, letterSpacing: "2px" }}>YOUR PRIVACY</p><h2 id="cookie-title" style={{ margin: "0", fontSize: 23, lineHeight: 1.05, letterSpacing: "-.8px", fontWeight: 750, color: "#f2f2ef" }}>
              Your data. Your choice.
            </h2>
            <p id="cookie-description" style={{ margin: "12px 0 0", fontSize: 12, lineHeight: 1.6, color: "#a1a7a7" }}>
              Nova Nesting uses essential storage to keep this site working. With your permission, optional cookies help us understand site usage and improve your experience.
            </p>
          </div>
          <button type="button" onClick={() => saveConsent(initialPreferences, "dismissed")} aria-label="Close cookie notice" style={{ border: "1px solid #343a3b", borderRadius: 999, background: "transparent", color: "#a5aaaa", padding: 4, cursor: "pointer" }}>
            <X size={18} />
          </button>
        </div>

        {settingsOpen ? (
          <div style={{ marginTop: 12 }}>
            <p style={{ margin: "0 0 4px", fontSize: 13, color: "#4b5563", lineHeight: 1.5 }}>Choose which optional categories you allow. Essential storage is always active.</p>
            <PreferenceRow title="Strictly necessary" description="Security, basic site functions and remembering your choice." name="necessary" locked />
            <PreferenceRow title="Analytics" description="Helps us understand visits and improve the website." name="analytics" />
            <PreferenceRow title="Marketing" description="Used for advertising or measuring promotional campaigns." name="marketing" />
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button type="button" onClick={() => saveConsent(preferences, "custom")} style={{ ...buttonBase, flex: 1, border: 0, background: "#f2f2ef", color: "#111415" }}>Save choices <ArrowRight size={14} /></button>
              <button type="button" onClick={() => saveConsent(initialPreferences, "rejected")} style={{ ...buttonBase, border: "1px solid #42494a", background: "transparent", color: "#e3e5e2" }}>Reject optional</button>
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, padding: "7px 12px", border: "1px solid #303637", borderRadius: 11, color: "#c5c9c6", fontSize: 10, lineHeight: 1.5 }}><ShieldCheck size={15} color="#b9c3bd" /> Essential cookies only unless you choose otherwise.</div><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
              <button type="button" onClick={() => saveConsent({ necessary: true, analytics: true, marketing: true }, "accepted")} style={{ ...buttonBase, border: 0, background: "#f2f2ef", color: "#111415" }}>Accept all <ArrowRight size={14} /></button>
              <button type="button" onClick={() => saveConsent(initialPreferences, "rejected")} style={{ ...buttonBase, border: "1px solid #454c4d", background: "transparent", color: "#f2f2ef" }}>Reject optional</button>
            </div>
            <button type="button" onClick={() => setSettingsOpen(true)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, width: "100%", marginTop: 6, padding: "6px 12px", border: 0, background: "transparent", color: "#a7adad", fontSize: 11, fontWeight: 650, cursor: "pointer" }}>
              <Settings2 size={15} /> Customize preferences
            </button>
          </>
        )}
        <p style={{ margin: "10px 0 0", paddingTop: 9, borderTop: "1px solid #2b3031", color: "#777f80", fontSize: 10, lineHeight: 1.5 }}>
          Your choice is saved on this browser.
        </p>
      </div>
    </div>
  );
}
