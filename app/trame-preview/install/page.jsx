import { ArrowRight } from "lucide-react";

export const metadata = {
  title: "How to install NOVA Trame",
  description: "Step-by-step guide to installing the NOVA Trame Photoshop plugin on Windows and macOS, without Creative Cloud.",
  alternates: { canonical: "/trame-preview/install" }
};

const STEPS = [
  { t: "Download and unzip the package", b: "Download the NOVA Trame package and extract the whole folder. Keep the folder together: the installer reads the plugin files from it, so do not run the script from inside the zip file." },
  { t: "Windows: run the installer", b: "Double-click CAI-DAT-Windows.bat. The script allows Photoshop to load the plugin and copies it to your CEP extensions folder. When it prints that the install is complete, press any key to close the window." },
  { t: "macOS: open the installer", b: "Right-click CAI-DAT-Mac.command and choose Open. Confirm the warning if macOS asks. The script installs the plugin the same way as on Windows." },
  { t: "Restart Photoshop", b: "Quit Photoshop completely and open it again. The plugin is only detected when Photoshop starts." },
  { t: "Open the panel", b: "Go to Window > Extensions (legacy) > NOVA Trame Studio. On Photoshop versions older than 2021, the menu is Window > Extensions." },
  { t: "Optional: open the preview panel", b: "To see the result in a separate window, go to Window > Extensions > NOVA Trame Preview. You can move it to another area of the screen." }
];

export default function InstallPage() {
  return <main className="article-page">
    <header className="nav-wrap"><nav className="nav shell"><a href="/" className="brand brand-mark-link" aria-label="Nova Nesting home" title="Nova Nesting"><img src="https://drive.google.com/thumbnail?id=1Nz3XYxmcu7rB8w5hgPyfxT-4HJrIuY8h&sz=w1000" className="brand-mark-img" alt="NOVA NESTING AI logo" width={120} height={100}/></a><div className="nav-links"><a href="/trame-preview#features">Features</a><a href="/trame-preview#workflow">Workflow</a><a href="/trame-preview#styles">Styles</a><a href="/trame-preview/guide">Guide</a></div><a href="/trame-preview" className="nav-buy">Back to NOVA Trame <ArrowRight size={15}/></a></nav></header>
    <div className="shell article-breadcrumb"><a href="/">All tools</a><span>/</span><a href="/trame-preview">NOVA Trame</a><span>/</span><span>Installation</span></div>
    <article className="article-body shell">
      <a className="article-back" href="/trame-preview#resources"><ArrowRight size={14}/> Back to NOVA Trame resources</a>
      <span className="status-label"><i/> INSTALLATION GUIDE</span>
      <h1>How to install NOVA Trame</h1>
      <p className="article-intro">NOVA Trame installs as a regular Photoshop panel. You do not need to sign in to Creative Cloud. The steps below take about five minutes.</p>
      <div className="article-banner"><span>Requires Adobe Photoshop CC 2015 or newer · Windows or macOS</span></div>

      {STEPS.map((s, i) => <section className="article-section" key={s.t}><span>{String(i + 1).padStart(2, "0")}</span><div><h2>{s.t}</h2><p>{s.b}</p>{i === 4 && <figure className="guide-figure"><img src="/trame/guide/panel-new-file.png" alt="NOVA Trame Studio panel open in Photoshop, showing the New file tab" width={640} height={2000} loading="lazy"/><figcaption>The panel opens on the 1 · New file tab. The DTF halftone tab is next to it.</figcaption></figure>}</div></section>)}

      <section className="article-section"><span>!</span><div><h2>Updating to a newer version</h2><p>Run the installer again from the new package. It replaces the old files, then restart Photoshop.</p></div></section>
      <section className="article-section"><span>?</span><div><h2>If the panel does not appear</h2><p>Check that you restarted Photoshop after installing. Then look at the status line under the Apply halftone button and copy the log. Send the log to our <a href="/support">support page</a>, together with your Photoshop version and operating system.</p></div></section>

      <div className="article-bottom"><p>Ready to make your first halftone?</p><a className="button dark" href="/trame-preview/guide">Read the usage guide <ArrowRight size={15}/></a></div>
    </article>
    <style>{`.guide-figure{margin:24px 0 8px;max-width:360px}.guide-figure img{width:100%;height:auto;border-radius:12px;border:1px solid rgba(128,128,128,.3)}.guide-figure figcaption{font-size:.85rem;opacity:.7;margin-top:8px}`}</style>
    <footer className="footer shell"><a href="/">Nova Nesting</a><nav className="footer-legal" aria-label="Legal and support"><a href="/policies#terms">Terms</a><a href="/policies#refunds">Refunds</a><a href="/policies#license">License</a><a href="/policies#privacy">Privacy</a><a href="/support">Support</a></nav><span>© 2026 Nova Nesting</span></footer>
  </main>;
}
