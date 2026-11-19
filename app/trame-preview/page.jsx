"use client";
import { useMemo, useState, useEffect } from "react";
import { ArrowRight, Check, Download, Sparkles, Zap } from "lucide-react";
import data from "./styles.json";

// Live in production (NEXT_PUBLIC_PADDLE_ENV=live), sandbox everywhere else.
const PADDLE_ENV = process.env.NEXT_PUBLIC_PADDLE_ENV || "sandbox";
const PADDLE_LIVE = PADDLE_ENV === "live" || PADDLE_ENV === "production";
const PADDLE_TOKEN = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || process.env.NEXT_PUBLIC_PADDLE_SANDBOX_CLIENT_TOKEN || "";

// Paddle price IDs per plan. The license API maps both sets to the same plans.
const PRICE_IDS = {
  monthly: { live: "pri_01m7qg72fmshh1rbjncv4t5ywd", sandbox: "pri_01m7rwz94rp0hp0dhbmeneeda3" },
  yearly: { live: "pri_01m7qg72k6fhnz3e50yt55wf6k", sandbox: "pri_01m7rx0ne8fb176wcf36ksecsa" },
  yearly_pro: { live: "pri_01m7qg72p299r0vcmdm7ecqs9v", sandbox: "pri_01m7rx1vyr86287gw855bhb00q" }
};
const priceFor = (plan) => PRICE_IDS[plan][PADDLE_LIVE ? "live" : "sandbox"];

const GROUP_LABELS = { basic: "Basic", street: "Grunge", shape: "Shapes", pattern: "Patterns", trend: "Trends", vintage: "Vintage", color: "Color" };

const PLANS = [
  { kicker: "START HERE", name: "Free trial", price: "$0", period: "for 7 days", text: "Test NOVA Trame with 21 classic styles on your own artwork before you commit.", features: ["21 halftone styles", "Classic dot and grain halftones", "7-day trial period", "Live preview"] },
  { kicker: "FLEXIBLE", name: "Monthly", price: "$5", period: "per month", priceId: priceFor("monthly"), text: "75 styles for a production run, a busy month, or occasional jobs.", features: ["75 halftone styles", "Adds streetwear, special dots and line patterns", "30 days of licensed access", "Print-size LPI"] },
  { kicker: "STANDARD", name: "Yearly", price: "$50", period: "per year", priceId: priceFor("yearly"), text: "94 styles for everyday halftone work, with a full year of access at a lower price than monthly.", features: ["94 halftone styles", "Adds trending tee effects", "12 months of licensed access", "Print-size LPI"] },
  { kicker: "PRO TIER", name: "Yearly Pro", price: "$60", period: "per year", recommended: true, priceId: priceFor("yearly_pro"), text: "All 130 styles, for demanding production and longer work sessions.", features: ["130 halftone styles", "Adds vintage styles and CMYK / spot colors", "Everything in Yearly", "Built for demanding production"] }
];

const FEATURES = [
  ["130 halftone styles", "Dot, line, shape, pattern, grunge, vintage and color styles, each with its own icon and description."],
  ["Print-size LPI", "Frequency is set from the document's longest side, so the dots suit the size you print."],
  ["Black and white shirts", "Separate modes for DTF on black and on white shirts, with the right ink logic for each."],
  ["White underbase", "Builds the white layer with an adjustable choke, so colors stay bright on dark fabric."],
  ["Live preview", "A separate preview panel shows the result as you adjust settings, then returns inline when closed."],
  ["Ready-to-print layers", "Output lands in its own document, with a preview layer you switch off before export."]
];

const STEPS = [
  "Open the artwork in Photoshop and choose the shirt color: black or white.",
  "Pick a style from the library. The LPI is set automatically from the print size.",
  "Adjust the settings and check the live preview until the result looks right.",
  "Apply the halftone, then export a transparent PNG for your RIP."
];

