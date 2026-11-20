"use client";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BadgeCheck, BookOpen, Check, ClipboardCheck, FileText, Grid3x3, Layers3, Move, RotateCw, Ruler, ScanLine, Scissors, ShieldCheck, Shirt, Sparkles, Workflow, Zap } from "lucide-react";
import { defaultContent } from "./content";

const STORAGE="nestpro-cms-v1";
const TABS=["tools","features","workflow","resources"];
function renameBrand(value){if(typeof value==="string")return value.replace(/NEST-PRO/g,"NOVA NESTING").replace(/Nest-Pro/g,"Nova Nesting").replace(/Nest Pro/g,"Nova Nesting");if(Array.isArray(value))return value.map(renameBrand);if(value&&typeof value==="object")return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,renameBrand(item)]));return value;}
const SLUGS={"Nova Marker Making and Nesting":"nest-pro","Nova Nesting V2.5 + Laser Cut":"nest-pro","Nova Nesting V2.0":"nest-pro","Sticker Layout":"sticker-layout","Production Tools":"production-tools"};

/* ---------------------------------------------------------------------------
   Copy for the home page tabs. Every claim below comes from the product pages,
   the written guides, the license page or the policies: do not add numbers,
   testimonials or guarantees that those pages do not already state.
--------------------------------------------------------------------------- */

