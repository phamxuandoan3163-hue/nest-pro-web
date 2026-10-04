export const defaultContent = {
  site: {
    brand: 'NEST-PRO',
    brandTag: 'AI',
    pageTitle: 'Nest-Pro AI — Smart Nesting for Adobe Illustrator',
    navBuy: 'Get Nest-Pro',
    navLinks: ['Features','Workflow','Performance','Pricing','FAQ'],
    footerLeft: 'Nest-Pro V2.0',
    footerCenter: 'AI-assisted nesting for Adobe Illustrator',
    footerRight: '© 2026 Nest-Pro'
  },
  theme: {
    pageBg: '#0d0f10',
    surface: '#141719',
    surface2: '#181b1d',
    text: '#f2f2ef',
    muted: '#9a9f9f',
    line: '#2a2f31',
    accent: '#f2f0ea',
    accentText: '#111315',
    darkBand: '#090b0c',
    softBand: '#111415',
    radius: '22'
  },
  hero: {
    eyebrow: 'AI-POWERED NESTING FOR ADOBE ILLUSTRATOR',
    titleLine1: 'Less manual work.',
    titleLine2: 'More production.',
    text: 'Nest-Pro turns repetitive pattern preparation, size recognition, artwork placement and nesting into one streamlined workflow inside Adobe Illustrator.',
    primaryCta: 'Get Nest-Pro',
    secondaryCta: 'Watch workflow',
    note: '01 / PRODUCT TOOL',
    meta: ['AI-assisted workflow','1–4 size detection','Illustrator compatible']
  },
  intro: {
    eyebrow: 'WHY NEST-PRO',
    title: 'Built around the way apparel production actually works.',
    text: 'Nest-Pro brings the repetitive pattern preparation steps into one streamlined Illustrator workflow, with larger controls, clearer automation and production-ready output.',
    link: 'Explore the workflow'
  },
  features: [
    { n:'01', icon:'scan', title:'Pattern recognition', text:'Scan AI and PDF pattern files and detect the working shape automatically, without rebuilding the pattern by hand.' },
    { n:'02', icon:'layers', title:'1–4 size detection', text:'Recognize one to four sizes in a pattern set and turn each detected size into a clean, usable layer structure.' },
    { n:'03', icon:'rotate', title:'Smart orientation', text:'Detect the pattern direction and place artwork at the required 0° or 180° orientation.' },
    { n:'04', icon:'move', title:'Automatic placement', text:'Align design artwork to the matching pattern area and center it with production-ready positioning.' },
    { n:'05', icon:'sparkles', title:'Group + size workflow', text:'Combine design and size information into production groups while keeping the document structure clean.' },
    { n:'06', icon:'zap', title:'High performance scan', text:'Choose Quick Scan or High Performance Scan depending on file size and production workload.' }
  ],
  workflow: {
    eyebrow: 'WORKFLOW',
    title: 'From pattern file to production layout.',
    text: 'One continuous flow from scanning to optimized placement, without switching between multiple manual steps.',
    steps: [
      ['01','Import','Bring in AI or PDF pattern files.'],
      ['02','Scan','Read shapes, size information and working areas.'],
      ['03','Prepare','Create size layers and group production artwork.'],
      ['04','Nest','Optimize placement, orientation and space.'],
      ['05','Export','Finish with a clean Illustrator document.']
    ]
  },
  performance: {
    eyebrow:'PERFORMANCE',
    title:'Designed for large files and repetitive production.',
    text:'Use the lighter Quick Scan when you need speed, or High Performance Scan when the file is large and the pattern structure is complex.',
    cta:'Run your workflow',
    metrics:[['1–4','sizes per pattern'],['0° / 180°','supported rotation'],['AI','assisted recognition']]
  },
  pricing: {
    eyebrow:'PRICING',
    title:'Choose how you want to run Nest-Pro.',
    text:'Simple options for individual creators, active production users and commercial teams.',
    cards:[
      ['MONTHLY','$19','per month','For individual production workflows and flexible access.','Choose monthly'],
      ['YEARLY','$149','per year','For active users who rely on Nest-Pro throughout the year.','Choose yearly'],
      ['COMMERCIAL',"LET'S TALK",'team licensing','For studios, production teams and multi-machine workflows.','Contact sales']
    ]
  },
  faq: {
    eyebrow:'FAQ',
    title:'Questions before you run your first nest?',
    items:[
      ['What Illustrator versions are supported?','Nest-Pro is designed for modern Adobe Illustrator workflows. Keep the supported-version list editable here so you can update it without touching the code.'],
      ['Can Nest-Pro detect 1–4 sizes in the same pattern file?','Yes. The workflow is designed to recognize from one to four sizes and organize the detected information for placement.'],
      ['Can it work with both AI and PDF files?','Yes. The Nest-Pro workflow is designed around AI and PDF pattern inputs.'],
      ['Does Nest-Pro support 0° and 180° orientation?','Yes. Orientation logic can work with 0° and 180° placement depending on the pattern direction.'],
      ['What is the difference between Quick Scan and High Performance Scan?','Quick Scan prioritizes speed for lighter files. High Performance Scan is intended for larger or more complex documents.'],
      ['How does the license activation work?','Customers can purchase a license, activate it in the tool and manage the subscription or license from your website.']
    ]
  },
  finalCta: {
    eyebrow:'READY TO AUTOMATE?',
    title:'Stop repeating the same production steps.',
    primary:'Get Nest-Pro',
    secondary:'View pricing'
  }
};

export function cloneDefault(){
  return JSON.parse(JSON.stringify(defaultContent));
}
