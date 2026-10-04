import { ArrowDownRight, ArrowRight, Check, Play, ScanLine, Sparkles, Layers3, RotateCw, Move, Zap } from "lucide-react";

const features = [
  { n:"01", icon:<ScanLine/>, title:"Pattern recognition", text:"Scan AI and PDF pattern files and detect the working shape automatically, without rebuilding the pattern by hand." },
  { n:"02", icon:<Layers3/>, title:"1–4 size detection", text:"Recognize one to four sizes in a pattern set and turn each detected size into a clean, usable layer structure." },
  { n:"03", icon:<RotateCw/>, title:"Smart orientation", text:"Detect the pattern direction and place artwork at the required 0° or 180° orientation." },
  { n:"04", icon:<Move/>, title:"Automatic placement", text:"Align design artwork to the matching pattern area and center it with production-ready positioning." },
  { n:"05", icon:<Sparkles/>, title:"Group + size workflow", text:"Combine design and size information into production groups while keeping the document structure clean." },
  { n:"06", icon:<Zap/>, title:"High performance scan", text:"Choose Quick Scan or High Performance Scan depending on file size and production workload." }
];

function BrandMark(){
  return <a href="#top" className="brand"><span>NEST-PRO</span><sup>AI</sup></a>
}

function Nav(){
  return <header className="nav-wrap">
    <nav className="nav shell">
      <BrandMark/>
      <div className="nav-links">
        <a href="#features">Features</a>
        <a href="#workflow">Workflow</a>
        <a href="#performance">Performance</a>
        <a href="#pricing">Pricing</a>
        <a href="#faq">FAQ</a>
      </div>
      <a href="#pricing" className="nav-buy">Get Nest-Pro <ArrowRight size={15}/></a>
    </nav>
  </header>
}

function ProductWindow(){
  return <div className="product-scene">
    <div className="window-top"><div className="dots"><i/><i/><i/></div><div className="window-title">Adobe Illustrator · Nest-Pro V2.0</div><div className="window-actions">AI&nbsp;&nbsp; Run</div></div>
    <div className="window-body">
      <aside className="tool-rail">
        <b>NEST-PRO</b>
        <span className="rail-active">Run Nesting</span>
        <span>Scan Pattern</span>
        <span>Group Size</span>
        <span>Placement</span>
        <span>Export</span>
      </aside>
      <div className="canvas">
        <div className="canvas-caption">AUTO NESTING / 3 SIZES DETECTED</div>
        <div className="pattern p1"><span>XL</span></div>
        <div className="pattern p2"><span>2XL</span></div>
        <div className="pattern p3"><span>3XL</span></div>
        <div className="design-mark">DESIGN</div>
        <div className="scan-box"></div>
      </div>
      <aside className="control-panel">
        <div className="cp-title">NEST-PRO AI</div>
        <label>Scan mode</label><div className="select">High Performance <span>⌄</span></div>
        <label>Detected sizes</label><div className="chips"><b>XL</b><b>2XL</b><b>3XL</b></div>
        <label>Orientation</label><div className="select">0° / 180° <span>⌄</span></div>
        <div className="run-line"><span>Optimizing placement</span><strong>87%</strong></div><div className="progress"><i/></div>
        <button>Run Nesting <ArrowRight size={14}/></button>
      </aside>
    </div>
  </div>
}

function FeatureRow({feature, reverse}){
  return <article className={`feature-row ${reverse?"reverse":""}`}>
    <div className="feature-copy">
      <div className="feature-number">{feature.n}</div>
      <div className="feature-icon">{feature.icon}</div>
      <h3>{feature.title}</h3>
      <p>{feature.text}</p>
      <a href="#workflow" className="text-link">See how it works <ArrowDownRight size={15}/></a>
    </div>
    <div className="feature-art">
      <div className="art-grid"/>
      <div className="art-ui">
        <span className="art-kicker">NEST-PRO AI</span>
        <strong>{feature.title}</strong>
        <small>Automated production step</small>
        <div className="art-lines"><i/><i/><i/><i/></div>
      </div>
    </div>
  </article>
}

function Pricing(){
  return <section id="pricing" className="pricing-band">
    <div className="shell price-head"><div><p className="eyebrow">PRICING</p><h2>Choose how you want to run Nest-Pro.</h2></div><p>Keep the same licensing direction from the existing Nest-Pro website, presented as a cleaner product offer.</p></div>
    <div className="shell price-grid">
      <div className="price-card"><span>INDIVIDUAL</span><strong>License</strong><small>For one designer</small><div className="price-divider"/><p>For independent designers and individual apparel workflows. Contact us for current license terms.</p><a href="mailto:support@nest-pro.com?subject=Nest-Pro%20Individual%20License">Ask about license <ArrowRight size={15}/></a></div>
      <div className="price-card featured"><div className="featured-tag">RECOMMENDED</div><span>PRODUCTION</span><strong>Nest-Pro</strong><small>For active production</small><div className="price-divider"/><p>For designers and production operators processing pattern files regularly.</p><a href="mailto:support@nest-pro.com?subject=Nest-Pro%20Production%20License">Ask about license <ArrowRight size={15}/></a></div>
      <div className="price-card"><span>TEAM</span><strong>Custom</strong><small>For studios & teams</small><div className="price-divider"/><p>For apparel suppliers and teams that need multi-user or multi-machine licensing.</p><a href="mailto:support@nest-pro.com?subject=Nest-Pro%20Team%20License">Contact sales <ArrowRight size={15}/></a></div>
    </div>
  </section>
}