// Features tab: Nova Nesting (Adobe Illustrator).
const NESTING_FEATURES=[
  [ScanLine,"MATCH","Finds the right pattern for each design","Compares size, proportions, area and outline shape for every design against the pattern pieces on your artboard, so you don’t pair them by eye."],
  [Move,"ALIGN","Aligns your artwork in place","Moves the artwork you already have so its center sits on the pattern’s center. The design is moved, not copied."],
  [RotateCw,"ORIENT","Handles 0° and 180°","Keeps a design as it is, or turns it exactly 180° when its shape fits the pattern better that way."],
  [Layers3,"NO DOUBLES","Never uses a piece twice","Each pattern piece is marked as used during a run, so two designs can’t be matched to the same one."],
  [Scissors,"LASER CUT","Laser strokes when you need them","Optional. Turn on Laser Cut for inside and outside strokes with your own widths and colors, on a dedicated LASER CUT layer. It is off by default."],
  [ClipboardCheck,"SUMMARY","Tells you what to check","A summary reports placed designs, failures and stroke counts, so you know where to look before production."]
];
// Features tab: NOVA Trame (Adobe Photoshop).
const TRAME_FEATURES=[
  [Grid3x3,"STYLES","130 halftone styles","Dot, line, shape, pattern, grunge, vintage and color styles, each with its own icon and a short description."],
  [Ruler,"PRINT SIZE","Frequency set from your print size","The LPI is calculated from the document’s longest side, so the dots suit the size you print. You can still change it by hand."],
  [Shirt,"SHIRTS","Black and white shirts","A separate mode for each. On black shirts a white underbase is added, with an adjustable choke."]
];
// Features tab: what makes the tools safe to rely on.
const TRUST=[
  [ShieldCheck,"You stay in control","Nova Nesting never saves or exports on its own. Review the placement, then save the file yourself."],
  [BadgeCheck,"Try it on your own files","Both tools start with a 7-day free trial, so you can judge them on real patterns and artwork."],
  [BookOpen,"Written guides for every step","Setup, matching and laser output are explained step by step, with every default spelled out."],
  [FileText,"Prices and terms up front","License periods, computer limits and prices are on one page, with public terms and a refund policy."]
];
// Workflow tab.
const NESTING_STEPS=[
  ["01","Prepare the file","Put the pattern outlines inside the active artboard and the designs outside it. Set the matching tolerance (the default is 2 cm)."],
  ["02","Run Nova Nesting","Each design is matched to a pattern piece, kept at 0° or turned 180°, and aligned in place."],
  ["03","Add laser strokes (optional)","Turn on Laser Cut for inside and outside strokes on their own layer. It stays off unless you enable it."],
  ["04","Review and save","Check the summary of placed designs and any failures, inspect the artboard, then save the file yourself."]
];
const TRAME_STEPS=[
  ["01","Open the artwork","Set the real print size in the document and choose a black or white shirt."],
  ["02","Pick a style","Choose from 130 halftone styles. The frequency is set from your print size."],
  ["03","Check the preview","Adjust the settings and watch the live preview, in full view or at 100% close-up."],
  ["04","Apply and export","Apply the halftone, hide the preview layer and export a transparent PNG for your RIP."]
];
const SCREENSHOTS=[
  {src:"/nest-pro-workflow/step-01.webp",title:"Before",text:"Pattern outlines inside the artboard, designs outside it, and the Nova Nesting panel.",alt:"Pattern pieces and matching artwork in Illustrator with the Nova Nesting panel open."},
  {src:"/nest-pro-workflow/step-02.webp",title:"After",text:"Designs matched to their pattern pieces and aligned on the artboard.",alt:"Garment artwork matched to the pattern pieces and aligned on the artboard."},
  {src:"/nest-pro-workflow/step-03.webp",title:"Optional laser strokes",text:"Inside and outside stroke paths on the LASER CUT layer, with the stroke settings.",alt:"Laser Cut stroke paths around a design with the Laser Cut settings visible."}
];
// Resources tab.
const GUIDES=[
  {href:"/tools/nest-pro/articles/getting-started",tag:"START HERE",kind:"GUIDE",title:"Getting started with Nova Marker Making and Nesting",text:"Prepare an Illustrator file, set tolerance, decide whether to use Laser Cut, and review the output."},
  {href:"/tools/nest-pro/articles/scan-modes",tag:"MATCHING",kind:"GUIDE",title:"How silhouette matching works",text:"Understand the main matching concepts and what to check if a design is paired with the wrong pattern."},
  {href:"/tools/nest-pro/articles/nesting-workflow",tag:"WORKFLOW",kind:"GUIDE",title:"The exact Nesting + Laser Cut sequence",text:"Follow the practical order from preparing the source file through checking the result and saving."},
  {href:"/tools/nest-pro/articles/laser-stroke-output",tag:"LASER CUT",kind:"GUIDE",title:"Configuring Inside and Outside laser strokes",text:"Choose stroke widths and colors, manage the LASER CUT layer, and review the paths before cutting."},
  {href:"/trame-preview/install",tag:"INSTALLATION",kind:"GUIDE",title:"How to install NOVA Trame",text:"Install the plugin on Windows or macOS, without Creative Cloud."},
  {href:"/trame-preview/guide",tag:"USAGE",kind:"GUIDE",title:"How to use NOVA Trame",text:"From artwork to a RIP-ready file: shirt color, styles, preview and export."}
];

function Brand(){return <a href="/" className="brand brand-mark-link" aria-label="Nova Nesting home" title="Nova Nesting"><img src="https://drive.google.com/thumbnail?id=1Nz3XYxmcu7rB8w5hgPyfxT-4HJrIuY8h&sz=w1000" className="brand-mark-img" alt="NOVA NESTING AI logo" width={120} height={100}/></a>}
function Nav(){return <header className="nav-wrap"><nav className="nav shell"><Brand/><div className="nav-links"><a href="#tools">Tools</a><a href="#features">Features</a><a href="#workflow">Workflow</a><a href="#resources">Resources</a><a href="/guides">Guides</a></div></nav></header>}
function ProductCard({p,index}){const slug=SLUGS[p.name]||"production-tools";const hi=index===0||!!p.available;const card=<><div className="product-card-top"><div className="product-tag-stack" style={{display:"flex",flexDirection:"column",alignItems:"flex-start",gap:8}}><span className={hi?"product-status-active":""}>{p.tag}</span>{p.platform&&<small className="product-platform" style={{fontSize:13,fontWeight:600,color:"#4b5254"}}>{p.platform}</small>}</div><div className={"product-icon "+(hi?"product-icon-active":"")}>{hi?<Zap size={18}/>:<Sparkles size={18}/>}</div></div><h3>{p.name}</h3><p>{p.description}</p><ul>{p.features.slice(0,4).map(x=><li key={x}><Check size={13}/>{x}</li>)}</ul></>;if(p.href)return <a href={p.href} className={"product-card"+(hi?" product-primary":"")} aria-label={"Open "+p.name}>{card}<span className="card-action">{p.cta||"Explore"} <ArrowRight size={14}/></span></a>;return index===0?<a href={"/tools/"+slug} className="product-card product-primary" aria-label={"Open "+p.name}>{card}<span className="card-action">Explore features <ArrowRight size={14}/></span></a>:<article className="product-card">{card}</article>}
function JerseyCollectionVisual(){return <div className="directory-hero-visual"><img src="https://drive.google.com/thumbnail?id=1PmKmsYcN0-Dv-Ip3vvQtmRKcI-trkFyB&sz=w2000" alt="Photorealistic 3D jersey collection showing five coordinated colorways from the front and back" width={1600} height={800} fetchPriority="high" referrerPolicy="no-referrer"/></div>}

