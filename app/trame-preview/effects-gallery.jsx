"use client";
import { useRef, useState } from "react";
import { EFFECTS } from "./effects-data";

const BASE = "/trame/effects";
const GROUPS = [
  { id: "black", title: "Effects for Black Shirts", text: "Explore how bright marks and colored highlights shape the artwork on a dark shirt. The last three samples show faded print, sepia photography, and woodcut styles.", range: [1, 12] },
  { id: "white", title: "Effects for White Shirts", text: "See how dark marks and colored patterns stand out against a light shirt. Compare scattered grain, short strokes, geometric textures, and color effects.", range: [13, 24] }
];

// Pin position is stored for a square box; the artwork is centered inside it (object-fit: contain).
const pinStyle = ([x, y]) => ({ left: `${x}%`, top: `${y}%` });
const lineEnd = [78, 73]; // center of the magnifier circle (right 5%, bottom 10%, 34% wide)

const pad = (n) => String(n).padStart(2, "0");
const warmed = new Set();
// Download the popup images early (on hover/touch) so the viewer opens instantly.
function warm(n) {
  if (typeof window === "undefined" || warmed.has(n)) return;
  warmed.add(n);
  for (const suffix of ["-full", "-detail-lg"]) { const i = new Image(); i.decoding = "async"; i.src = `${BASE}/${pad(n)}${suffix}.webp`; }
}

export default function EffectsGallery() {
  const dialogRef = useRef(null);
  const [active, setActive] = useState(null);
  const [ready, setReady] = useState({ full: false, detail: false });

  function open(item) {
    setActive(item);
    setReady({ full: false, detail: false });
    const d = dialogRef.current;
    if (d && !d.open) d.showModal();
  }

  return (
    <section id="effects" className="shell fx-section">
      <div className="tool-section-head">
        <p className="eyebrow">24 EFFECTS</p>
        <h2>24 NOVA Trame effects for black and white shirts.</h2>
        <p>See how NOVA Trame changes the texture of an illustration, from even halftone dots to rough grain, geometric patterns, and vintage finishes. Each circle magnifies a detail from its sample. Select any image to view the artwork and close-up side by side.</p>
      </div>

      {GROUPS.map((g) => (
        <div key={g.id} className={`fx-group fx-${g.id}`}>
          <h3>{g.title}</h3>
          <p>{g.text}</p>
          <div className="fx-grid">
            {EFFECTS.filter(([n]) => n >= g.range[0] && n <= g.range[1]).map((e) => {
              const [n, name, desc, pin] = e;
              const label = `${String(n).padStart(2, "0")}. ${name}`;
              return (
                <figure key={n}>
                  <button type="button" className="fx-visual" aria-label={`View ${label} and its magnified detail`} onClick={() => open(e)} onPointerEnter={() => warm(n)} onFocus={() => warm(n)} onTouchStart={() => warm(n)}>
                    <img className="fx-base" loading="lazy" decoding="async" src={`${BASE}/${String(n).padStart(2, "0")}.webp`} alt={`${label} on a ${g.id} shirt background`} />
                    <svg className="fx-guide" viewBox="0 0 100 100" aria-hidden="true">
                      <path d={`M ${pin[0]} ${pin[1]} L ${lineEnd[0]} ${lineEnd[1]}`} stroke="#111" strokeWidth="1.1" />
                      <path d={`M ${pin[0]} ${pin[1]} L ${lineEnd[0]} ${lineEnd[1]}`} stroke="#fff" strokeWidth=".5" />
                    </svg>
                    <span className="fx-pin" style={pinStyle(pin)} />
                    <img className="fx-zoom" loading="lazy" decoding="async" src={`${BASE}/${String(n).padStart(2, "0")}-detail.webp`} alt={`Magnified detail of ${label}`} />
                  </button>
                  <figcaption><strong>{label}</strong><p>{desc}</p></figcaption>
                </figure>
              );
            })}
          </div>
        </div>
      ))}

      <p className="fx-foot">For a subtle texture, start with Basic Dot. For a rougher streetwear finish, compare Gritty Grain with Photocopy. For a vintage look, compare the warm tint of Sepia Photo with the worn color of Faded Vintage.</p>

      <dialog ref={dialogRef} className="fx-dialog" aria-label="Artwork and magnified detail" onClick={(ev) => { if (ev.target === dialogRef.current) dialogRef.current.close(); }} onClose={() => setActive(null)}>
        <form method="dialog"><span className="fx-title">{active ? `${String(active[0]).padStart(2, "0")}. ${active[1]}` : ""}</span><button className="fx-close" aria-label="Close">Close</button></form>
        {active && (
          <div className="fx-preview">
            {/* The small image is already cached, so it shows at once and is swapped for the large one when that has loaded. */}
            <img src={`${BASE}/${pad(active[0])}${ready.full ? "-full" : ""}.webp`} alt={`${active[0]}. ${active[1]}`} />
            <img className="fx-large" src={`${BASE}/${pad(active[0])}${ready.detail ? "-detail-lg" : "-detail"}.webp`} alt={`Magnified detail of ${active[1]}`} />
            <img hidden alt="" src={`${BASE}/${pad(active[0])}-full.webp`} onLoad={() => setReady((r) => ({ ...r, full: true }))} />
            <img hidden alt="" src={`${BASE}/${pad(active[0])}-detail-lg.webp`} onLoad={() => setReady((r) => ({ ...r, detail: true }))} />
          </div>
        )}
      </dialog>
    </section>
  );
}
