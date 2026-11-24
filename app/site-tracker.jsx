"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Cookieless analytics: page views and download clicks go to the license API, which stores
// them without IP addresses (see license-api/lib/site-stats.js). Only the live site reports;
// previews and local development stay out of the numbers.
const ENDPOINT = "https://api.ainovanesting.pro/api/track";
const LIVE_HOSTS = ["ainovanesting.pro", "www.ainovanesting.pro"];

export function track(type, label) {
  try {
    if (typeof window === "undefined" || !LIVE_HOSTS.includes(window.location.hostname)) return;
    const body = JSON.stringify({ type, label: label || "", path: window.location.pathname, referrer: document.referrer || "" });
    const blob = new Blob([body], { type: "text/plain" });
    if (navigator.sendBeacon && navigator.sendBeacon(ENDPOINT, blob)) return;
    fetch(ENDPOINT, { method: "POST", body, keepalive: true, mode: "no-cors", headers: { "Content-Type": "text/plain" } }).catch(() => {});
  } catch { /* analytics must never break the page */ }
}

export default function SiteTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname && !pathname.startsWith("/admin")) track("pageview");
  }, [pathname]);

  useEffect(() => {
    function onClick(e) {
      const a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
      if (!a) return;
      const href = a.getAttribute("href") || "";
      if (/\.zip($|[?#])/i.test(href)) track("download", href.split(/[?#]/)[0].split("/").pop());
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