// Section heading used by the Features, Workflow and Resources tabs.
function Head({eyebrow,title,children}){return <div className="landing-section-heading"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div><div>{children}</div></div>}
function FeatureGrid({items}){return <div className="value-grid">{items.map(([Icon,label,title,text],i)=><article className="value-card" key={title}><span className="value-icon"><Icon size={18} strokeWidth={1.8}/></span><small>0{i+1} / {label}</small><h3>{title}</h3><p>{text}</p></article>)}</div>}
function StepGrid({steps}){return <div className="landing-step-grid">{steps.map(([n,title,text])=><article key={n}><b>{n}</b><h3>{title}</h3><p>{text}</p></article>)}</div>}

function ProductVideo(){return <section id="product-video" className="product-video-section"><div className="shell product-video-layout"><div className="product-video-copy"><h2>See the workflow.<br/><em>Not just the promise.</em></h2><p>Watch a Nova Nesting run from start to finish, then try the same steps on your own files with the 7-day free trial.</p></div><div className="product-video-player"><div className="product-video-player-bar"><img className="windows-app-logo" src="https://drive.google.com/thumbnail?id=1Nz3XYxmcu7rB8w5hgPyfxT-4HJrIuY8h&sz=w1000" alt="NOVA NESTING AI" width={132} height={36} fetchPriority="high"/><b>Product Demo</b><div className="windows-title-controls" aria-hidden="true"><i className="windows-minimize"/><i className="windows-maximize"/><i className="windows-close"/></div></div><div className="product-video-frame"><iframe src="https://drive.google.com/file/d/1x3427ba2Ncj-kMkoXmJGwXFJZX2cCKLc/preview" title="Nova Nesting product walkthrough video" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen loading="lazy" referrerPolicy="strict-origin-when-cross-origin"/></div></div></div></section>}

function ToolsTab({c}){return <section id="tools" className="products-section shell">
  <div className="section-heading">
    <div><p className="eyebrow">THE TOOLKIT</p><h2>Two tools.<br/><em>Ready to use today.</em></h2></div>
    <div><p>Each tool does one job and has its own page with a full feature list, written guides and license options. Both start with a 7-day free trial on your own files.</p><a className="feature-link" href="/license">See license options <ArrowRight size={15}/></a></div>
  </div>
  <div className="product-grid">{c.products.cards.map((p,i)=><ProductCard key={p.name} p={p} index={i}/>)}</div>
</section>}