export default function Home(){
  return <main id="top">
    <Nav/>
    <section className="hero shell">
      <div className="hero-left">
        <p className="eyebrow">AI-POWERED NESTING FOR ADOBE ILLUSTRATOR</p>
        <h1>Less manual work.<br/><em>More production.</em></h1>
        <p className="hero-text">Automate pattern scanning, size recognition, artwork placement and nesting in Adobe Illustrator—built around the real needs of apparel design and sublimation production.</p>
        <div className="hero-actions"><a className="button dark" href="#pricing">Get Nest-Pro <ArrowRight size={16}/></a><a className="button outline" href="#workflow"><Play size={14}/> Watch workflow</a></div>
        <div className="hero-meta"><span><Check size={14}/> AI-assisted workflow</span><span><Check size={14}/> 1–4 size detection</span><span><Check size={14}/> Illustrator compatible</span></div>
      </div>
      <div className="hero-note">01 / PRODUCT TOOL</div>
    </section>

    <section className="hero-visual shell"><ProductWindow/></section>

    <section id="features" className="intro-section shell">
      <div><p className="eyebrow">WHY NEST-PRO</p><h2>Built around the way apparel production actually works.</h2></div>
      <div className="intro-copy"><p>From pattern recognition to production-ready Illustrator documents, Nest-Pro brings repetitive preparation tasks into one focused workflow for apparel teams.</p><a href="#workflow" className="text-link">Explore the workflow <ArrowRight size={15}/></a></div>
    </section>

    <section className="feature-list shell">
      {features.map((f,i)=><FeatureRow key={f.n} feature={f} reverse={i%2===1}/>)}
    </section>

    <section id="workflow" className="workflow-band">
      <div className="shell">
        <div className="workflow-heading"><div><p className="eyebrow">WORKFLOW</p><h2>From pattern file to production layout.</h2></div><p>One continuous flow from scanning to optimized placement, without switching between multiple manual steps.</p></div>
        <div className="workflow-steps">
          {[["01","Import","Bring in AI or PDF pattern files."],["02","Scan","Read shapes, size information and working areas."],["03","Prepare","Create size layers and group production artwork."],["04","Nest","Optimize placement, orientation and space."],["05","Export","Finish with a clean Illustrator document."]].map(([n,t,d])=><div className="wf-step" key={n}><b>{n}</b><h3>{t}</h3><p>{d}</p></div>)}
        </div>
      </div>
    </section>

    <section id="performance" className="performance shell">
      <div className="perf-main"><p className="eyebrow">PERFORMANCE</p><h2>Designed for large files and repetitive production.</h2><p>Use the lighter Quick Scan when you need speed, or High Performance Scan when the file is large and the pattern structure is complex.</p><a href="#pricing" className="button dark">Run your workflow <ArrowRight size={16}/></a></div>
      <div className="perf-side"><div className="metric"><strong>1–4</strong><span>sizes per pattern</span></div><div className="metric"><strong>0° / 180°</strong><span>supported rotation</span></div><div className="metric"><strong>AI</strong><span>assisted recognition</span></div></div>
    </section>

    <Pricing/>

    <section id="faq" className="faq shell">
      <div className="faq-title"><p className="eyebrow">FAQ</p><h2>Questions before you run your first nest?</h2></div>
      <div className="faq-list">
        {["What Illustrator versions are supported?","Can Nest-Pro detect 1–4 sizes in the same pattern file?","Can it work with both AI and PDF files?","Does Nest-Pro support 0° and 180° orientation?","What is the difference between Quick Scan and High Performance Scan?","How does the license activation work?"].map((q)=><details key={q}><summary>{q}<span>+</span></summary><p>Nest-Pro is built for apparel pattern workflows inside Adobe Illustrator. Supported behavior can depend on the document structure and the version of Nest-Pro you are using. Please contact support to confirm compatibility and licensing details for your setup.</p></details>)}
      </div>
    </section>

    <section className="final-cta">
      <div className="shell"><p className="eyebrow">NEST-PRO AI</p><h2>Turn repetitive Illustrator work into a repeatable system.</h2><div><a className="button light" href="#pricing">Get Nest-Pro <ArrowRight size={16}/></a><a className="button text" href="#features">Explore features</a></div></div>
    </section>

    <footer className="footer shell"><BrandMark/><span>AI-assisted production automation for Adobe Illustrator.</span><span>© 2026 Nest-Pro</span></footer>
  </main>
}
