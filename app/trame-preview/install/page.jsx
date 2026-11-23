import { ArrowRight } from "lucide-react";

export const metadata = {
  title: "How to install NOVA Trame",
  description: "Step-by-step guide to installing the NOVA Trame Photoshop plugin on Windows and macOS, without Creative Cloud.",
  alternates: { canonical: "/trame-preview/install" }
};

const SHOT = (n, alt) => ({ src: `/trame/install/step-${n}.webp`, alt });
const STEPS = [
  { t: "Download the package", b: "Open the NOVA Trame page and click Download and Try for free. Your browser saves NOVA-NESTING-TRAME-SET_UP.zip, usually in your Downloads folder.", img: SHOT(1, "The Download and Try for free button highlighted on the NOVA Trame page.") },
  { t: "Find the downloaded zip file", b: "Open your Downloads folder and locate the zip file you just downloaded. Do not run anything from inside the zip.", img: SHOT(2, "The NOVA-NESTING-TRAME-SET_UP zip file highlighted in File Explorer.") },
  { t: "Extract the whole folder", b: "Right-click the zip file and choose Extract Here (or Extract All). Keep the folder together: the installer reads the plugin files from it.", img: SHOT(3, "Right-click menu with Extract Here highlighted.") },
  { t: "Windows: run the installer", b: "Open the extracted folder and double-click INSTALL-Windows.bat. It allows Photoshop to load the plugin and copies it to your CEP extensions folder.", img: SHOT(4, "INSTALL-Windows.bat highlighted in the extracted folder.") },
  { t: "macOS: open the installer", b: "Right-click INSTALL-Mac.command and choose Open. Confirm the warning if macOS asks. The script installs the plugin the same way as on Windows." },
  { t: "Wait for Installation complete", b: "When the window prints Installation complete, press any key to close it. Then quit Photoshop completely and open it again. The plugin is only detected when Photoshop starts.", img: SHOT(5, "The installer window showing Installation complete.") },
  { t: "Open the panel", b: "Go to Window > Extensions (legacy) > NOVA Trame Studio. On Photoshop versions older than 2021, the menu is Window > Extensions. Enter your license key or start the 7-day free trial in the License tab.", img: SHOT(6, "The NOVA Trame Studio panel open in Photoshop on the License tab.") },
  { t: "Optional: open the preview panel", b: "To see the result in a separate window, go to Window > Extensions (legacy) > NOVA Trame Preview. You can move it to another area of the screen." }
];

export default function InstallPage() {
  return <main className="article-page">
    <header className="nav-wrap"><nav className="nav shell"><a href="/" className="brand brand-mark-link" aria-label="Nova Nesting home" title="Nova Nesting"><img src="/media/nova-nesting-logo.webp" className="brand-mark-img" alt="NOVA NESTING AI logo" width={120} height={100}/></a><div className="nav-links"><a href="/trame-preview#features">Features</a><a href="/trame-preview/guide">Guide</a></div><a href="/trame-preview" className="nav-buy">Back to NOVA Trame <ArrowRight size={15}/></a></nav></header>
    <div className="shell article-breadcrumb"><a href="/">All tools</a><span>/</span><a href="/trame-preview">NOVA Trame</a><span>/</span><span>Installation</span></div>
    <article className="article-body shell">
      <a className="article-back" href="/trame-preview#resources"><ArrowRight size={14}/> Back to NOVA Trame resources</a>
      <span className="status-label"><i/> INSTALLATION GUIDE</span>
      <h1>How to install NOVA Trame</h1>
      <p className="article-intro">NOVA Trame installs as a regular Photoshop panel. You do not need to sign in to Creative Cloud. The steps below take about five minutes.</p>
      <div className="article-banner"><span>Requires Adobe Photoshop CC 2015 or newer · Windows or macOS</span></div>

      {STEPS.map((s, i) => <section className="article-section" key={s.t}><span>{String(i + 1).padStart(2, "0")}</span><div><h2>{s.t}</h2><p>{s.b}</p>{s.img && <figure className="install-shot"><img src={s.img.src} alt={s.img.alt} width={1400} height={793} loading={i < 2 ? "eager" : "lazy"} decoding="async"/></figure>}{i === 6 && <figure className="guide-figure"><img src="/trame/guide/panel-new-file.png" alt="NOVA Trame Studio panel open in Photoshop, showing the New file tab" width={640} height={2000} loading="lazy"/><figcaption>After you activate, the panel opens on the 1 · New file tab. The DTF halftone tab is next to it.</figcaption></figure>}</div></section>)}

      <section className="article-section"><span>!</span><div><h2>Updating to a newer version</h2><p>Run the installer again from the new package. It replaces the old files, then restart Photoshop.</p></div></section>
      <section className="article-section"><span>?</span><div><h2>If the panel does not appear</h2><p>Check that you restarted Photoshop after installing. Then look at the status line under the Apply halftone button and copy the log. Send the log to our <a href="/support">support page</a>, together with your Photoshop version and operating system.</p></div></section>

      <div className="article-bottom"><p>Ready to make your first halftone?</p><a className="button dark" href="/trame-preview/guide">Read the usage guide <ArrowRight size={15}/></a></div>
    </article>
    <style>{`.install-shot{margin:18px 0 6px}.install-shot img{width:100%;height:auto;border-radius:12px;border:1px solid rgba(128,128,128,.3);display:block}.guide-figure{margin:24px 0 8px;max-width:360px}.guide-figure img{width:100%;height:auto;border-radius:12px;border:1px solid rgba(128,128,128,.3)}.guide-figure figcaption{font-size:.85rem;opacity:.7;margin-top:8px}`}</style>
    <footer className="footer shell"><a href="/">Nova Nesting</a><nav className="footer-legal" aria-label="Legal and support"><a href="/policies#terms">Terms</a><a href="/policies#refunds">Refunds</a><a href="/policies#license">License</a><a href="/policies#privacy">Privacy</a><a href="/support">Support</a></nav><span>© 2026 Nova Nesting</span></footer>
  </main>;
}
