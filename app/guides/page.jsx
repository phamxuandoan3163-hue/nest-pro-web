"use client";
import { ArrowRight, BookOpen, ScanLine, Scissors, Workflow } from "lucide-react";

const navItems = [
  { label: "Tools", href: "/#tools" },
  { label: "Features", href: "/tools/nest-pro#features" },
  { label: "Workflow", href: "/tools/nest-pro#workflow" },
  { label: "Resources", href: "/tools/nest-pro#resources" },
  { label: "Guides", href: "/guides", current: true }
];

const guides = [
  {
    category: "START HERE",
    title: "Getting started with Nest-Pro and Laser Cut",
    description: "Prepare an Illustrator file, set tolerance, decide whether to use Laser Cut, and review the output.",
    href: "/tools/nest-pro/articles/getting-started",
    icon: BookOpen
  },
  {
    category: "MATCHING GUIDE",
    title: "How silhouette matching works",
    description: "Understand the main matching concepts and what to check if a design is paired with the wrong pattern.",
    href: "/tools/nest-pro/articles/scan-modes",
    icon: ScanLine
  },
  {
    category: "WORKFLOW",
    title: "The Nest-Pro run sequence",
    description: "Follow the practical order from preparing the source file through checking the result and saving.",
    href: "/tools/nest-pro/articles/nesting-workflow",
    icon: Workflow
  },
  {
    category: "LASER CUT",
    title: "Configure Inside and Outside strokes",
    description: "Choose stroke widths and colors, manage the LASER CUT layer, and review generated paths safely.",
    href: "/tools/nest-pro/articles/laser-stroke-output",
    icon: Scissors
  }
];

export default function GuidesPage() {
  return (
    <main className="guides-page">
      <header className="nav-wrap">
        <nav className="nav shell">
          <a href="/" className="brand brand-mark-link" aria-label="Nest-Pro home" title="Nest-Pro"><img src="https://drive.google.com/thumbnail?id=1Nz3XYxmcu7rB8w5hgPyfxT-4HJrIuY8h&sz=w1000" className="brand-mark-img" alt="NOVA NESTING AI logo" width={120} height={100}/></a>
          <div className="nav-links">
            {navItems.map((item) => (
              <a key={item.label} href={item.href} aria-current={item.current ? "page" : undefined}>{item.label}</a>
            ))}
          </div>
          <a href="/license" className="nav-buy">Licensing <ArrowRight size={15}/></a>
        </nav>
      </header>

      <section className="guides-hero shell">
        <p className="eyebrow">HELP CENTER / TOOL GUIDES</p>
        <h1>Learn the tool.<br/><em>Use it with confidence.</em></h1>
        <p className="guides-lead">Find practical guides for setting up your Illustrator file, running Nest-Pro, configuring optional Laser Cut output, and checking the result before production.</p>
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
          <article className="guides-step"><span>02 / RUN</span><h3>Follow the workflow</h3><p>Set the tolerance, run Nest-Pro, then check placement and the final document.</p></article>
          <article className="guides-step"><span>03 / REVIEW</span><h3>Check before production</h3><p>Inspect the geometry and layer contents, then save the Illustrator file manually.</p></article>
        </div>
      </section>

      <section id="guide-library" className="guides-library shell">
        <div className="guides-section-head">
          <div><p className="eyebrow">GUIDE LIBRARY</p><h2>Find the answer you need.</h2></div>
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
        <div className="guides-note"><b>Before running Laser Cut:</b> it is optional and starts OFF by default. When enabled, use a dedicated LASER CUT layer because the selected output layer is cleared before new stroke paths are generated.</div>
      </section>

      <section className="guides-footer-cta">
        <div className="shell guides-footer-inner">
          <div><p className="eyebrow">PRODUCT DETAILS</p><h2>Need the feature overview?</h2><p>Visit the product page for capabilities, basic workflow, requirements, and release-specific resources.</p></div>
          <a className="button light" href="/tools/nest-pro">Explore Nest-Pro <ArrowRight size={15}/></a>
        </div>
      </section>

      <footer className="footer shell">
        <a href="/">Nest-Pro</a>
        <nav className="footer-legal" aria-label="Legal and support">
          <a href="/policies#terms">Terms</a><a href="/policies#refunds">Refunds</a><a href="/policies#license">License</a><a href="/policies#privacy">Privacy</a><a href="/support">Support</a>
        </nav>
        <a href="/">All tools</a>
      </footer>
    </main>
  );
}
