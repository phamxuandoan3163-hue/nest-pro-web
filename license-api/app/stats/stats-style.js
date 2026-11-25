// Shared by page.js and loading.js.
export const FONTS = "https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;600;700&family=IBM+Plex+Mono&display=swap";

export const CSS = `
:root{--bg:#f6f7f5;--panel:#ffffff;--ink:#16191a;--muted:#646b6c;--line:#e3e6e3;--a:#2f6f62;--b:#c2662d;--c:#6a4fb3;--ok:#1f7a4d;--warn:#a86a00;--bad:#b3261e;--track:#edf0ed}
@media (prefers-color-scheme:dark){:root{--bg:#111415;--panel:#191d1e;--ink:#eceeeb;--muted:#9aa1a1;--line:#2a3031;--a:#5fb3a1;--b:#e08a52;--c:#a28ae6;--ok:#5cc08b;--warn:#e0a63f;--bad:#f0817a;--track:#232829;color-scheme:dark}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink)}
.wrap{font:14px/1.5 "Be Vietnam Pro",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;max-width:1180px;margin:0 auto;padding:28px max(16px,env(safe-area-inset-right,0px)) 48px max(16px,env(safe-area-inset-left,0px));display:grid;gap:18px}
.top{display:flex;flex-wrap:wrap;gap:16px;align-items:flex-end;justify-content:space-between}
.eyebrow{margin:0;color:var(--muted);font-size:11px;letter-spacing:.12em;text-transform:uppercase}
h1{margin:2px 0 4px;font-size:26px;letter-spacing:-.02em;text-wrap:balance}
.sub{margin:0;color:var(--muted)}
.refresh{color:var(--a);font-weight:600}
.range{display:flex;background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:3px}
.range a{padding:6px 12px;border-radius:7px;color:var(--muted);text-decoration:none;font-weight:600}
.range a[aria-current]{background:var(--ink);color:var(--bg)}
.range a:focus-visible{outline:2px solid var(--a);outline-offset:2px}
.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px}
.kpi{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:14px 16px;display:grid;gap:2px}
.kpi span{color:var(--muted);font-size:12px;font-weight:600}
.kpi b{font-size:30px;line-height:1.1;font-variant-numeric:tabular-nums;letter-spacing:-.02em}
.kpi small{color:var(--muted);font-size:12px}
.kpi.accent b{color:var(--c)}
.charts{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px}
.chart,.panel{margin:0;background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:14px 16px;min-width:0}
.chart figcaption{display:flex;justify-content:space-between;font-weight:600;font-size:13px;margin-bottom:6px}
.chart figcaption b{font-variant-numeric:tabular-nums}
.chart svg{width:100%;height:auto;display:block}
.grid{stroke:var(--line);stroke-width:1}
.axis{fill:var(--muted);font-size:10px;font-variant-numeric:tabular-nums}
.bar.a{fill:var(--a)}.bar.b{fill:var(--b)}.bar.c{fill:var(--c)}
.grid2{display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:12px}
.grid3{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px}
h2{margin:0 0 10px;font-size:14px}
h2.gap{margin-top:18px}
.rank{list-style:none;margin:0;padding:0;display:grid;gap:8px}
.rank-row{display:flex;justify-content:space-between;gap:10px;font-size:13px}
.rank-name{min-width:0;overflow-wrap:anywhere}
.rank-val{font-variant-numeric:tabular-nums;font-weight:600;white-space:nowrap}
.rank-val small,.muted{color:var(--muted);font-weight:400}
.rank-track{height:5px;background:var(--track);border-radius:3px;margin-top:3px}
.rank-fill{height:100%;background:var(--a);border-radius:3px;min-width:2px}
code{font:12px/1.4 "IBM Plex Mono",ui-monospace,Consolas,monospace;background:var(--track);padding:1px 5px;border-radius:4px}
code.path{background:none;padding:0}
.funnel{list-style:none;margin:0;padding:0;display:grid;gap:6px}
.funnel li{display:flex;justify-content:space-between;border-bottom:1px dashed var(--line);padding:4px 0}
.funnel b{font-variant-numeric:tabular-nums}
.tbl-scroll{overflow-x:auto}
.tbl{width:100%;border-collapse:collapse;font-size:13px}
.tbl th{text-align:left;color:var(--muted);font-weight:600;font-size:12px;border-bottom:1px solid var(--line);padding:6px 8px 6px 0}
.tbl td{border-bottom:1px solid var(--line);padding:7px 8px 7px 0;white-space:nowrap}
.tbl .r{text-align:right;font-variant-numeric:tabular-nums}
.mono{font-family:"IBM Plex Mono",ui-monospace,Consolas,monospace;font-size:12px}
.pill{display:inline-block;margin-left:6px;padding:0 7px;border-radius:999px;font-size:11px;font-weight:600;border:1px solid currentColor}
.pill.ok{color:var(--ok);margin-left:0}.pill.bad{color:var(--bad);margin-left:0}.pill.warn{color:var(--warn)}
.empty{color:var(--muted);margin:0}
.note{color:var(--muted);font-size:12px;margin:8px 0 0}
.foot{color:var(--muted);font-size:12px;max-width:80ch}

.skel{background:var(--track);border-radius:6px;animation:pulse 1.2s ease-in-out infinite}
@keyframes pulse{50%{opacity:.55}}
@media (prefers-reduced-motion:reduce){.skel{animation:none}}
`;
