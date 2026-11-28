"use client";
import NavLinks from "../nav-links";
import { ArrowRight, BookOpen, ScanLine, Scissors, Workflow } from "lucide-react";

const guides = [
  {
    category: "START HERE",
    title: "Getting Started with Nova Nesting in Illustrator",
    description: "Prepare an Illustrator file, set tolerance, decide whether to use Laser Cut, and review the output.",
    href: "/tools/nest-pro/articles/getting-started",
    icon: BookOpen
  },
  {
    category: "MATCHING GUIDE",
    title: "How Silhouette Matching Works in Nova Nesting",
    description: "Understand the main matching concepts and what to check if a design is paired with the wrong pattern.",
    href: "/tools/nest-pro/articles/how-silhouette-matching-works",
    icon: ScanLine
  },
  {
    category: "WORKFLOW",
    title: "Nesting + Laser Cut Workflow in Illustrator, Step by Step",
    description: "Follow the practical order from preparing the source file through checking the result and saving.",
    href: "/tools/nest-pro/articles/nesting-workflow",
    icon: Workflow
  },
  {
    category: "LASER CUT",
    title: "Set Inside and Outside Laser Strokes in Illustrator",
    description: "Choose stroke widths and colors, manage the LASER CUT layer, and review generated paths safely.",
    href: "/tools/nest-pro/articles/laser-stroke-output",
    icon: Scissors
  }
];

const trameGuides = [
  { category: "INSTALLATION", title: "How to Install NOVA Trame in Photoshop (Windows & Mac)", description: "Install the plugin on Windows or macOS in about five minutes, without Creative Cloud.", href: "/trame-preview/install", icon: BookOpen },
  { category: "USAGE", title: "How to Use NOVA Trame: DTF Halftone Workflow", description: "Choose a shirt color, pick a halftone style, check the preview and export a transparent PNG for your RIP.", href: "/trame-preview/guide", icon: Workflow }
];

export default function GuidesPage() {
  return (
    <main className="guides-page">
      <header className="nav-wrap">
        <nav className="nav shell">
          <a href="/" className="brand brand-mark-link" aria-label="Nova Nesting home" title="Nova Nesting"><img src="/media/nova-nesting-logo.webp" className="brand-mark-img" alt="NOVA NESTING AI logo" width={120} height={100}/></a>
          <NavLinks/>
        </nav>
      </header>

      <section className="guides-hero shell">
        <p className="eyebrow">HELP CENTER / TOOL GUIDES</p>
        <h1>Learn the tool.<br/><em>Use it with confidence.</em></h1>
        <p className="guides-lead">Find practical guides for setting up your Illustrator file, running Nova Nesting, configuring optional Laser Cut output, and checking the result before production.</p>
        <div className="guides-hero-actions">
          <a className="button dark" href="/tools/nest-pro/articles/getting-started">Start with the basics <ArrowRight size={15}/></a>
          <a className="button outline" href="#guide-library"><BookOpen size={15}/> Browse all guides</a>
        </div>
      </section>

      <section className="guides-start shell">
        <div className="guides-section-head">
          <div><p className="eyebrow">RECOMMENDED ORDER</p><h2>Three steps to get going.</h2></div>
          <p>Start with the setup guide, run the workflow in order, then use the laser guide only when your job needs laser output.</p>
        </div>
        <div className="guides-steps">
          <article className="guides-step"><span>01 / PREPARE</span><h3>Set up the source file</h3><p>Open the right Illustrator document and prepare the artboard and artwork before running.</p></article>
          <article className="guides-step"><span>02 / RUN</span><h3>Follow the workflow</h3><p>Set the tolerance, run Nova Nesting, then check placement and the final document.</p></article>
          <article className="guides-step"><span>03 / REVIEW</span><h3>Check before production</h3><p>Inspect the geometry and layer contents, then save the Illustrator file manually.</p></article>
        </div>
      </section>

      <section id="guide-library" className="guides-library shell">
        <div className="guides-section-head">
          <div><p className="eyebrow">NOVA NESTING FOR ILLUSTRATOR</p><h2>Marker making and nesting guides.</h2></div>
          <p>Usage instructions live here, separate from product features and the short workflow overview.</p>
        </div>
        <div className="guides-library-grid">
          {guides.map((guide) => {
            const Icon = guide.icon;
            return (
              <a className="guides-card" key={guide.href} href={guide.href}>
                <div className="guides-card-top">
                  <span className="guides-card-tag">{guide.category}</span>
                  <span className="guides-card-icon"><Icon size={17}/></span>
                </div>
                <h3>{guide.title}</h3>
                <p>{guide.description}</p>
                <strong>Read guide <ArrowRight size={14}/></strong>
              </a>
            );
          })}
        </div>
        <div className="guides-section-head" style={{marginTop:56}}>
          <div><p className="eyebrow">NOVA TRAME FOR PHOTOSHOP</p><h2>DTF halftone guides.</h2></div>
          <p>Install the NOVA Trame plugin, then follow a complete job from artwork to a RIP-ready file.</p>
        </div>
        <div className="guides-library-grid">
          {trameGuides.map((guide) => {
            const Icon = guide.icon;
            return (
              <a className="guides-card" key={guide.href} href={guide.href}>
                <div className="guides-card-top"><span className="guides-card-tag">{guide.category}</span><span className="guides-card-icon"><Icon size={17}/></span></div>
                <h3>{guide.title}</h3>
                <p>{guide.description}</p>
                <strong>Read guide <ArrowRight size={14}/></strong>
              </a>
            );
          })}
        </div>
        <div className="guides-note"><b>Before running Laser Cut:</b> it is optional and starts OFF by default. When enabled, use a dedicated LASER CUT layer because the selected output layer is cleared before new stroke paths are generated.</div>
      </section>

      <section className="guides-footer-cta">
        <div className="shell guides-footer-inner">
          <div><p className="eyebrow">PRODUCT DETAILS</p><h2>Need the feature overview?</h2><p>Visit the product page for capabilities, basic workflow, requirements, and release-specific resources.</p></div>
          <a className="button light" href="/tools/nest-pro">Explore Nova Nesting <ArrowRight size={15}/></a>
        </div>
      </section>

      <footer className="footer shell">
        <a href="/">Nova Nesting</a>
        <nav className="footer-legal" aria-label="Footer">
          <a href="/tools/nest-pro">Nova Nesting</a><a href="/trame-preview">NOVA Trame</a><a href="/guides">Guides</a><a href="/policies#terms">Terms</a><a href="/policies#refunds">Refunds</a><a href="/policies#license">License</a><a href="/policies#privacy">Privacy</a><a href="/support">Support</a>
        </nav>
        <a href="/">All tools</a>
      </footer>
    </main>
  );
}
