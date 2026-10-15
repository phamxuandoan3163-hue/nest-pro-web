import Link from "next/link";

export const metadata = {
  title: "Support",
  description: "Get help with Nest-Pro orders, license delivery, activation and product setup.",
  alternates: { canonical: "/support" }
};

const helpItems = [
  { n: "01", title: "License email has not arrived", text: "Check the email address used at checkout, including spam, junk and promotions folders. Confirm that your payment provider shows the transaction as completed before troubleshooting delivery." },
  { n: "02", title: "Activation does not work", text: "Keep the exact error message, Nest-Pro version, Adobe Illustrator version and Windows/macOS version ready. Do not post your full license key in a public forum." },
  { n: "03", title: "Payment failed or looks duplicated", text: "Check the payment provider's receipt or transaction status first. For a pending authorization, allow the provider to update its status before starting another purchase." }
];

export default function SupportPage() {
  return <main className="utility-page support-page">
    <header className="nav-wrap"><nav className="nav shell"><a href="/" className="brand"><span>Nest-Pro</span><sup>AI</sup></a><div className="nav-links"><a href="/#tools">Tools</a><a href="/tools/nest-pro#features">Features</a><a href="/tools/nest-pro#workflow">Workflow</a><a href="/tools/nest-pro#resources">Resources</a><a href="/guides">Guides</a></div><a href="/tools/nest-pro" className="nav-buy">Product details <span aria-hidden="true">↗</span></a></nav></header>
    <div className="shell utility-shell">
      <div className="utility-breadcrumb"><Link href="/">Home</Link><span>/</span><span>Support</span></div>
      <header className="utility-hero"><p className="eyebrow">NEST-PRO CUSTOMER HELP</p><h1>Let’s get your<br/><em>workflow moving.</em></h1><p>Use the steps below to resolve common purchase, delivery and activation issues.</p></header>
      <div className="support-grid">{helpItems.map(item => <article className="support-card" key={item.n}><span>{item.n}</span><h2>{item.title}</h2><p>{item.text}</p></article>)}</div>
      <section className="support-contact"><div><p className="eyebrow">WHEN YOU CONTACT SUPPORT</p><h2>Include the details that help us investigate.</h2></div><ul><li>Order reference and purchase date</li><li>Product and license period</li><li>Illustrator version and operating system</li><li>Exact error text and a screenshot, with sensitive details hidden</li></ul><p>For an existing purchase, reply to the order or license email so the request stays connected to your receipt. If no email arrived, use the support/contact channel provided by the payment provider or seller at purchase. This website page does not verify orders or issue replacement keys by itself.</p></section>
      <div className="support-actions"><Link className="button dark" href="/tools/nest-pro">Nest-Pro product guide <span aria-hidden="true">→</span></Link><Link className="button outline" href="/policies#refunds">Refund and payment policy</Link></div>
    </div>
    <footer className="footer shell"><a href="/">Nest-Pro</a><nav className="footer-legal" aria-label="Legal and support"><a href="/policies#terms">Terms</a><a href="/policies#refunds">Refunds</a><a href="/policies#license">License</a><a href="/policies#privacy">Privacy</a><a href="/support">Support</a></nav><span>© 2026 Nest-Pro</span></footer>
  </main>;
}