function FeaturesTab(){return <>
  <section id="features" className="landing-features shell">
    <Head eyebrow="NOVA NESTING · IN ADOBE ILLUSTRATOR" title={<>The matching you do by eye,<br/><em>done in one run.</em></>}>
      <p>Nova Nesting reads the pattern outlines on your artboard, finds the design that belongs to each one and lines it up. You check the result and save.</p>
      <a className="feature-link" href="/tools/nest-pro">See every feature <ArrowRight size={15}/></a>
    </Head>
    <FeatureGrid items={NESTING_FEATURES}/>
  </section>
  <section className="landing-features shell">
    <Head eyebrow="NOVA TRAME · IN ADOBE PHOTOSHOP" title={<>Halftones for DTF,<br/><em>set up for your print size.</em></>}>
      <p>NOVA Trame builds DTF halftones from your artwork, with the dot frequency calculated from the document’s real print size.</p>
      <a className="feature-link" href="/trame-preview">Explore NOVA Trame <ArrowRight size={15}/></a>
    </Head>
    <FeatureGrid items={TRAME_FEATURES}/>
  </section>
  <section className="landing-standards shell">
    <div className="standards-heading"><p className="eyebrow">BUILT TO BE CHECKED</p><h2>Automation that<br/>shows its work.</h2></div>
    <div className="standards-list">{TRUST.map(([Icon,title,text])=><div key={title}><Icon/><span><b>{title}</b><small>{text}</small></span></div>)}</div>
  </section>
</>}

function WorkflowTab(){return <>
  <ProductVideo/>
  <section id="workflow" className="landing-workflow"><div className="shell">
    <Head eyebrow="NOVA NESTING · IN ADOBE ILLUSTRATOR" title={<>Four steps.<br/><em>You check the last one.</em></>}>
      <p>Nova Nesting runs inside Illustrator, on the file you already have open.</p>
      <a className="feature-link" href="/tools/nest-pro/articles/nesting-workflow">Read the full workflow <ArrowRight size={15}/></a>
    </Head>
    <StepGrid steps={NESTING_STEPS}/>
    <p className="eyebrow" style={{marginTop:48}}>WHAT IT LOOKS LIKE</p>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",gap:14}}>{SCREENSHOTS.map(s=><figure key={s.src} style={{margin:0,border:"1px solid #2a3031",background:"#15191a",borderRadius:18,overflow:"hidden"}}><img src={s.src} alt={s.alt} width={450} loading="lazy" style={{display:"block",width:"100%",height:"auto"}}/><figcaption style={{padding:"14px 18px 18px",fontSize:12,lineHeight:1.7,color:"#989f9f"}}><b style={{display:"block",color:"#f2f2ef",fontSize:13,marginBottom:2}}>{s.title}</b>{s.text}</figcaption></figure>)}</div>
  </div></section>
  <section className="landing-workflow"><div className="shell">
    <Head eyebrow="NOVA TRAME · IN ADOBE PHOTOSHOP" title={<>From artwork<br/><em>to a RIP-ready file.</em></>}>
      <p>NOVA Trame installs as a regular Photoshop panel, without Creative Cloud.</p>
      <a className="feature-link" href="/trame-preview/guide">Read the NOVA Trame guide <ArrowRight size={15}/></a>
    </Head>
    <StepGrid steps={TRAME_STEPS}/>
  </div></section>
</>}

function ResourcesTab(){return <>
  <section id="resources" className="landing-features shell">
    <Head eyebrow="GUIDES & SUPPORT" title={<>Read how it works<br/><em>before you commit.</em></>}>
      <p>Every step is written down, with the defaults spelled out. If something is still unclear, email us before you buy.</p>
      <a className="feature-link" href="/guides">Browse all guides <ArrowRight size={15}/></a>
    </Head>
    <div className="article-grid">{GUIDES.map(g=><a className="article-card" key={g.href} href={g.href}><div className="article-art" style={{height:84}}><span>{g.tag}</span></div><div className="article-meta"><span>{g.kind}</span></div><h3>{g.title}</h3><p>{g.text}</p><strong>Read guide <ArrowRight size={13}/></strong></a>)}</div>
  </section>
  <section className="resource-strip"><div className="shell resource-inner">
    <div><p className="eyebrow">BEFORE YOU BUY</p><h2>Know exactly what<br/>you’re getting.</h2><p>License periods, prices and the number of computers each plan covers are listed on one page. Terms, refund policy and privacy notice are public. Questions first? Email <a href="mailto:support@ainovanesting.pro" style={{textDecoration:"underline"}}>support@ainovanesting.pro</a>.</p></div>
    <div className="directory-actions"><a className="button outline" href="/license">Nova Nesting licenses <ArrowRight size={15}/></a><a className="button outline" href="/trame-preview#pricing">NOVA Trame pricing <ArrowRight size={15}/></a><a className="button outline" href="/policies#refunds">Refund policy <ArrowRight size={15}/></a></div>
  </div></section>
</>}

