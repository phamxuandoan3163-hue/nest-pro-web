import { ArrowRight } from "lucide-react";

export const metadata = {
  title: "How to use NOVA Trame",
  description: "Usage guide for NOVA Trame: choose a shirt color, pick a halftone style, check the preview and export a print-ready file for DTF.",
  alternates: { canonical: "/trame-preview/guide" }
};

const STEPS = [
  { t: "Prepare the artwork", b: "Open the artwork in Photoshop and set its real print size in the document. The LPI is calculated from the longest side of the document, so a correct size gives the right dot frequency. Select a regular layer that holds the artwork. Background layers are not supported." },
  { t: "Choose the shirt color", b: "Pick DTF black shirt or DTF white shirt at the top of the DTF halftone tab. On a black shirt, light parts of the image become dots and a white underbase is added. On a white shirt, dark parts become dots and light parts show the shirt.", img: "/trame/guide/panel-black-shirt.png", alt: "NOVA Trame Studio with DTF black shirt selected and the Basic halftone style chosen", cap: "DTF black shirt selected, with a Basic style." },
  { t: "Pick a halftone style", b: "Choose a group, such as Basic, Grunge, Shapes, Patterns, Trends or Vintage, then click a style. Each style has an icon and a short description. The Color group only appears for DTF white shirt, because color halftones need a white background to print on." , img: "/trame/guide/panel-white-shirt.png", alt: "NOVA Trame Studio with DTF white shirt selected and a Color style chosen", cap: "DTF white shirt selected, with a Color style. The Color group is only shown in this mode." },
  { t: "Check the preview", b: "With Auto update turned on, the preview refreshes as you change settings. Use Full view to see the whole design, or 100% close-up to see the dots exactly as they will print. If the dots are too small for Full view, the panel shows a warning. Use Preview to open the separate preview panel." },
  { t: "Adjust the settings", b: "Frequency (LPI) is set from the print size. You can change it by hand, and the Recommended button returns to the automatic value. Minimum dot size and solid percentage control how small dots are kept and when an area becomes solid. Underbase and choke control the white layer under the print. Vintage styles also have an intensity slider." },
  { t: "Apply the halftone", b: "Click Apply halftone. The result opens in a new document, with a preview solid layer underneath that shows the shirt color. Hide the preview solid layer before you export, because it is only there to help you look at the design." },
  { t: "Export for your RIP", b: "Hide the preview solid layer, then export the result as a transparent PNG and send it to your RIP software." }
];

export default function GuidePage() {
  return <main className="article-page">
    <header className="nav-wrap"><nav className="nav shell"><a href="/" className="brand brand-mark-link" aria-label="Nova Nesting home" title="Nova Nesting"><img src="https://drive.google.com/thumbnail?id=1Nz3XYxmcu7rB8w5hgPyfxT-4HJrIuY8h&sz=w1000" className="brand-mark-img" alt="NOVA NESTING AI logo" width={120} height={100}/></a><div className="nav-links"><a href="/trame-preview#features">Features</a><a href="/trame-preview#workflow">Workflow</a><a href="/trame-preview/install">Install</a></div><a href="/trame-preview" className="nav-buy">Back to NOVA Trame <ArrowRight size={15}/></a></nav></header>
    <div className="shell article-breadcrumb"><a href="/">All tools</a><span>/</span><a href="/trame-preview">NOVA Trame</a><span>/</span><span>Usage guide</span></div>
    <article className="article-body shell">
      <a className="article-back" href="/trame-preview#resources"><ArrowRight size={14}/> Back to NOVA Trame resources</a>
      <span className="status-label"><i/> USAGE GUIDE</span>
      <h1>How to use NOVA Trame</h1>
      <p className="article-intro">This guide walks through a complete job, from the artwork to a file ready for your RIP.</p>
      <div className="article-banner"><span>NOVA Trame · Photoshop plugin · DTF halftone</span></div>

      {STEPS.map((s, i) => <section className="article-section" key={s.t}><span>{String(i + 1).padStart(2, "0")}</span><div><h2>{s.t}</h2><p>{s.b}</p>{s.img && <figure className="guide-figure"><img src={s.img} alt={s.alt} width={640} height={2000} loading="lazy"/><figcaption>{s.cap}</figcaption></figure>}</div></section>)}

      <section className="article-section"><span>!</span><div><h2>Tips for good results</h2><p>Check the shirt color before you choose a style, because the same style prints differently on black and white. Use 100% close-up to confirm the smallest dots before you apply. Keep the document at the real print size so the automatic LPI matches the job.</p></div></section>

      <div className="article-bottom"><p>Need the installation steps first?</p><a className="button dark" href="/trame-preview/install">Read the installation guide <ArrowRight size={15}/></a></div>
    </article>
    <style>{`.guide-figure{margin:24px 0 8px;max-width:360px}.guide-figure img{width:100%;height:auto;border-radius:12px;border:1px solid rgba(128,128,128,.3)}.guide-figure figcaption{font-size:.85rem;opacity:.7;margin-top:8px}`}</style>
    <footer className="footer shell"><a href="/">Nova Nesting</a><nav className="footer-legal" aria-label="Legal and support"><a href="/policies#terms">Terms</a><a href="/policies#refunds">Refunds</a><a href="/policies#license">License</a><a href="/policies#privacy">Privacy</a><a href="/support">Support</a></nav><span>© 2026 Nova Nesting</span></footer>
  </main>;
}
