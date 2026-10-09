export const defaultContent = {
  site:{brand:"Nest-Pro",brandTag:"AI",pageTitle:"Nest-Pro — Production tools for Adobe Illustrator",navBuy:"Get Nest-Pro",navLinks:["Products","Features","Workflow","Pricing","FAQ"],footerLeft:"Nest-Pro",footerCenter:"Production automation for Adobe Illustrator",footerRight:"© 2026 Nest-Pro"},
  theme:{pageBg:"#0d0f10",surface:"#141719",surface2:"#181b1d",text:"#f2f2ef",muted:"#9a9f9f",line:"#2a2f31",accent:"#f2f0ea",accentText:"#111315",darkBand:"#090b0c",softBand:"#111415",radius:"22"},
  hero:{eyebrow:"PRODUCTION TOOLS FOR ADOBE ILLUSTRATOR",titleLine1:"Automate the work.",titleLine2:"Keep production moving.",text:"Nest-Pro turns repetitive apparel-production tasks into focused Illustrator tools — from pattern recognition and size preparation to nesting and layout automation.",primaryCta:"Explore Nest-Pro",secondaryCta:"See how it works",note:"01 / PRODUCT PLATFORM",meta:["Built for Illustrator","Apparel production workflows","More tools coming"]},
  intro:{eyebrow:"THE NEST-PRO PLATFORM",title:"One place for the production tools you actually need.",text:"Nest-Pro starts with automated nesting and pattern preparation. The platform is structured so new production tools can be added without changing the core experience.",link:"Explore products"},
  products:{eyebrow:"PRODUCTS",title:"Tools built for real production.",text:"Start with Nest-Pro V2.0 and add more focused tools as your workflow grows.",cards:[
    {tag:"AVAILABLE NOW",name:"Nest-Pro V2.0",description:"Automated pattern recognition, size detection, artwork placement and smart nesting inside Adobe Illustrator.",features:["1–4 size detection","AI / PDF workflow","0° / 180° rotation","Quick Scan + High Performance"],cta:"Explore Nest-Pro",href:"#features"},
    {tag:"COMING SOON",name:"Sticker Layout",description:"Automatic sticker imposition with page sizing, spacing, quantity optimization and decal-cut safety margins.",features:["Custom page size","Object dimensions","Auto layout","Cutting margin"],cta:"Coming soon",href:"#products"},
    {tag:"COMING SOON",name:"Production Tools",description:"More focused Illustrator utilities for apparel, print preparation and repetitive production work.",features:["Workflow automation","Batch operations","Production presets","Export tools"],cta:"Coming soon",href:"#products"}
  ]},
  features:[
    {n:"01",icon:"Scan",title:"Pattern recognition",text:"Scan AI and PDF pattern files and identify the working shapes without rebuilding the pattern manually."},
    {n:"02",icon:"Match",title:"Smart size detection",text:"Recognize one to four sizes in a pattern workflow and organize the detected information for the next production step."},
    {n:"03",icon:"Layers",title:"Automatic size layers",text:"Turn detected size information into clean Illustrator layers so multi-size production files stay organized."},
    {n:"04",icon:"Move",title:"Artwork placement",text:"Match artwork to the correct pattern size, position it consistently and prepare the design for production."},
    {n:"05",icon:"Rotate",title:"Controlled orientation",text:"Use 0° or 180° orientation logic when the pattern workflow requires directional placement."},
    {n:"06",icon:"Zap",title:"Smart nesting",text:"Optimize placement to reduce wasted space while keeping the workflow practical for apparel production."}
  ],
  workflow:{eyebrow:"WORKFLOW",title:"From pattern file to production layout.",text:"A clear five-step flow replaces repetitive manual operations and keeps the final Illustrator document organized.",steps:[["01","Import","Bring in AI or PDF pattern files."],["02","Scan","Read shapes, sizes and working areas."],["03","Prepare","Create size layers and organize artwork."],["04","Nest","Optimize placement, orientation and space."],["05","Export","Finish with a clean Illustrator document."]]},
  performance:{eyebrow:"PERFORMANCE",title:"Choose the scan mode for the job.",text:"Quick Scan prioritizes speed for lighter files. High Performance Scan is designed for larger or more complex pattern documents where deeper recognition is useful.",cta:"Explore Nest-Pro",metrics:[["1–4","sizes per pattern"],["0° / 180°","orientation"],["AI / PDF","input workflow"]]},
  pricing:{eyebrow:"PRICING",title:"Simple access. Clear licensing.",text:"Choose the access period that fits your production workflow. Pricing and license activation can evolve independently from the product pages.",cards:[["7 DAYS","Trial","One-time trial","Test the workflow before committing.","Start trial"],["30 DAYS","Monthly","Flexible access","For active individual production workflows.","Get monthly"],["1 YEAR","Yearly","Best for production","For studios and users running Nest-Pro throughout the year.","Get yearly"]]},
  faq:{eyebrow:"FAQ",title:"Questions before you automate?",items:[
    ["What is Nest-Pro?","Nest-Pro is a product platform for production-focused Adobe Illustrator tools, starting with automated nesting and pattern preparation."],
    ["What can Nest-Pro V2.0 automate?","It focuses on pattern recognition, size detection, size-layer preparation, artwork placement, controlled rotation and smart nesting."],
    ["Can it work with AI and PDF pattern files?","Yes. The Nest-Pro workflow is designed around AI and PDF pattern inputs."],
    ["How many sizes can it detect?","The current workflow is designed for one to four sizes in a pattern."],
    ["What is Quick Scan vs High Performance Scan?","Quick Scan prioritizes speed for lighter files. High Performance Scan is intended for larger or more complex documents."],
    ["Will more tools be added later?","Yes. Nest-Pro is being structured as a growing product platform, so additional Illustrator production tools can be added alongside Nest-Pro V2.0."]
  ]},
  finalCta:{eyebrow:"START WITH NEST-PRO V2.0",title:"Automate the repetitive parts of production.",primary:"Explore Nest-Pro",secondary:"View pricing"}
};
export function cloneDefault(){return JSON.parse(JSON.stringify(defaultContent));}