function Home(){
  const[c,setC]=useState(defaultContent);
  useEffect(()=>{try{const raw=localStorage.getItem(STORAGE);if(raw)setC(renameBrand(JSON.parse(raw)));}catch{}},[]);
  const theme=useMemo(()=>({'--page-bg':c.theme.pageBg,'--surface':c.theme.surface,'--surface2':c.theme.surface2,'--text':c.theme.text,'--muted':c.theme.muted,'--line':c.theme.line,'--accent':c.theme.accent,'--accent-text':c.theme.accentText,'--dark-band':c.theme.darkBand,'--soft-band':c.theme.softBand,'--radius':c.theme.radius+"px"}),[c.theme]);
  // Only the active tab is visible; the others stay in the HTML but hidden. The tab follows the URL hash.
  const[tab,setTab]=useState("tools");
  useEffect(()=>{const apply=()=>{const h=window.location.hash.replace("#","");if(TABS.includes(h)){setTab(h);requestAnimationFrame(()=>{const el=document.getElementById("panel");if(el)el.scrollIntoView({behavior:"smooth",block:"start"});});}};apply();window.addEventListener("hashchange",apply);return()=>window.removeEventListener("hashchange",apply);},[]);
  return <main id="top" style={theme}>
    <Nav/>
    <section className="directory-hero shell">
      <div className="directory-hero-copy">
        <p className="eyebrow">PRODUCTION SOFTWARE FOR ADOBE ILLUSTRATOR AND PHOTOSHOP</p>
        <h1>Less manual work.<br/><em>Full control.</em></h1>
        <p className="directory-lead">Nova Nesting matches artwork to apparel pattern pieces in Illustrator. NOVA Trame turns artwork into DTF-ready halftones in Photoshop. Try either one free for 7 days, on your own files.</p>
        <div className="directory-actions"><a className="button dark" href="#tools">Explore tools <ArrowRight size={16}/></a><a className="button outline" href="#workflow"><Workflow size={15}/> See the workflow</a></div>
        <ul style={{display:"flex",flexWrap:"wrap",gap:"8px 22px",listStyle:"none",padding:0,margin:"26px 0 0",fontSize:12,color:"#9a9f9f"}}>{["7-day free trial","Works on your own files","Email support"].map(t=><li key={t} style={{display:"flex",alignItems:"center",gap:7}}><Check size={14} color="#35d07f"/>{t}</li>)}</ul>
      </div>
      <JerseyCollectionVisual/>
    </section>
    <div id="panel" style={{scrollMarginTop:78}}>
      <div className="home-panel" hidden={tab!=="tools"}><ToolsTab c={c}/></div>
      <div className="home-panel" hidden={tab!=="features"}><FeaturesTab/></div>
      <div className="home-panel" hidden={tab!=="workflow"}><WorkflowTab/></div>
      <div className="home-panel" hidden={tab!=="resources"}><ResourcesTab/></div>
    </div>
    <footer className="footer shell"><span>{c.site.footerLeft}</span><nav className="footer-legal" aria-label="Legal and support"><a href="/policies#terms">Terms</a><a href="/policies#refunds">Refunds</a><a href="/policies#license">License</a><a href="/policies#privacy">Privacy</a><a href="/support">Support</a></nav><span>© 2026 Nova Nesting</span></footer>
  </main>;
}
export default Home;