export default function TramePreviewPage() {
  const [active, setActive] = useState("all");
  const [query, setQuery] = useState("");
  const [paddleReady, setPaddleReady] = useState(false);
  const [notice, setNotice] = useState("");

  // Load Paddle.js (CDN) once and initialize it. Paddle.js defaults to live; only sandbox is set explicitly.
  useEffect(() => {
    if (!PADDLE_TOKEN) return;
    function init() {
      try {
        if (!PADDLE_LIVE) window.Paddle.Environment.set("sandbox");
        window.Paddle.Initialize({
          token: PADDLE_TOKEN,
          eventCallback: (e) => {
            if (e && e.name === "checkout.completed") {
              setNotice("Payment complete. Your license key is on its way by email — check your inbox, then paste the key into the NOVA Trame panel.");
            }
          }
        });
        setPaddleReady(true);
      } catch (err) { /* ignore */ }
    }
    if (window.Paddle) { init(); return; }
    const sc = document.createElement("script");
    sc.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    sc.async = true;
    sc.onload = init;
    document.body.appendChild(sc);
  }, []);

  function buy(priceId) {
    if (!priceId) return;
    if (!paddleReady || !window.Paddle) { setNotice("Checkout is still loading, please try again in a moment."); return; }
    window.Paddle.Checkout.open({ items: [{ priceId: priceId, quantity: 1 }] });
  }

  const groups = useMemo(() => data.groups.map(g => ({ ...g, label: GROUP_LABELS[g.id] || g.id })), []);
  const counts = useMemo(() => {
    const c = {};
    data.styles.forEach(s => { c[s.group] = (c[s.group] || 0) + 1; });
    return c;
  }, []);
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.styles.filter(s =>
      (active === "all" || s.group === active) &&
      (!q || s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q))
    );
  }, [active, query]);

  return <main className="tool-page trame-page">
    <header className="nav-wrap"><nav className="nav shell"><a href="/" className="brand brand-mark-link" aria-label="Nova Nesting home" title="Nova Nesting"><img src="https://drive.google.com/thumbnail?id=1Nz3XYxmcu7rB8w5hgPyfxT-4HJrIuY8h&sz=w1000" className="brand-mark-img" alt="NOVA NESTING AI logo" width={120} height={100}/></a><div className="nav-links"><a href="/#tools">Tools</a><a href="#features">Features</a><a href="#workflow">Workflow</a><a href="#styles">Styles</a><a href="#pricing">Pricing</a><a href="/guides">Guides</a></div><a href="#pricing" className="nav-buy">Pricing <ArrowRight size={15}/></a></nav></header>

    <div className="tool-breadcrumb shell"><a href="/">All tools</a><span>/</span><span>NOVA Trame</span></div>

    <section className="tool-hero shell">
      <div className="tool-hero-copy">
        <span className="status-label status-label-active"><i/> AVAILABLE</span>
        <p className="eyebrow">PHOTOSHOP PLUGIN · DTF HALFTONE</p>
        <h1>NOVA Trame</h1>
        <p className="tool-intro">Halftone styles built for DTF printing on black and white shirts.</p>
        <p className="tool-description">Pick from {data.styles.length} halftone styles, set the frequency from the print size, and check the result in a live preview before you apply it.</p>
        <div className="tool-hero-actions"><a className="button dark" href="#styles">Browse {data.styles.length} styles <ArrowRight size={16}/></a><a className="button outline" href="#workflow">See the workflow</a><a className="button outline" href="/trame/NOVA-NESTING-TRAME-SET_UP.zip" download><Download size={15}/> Free Download</a></div>
        <div className="tool-trust"><span><Check size={14}/> Built for DTF</span><span><Sparkles size={14}/> {data.styles.length} styles</span></div>
      </div>
      <div className="tool-preview tool-video-preview trame-video">
        <div className="tool-video-titlebar"><span className="tool-video-window-title">NOVA Trame · Product video</span><div className="tool-video-window-controls" aria-hidden="true"><i className="tool-video-minimize"/><i className="tool-video-maximize"/><i className="tool-video-close"/></div></div>
        <div className="tool-video-frame"><video src="/trame/nova-trame-ad.mp4" autoPlay muted loop playsInline controls preload="metadata" aria-label="NOVA Trame product video"/></div>
      </div>
    </section>

    <section id="features" className="tool-features shell">
      <div className="tool-section-head"><p className="eyebrow">KEY CAPABILITIES</p><h2>Made for the shirts<br/>you print every day.</h2><p>Each part of the plugin is built around DTF output on dark and light fabric.</p></div>
      <div className="tool-feature-grid">{FEATURES.map(([title, text], i) => <article key={title} className="tool-feature-card"><span>{String(i + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
    </section>

    <section id="workflow" className="tool-workflow"><div className="shell">
      <div className="tool-section-head"><p className="eyebrow">HOW IT WORKS</p><h2>From artwork to RIP-ready file.</h2><p>Four steps from opening the artwork to exporting the print file.</p></div>
      <div className="tool-steps">{STEPS.map((step, i) => <div key={step}><b>{String(i + 1).padStart(2, "0")}</b><p>{step}</p></div>)}</div>
      <aside className="tool-workflow-note"><strong>Before you export</strong><p>Turn off the preview solid layer. It is only there to show the shirt color while you work.</p></aside>
    </div></section>

    <section id="styles" className="tool-resources shell">
      <div className="tool-section-head"><p className="eyebrow">STYLE LIBRARY</p><h2>Browse every style.</h2><p>Filter by group or search by name. Each style shows its icon and a short description.</p></div>
      <div className="trame-toolbar">
        <div className="trame-chips" role="tablist" aria-label="Style groups">
          <button className={"trame-chip" + (active === "all" ? " active" : "")} onClick={() => setActive("all")}>All <span>{data.styles.length}</span></button>
          {groups.map(g => <button key={g.id} className={"trame-chip" + (active === g.id ? " active" : "")} onClick={() => setActive(g.id)}>{g.label} <span>{counts[g.id] || 0}</span></button>)}
        </div>
        <input className="trame-search" type="search" placeholder="Search styles" value={query} onChange={e => setQuery(e.target.value)} aria-label="Search styles"/>
      </div>
      <p className="trame-count">Showing {shown.length} of {data.styles.length}</p>
      <div className="trame-grid">{shown.map(s => <article className="trame-tile" key={s.id}><div className="trame-im"><img src={"/trame/icons/" + s.id + ".png"} alt="" loading="lazy" width={64} height={64}/></div><h3>{s.name}</h3><p>{s.desc}</p></article>)}</div>
      {shown.length === 0 && <p className="trame-empty">No styles match your search.</p>}
    </section>

    <section id="pricing" className="trame-pricing shell">
      <div className="tool-section-head"><p className="eyebrow">PICK YOUR ACCESS</p><h2>NOVA Trame pricing.</h2><p>Choose the access period that fits your production. Prices are in USD.</p></div>
      <div className="trame-plans">{PLANS.map(p => <article key={p.name} className={"trame-plan" + (p.recommended ? " trame-plan-pro" : "")}>
        {p.recommended && <span className="trame-badge">RECOMMENDED</span>}
        <p className="eyebrow">{p.kicker}</p>
        <h3>{p.name}</h3>
        <p className="trame-price"><b>{p.price}</b><span>{p.period}</span></p>
        <p className="trame-plan-text">{p.text}</p>
        <ul>{p.features.map(f => <li key={f}><Check size={14}/>{f}</li>)}</ul>
        {p.priceId
          ? <button className="trame-cta" onClick={() => buy(p.priceId)}>Buy {p.name} <ArrowRight size={15}/></button>
          : <a className="trame-cta" href="/trame-preview/install">Get the 7-day trial <ArrowRight size={15}/></a>}
      </article>)}</div>
      {notice && <p className="trame-notice">{notice}</p>}
      <p className="trame-note">After payment, your license key is emailed to you. Paste it into the NOVA Trame panel in Photoshop to activate. The 7-day trial starts from inside the plugin — no payment needed.</p>
    </section>

    <section id="resources" className="tool-resources shell">
      <div className="tool-section-head"><p className="eyebrow">RESOURCES</p><h2>Guides for NOVA Trame.</h2><p>Install the plugin, then learn the workflow step by step.</p></div>
      <div className="article-grid">
        <a className="article-card" href="/trame-preview/install"><div className="article-art"><span>INSTALLATION GUIDE</span></div><div className="article-meta"><span>GUIDE</span></div><h3>How to install NOVA Trame</h3><p>Install the plugin on Windows or macOS, without Creative Cloud.</p><strong>Read article <ArrowRight size={14}/></strong></a>
        <a className="article-card" href="/trame-preview/guide"><div className="article-art"><span>USAGE GUIDE</span></div><div className="article-meta"><span>GUIDE</span></div><h3>How to use NOVA Trame</h3><p>From artwork to a RIP-ready file: shirt color, styles, preview and export.</p><strong>Read article <ArrowRight size={14}/></strong></a>
      </div>
    </section>

    <footer className="footer shell"><a href="/">Nova Nesting</a><nav className="footer-legal" aria-label="Legal and support"><a href="/policies#terms">Terms</a><a href="/policies#refunds">Refunds</a><a href="/policies#license">License</a><a href="/policies#privacy">Privacy</a><a href="/support">Support</a></nav><span>© 2026 Nova Nesting</span></footer>

    <style>{`
      .trame-video video{width:100%;height:100%;display:block;object-fit:contain;background:#000}
      .trame-canvas{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;padding:18px;align-content:center;background:#fff}
      .trame-canvas img{width:100%;height:auto;aspect-ratio:1/1;object-fit:contain;image-rendering:pixelated;border-radius:6px;background:#111}
      .trame-canvas .preview-status{grid-column:1/-1}
      .trame-toolbar{display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between;margin:28px 0 12px}
      .trame-chips{display:flex;flex-wrap:wrap;gap:8px}
      .trame-chip{border:1px solid currentColor;background:transparent;border-radius:999px;padding:6px 12px;cursor:pointer;font:inherit;opacity:.7;color:inherit}
      .trame-chip.active{opacity:1;font-weight:600}
      .trame-chip span{opacity:.6;margin-left:4px}
      .trame-search{min-width:220px;padding:8px 12px;border-radius:8px;border:1px solid #888;font:inherit;background:transparent;color:inherit}
      .trame-count{opacity:.65;margin:0 0 14px}
      .trame-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:16px}
      .trame-tile{border:1px solid rgba(128,128,128,.3);border-radius:14px;padding:14px}
      .trame-im{background:#fff;border-radius:8px;aspect-ratio:1/1;display:flex;align-items:center;justify-content:center;margin-bottom:10px;overflow:hidden}
      .trame-im img{width:100%;height:100%;object-fit:contain;image-rendering:pixelated}
      .trame-tile h3{font-size:1rem;margin:0 0 4px}
      .trame-tile p{font-size:.85rem;opacity:.75;margin:0;line-height:1.4}
      .trame-empty{opacity:.65}
      .trame-pricing{margin:40px auto 0;padding-bottom:40px}
      .trame-plans{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;margin-top:24px}
      .trame-plan{position:relative;border:1px solid rgba(128,128,128,.3);border-radius:18px;padding:24px;display:flex;flex-direction:column;background:#15191a;color:#f0efeb}
      .trame-plan-pro{border-color:#8fd4a8;background:linear-gradient(160deg,#1d2a24,#15191a)}
      .trame-plan h3{font-size:1.6rem;margin:6px 0 10px}
      .trame-price{display:flex;align-items:baseline;gap:8px;margin:6px 0 12px}
      .trame-price b{font-size:2.6rem;line-height:1;color:#b9ecd0}
      .trame-price span{opacity:.7;font-size:.9rem}
      .trame-plan-text{opacity:.75;font-size:.92rem;line-height:1.5;min-height:66px}
      .trame-plan ul{list-style:none;padding:0;margin:14px 0 20px;display:grid;gap:8px;flex:1}
      .trame-plan li{display:flex;gap:8px;font-size:.9rem;align-items:flex-start}
      .trame-cta{display:inline-flex;align-items:center;justify-content:center;gap:6px;width:100%;box-sizing:border-box;text-align:center;border:1px solid #8fd4a8;color:#cdeace;background:transparent;border-radius:999px;padding:12px;margin-top:4px;font:inherit;font-weight:600;cursor:pointer;text-decoration:none;transition:background .15s,color .15s}
      .trame-cta:hover{background:#8fd4a8;color:#0d1f16}
      .trame-plan-pro .trame-cta{background:#b9ecd0;color:#0d1f16;border-color:#b9ecd0}
      .trame-plan-pro .trame-cta:hover{background:#cdeace}
      .trame-badge{position:absolute;top:18px;right:18px;background:#b9ecd0;color:#0d1f16;border-radius:999px;padding:4px 10px;font-size:.7rem;font-weight:700;letter-spacing:.06em}
      .trame-notice{margin-top:16px;padding:12px 16px;border:1px solid #8fd4a8;border-radius:10px;background:rgba(143,212,168,.12);color:#bfe8cf;font-size:.95rem}
      .trame-note{opacity:.6;font-size:.85rem;margin-top:20px}
    `}</style>
  </main>;
}
