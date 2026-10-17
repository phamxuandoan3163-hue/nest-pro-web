import Link from "next/link";

export const metadata = {
  title: "Policies",
  description: "Review Nest-Pro terms of use, license duration, renewal, cancellation, refund and privacy information.",
  alternates: { canonical: "/policies" }
};

const sections = [
  { id: "terms", eyebrow: "01 / TERMS", title: "Terms of use", paragraphs: [
    "By downloading, installing, purchasing or using a Nest-Pro product, you agree to follow the applicable product terms and the license scope shown during checkout or in your purchase confirmation.",
    "A license grants permission to use the specific product for the period and activation scope stated at purchase. Unless a product listing says otherwise, do not resell, publish, sublicense, share activation credentials or redistribute the software or its protected assets.",
    "You remain responsible for reviewing files produced by the software before sending them to print, cutting or manufacturing. Inspect geometry, scale, orientation, spacing, colors and output format. Automation can reduce repetitive work, but it does not replace production checks.",
    "Do not use the website or software to violate another person's rights, interfere with services, bypass license controls or gain unauthorized access. Nothing in these terms limits rights that cannot legally be waived under applicable law."
  ]},
  { id: "license", eyebrow: "02 / LICENSES", title: "License period, renewals and cancellation", paragraphs: [
    "The license period, included product, activation instructions and any usage limits are the ones stated on the official checkout screen and in the purchase confirmation. Keep your receipt and license email for reference.",
    "Unless checkout clearly identifies a recurring subscription and asks for your consent, a time-limited license expires at the end of the purchased period and does not automatically renew.",
    "If a recurring subscription is offered in the future, its price, billing interval and cancellation method must be shown before payment. Use the subscription or payment-provider controls identified in your receipt to stop the next renewal. Cancellation does not normally shorten a period already paid for unless applicable law or the purchase terms require otherwise.",
    "License transfers, device changes, resets and re-activation may depend on the product's published activation rules. Contact support before sharing credentials or attempting to transfer a license."
  ]},
  { id: "refunds", eyebrow: "03 / REFUNDS", title: "Refunds and payment issues", paragraphs: [
    "If you believe you were charged twice, did not receive the product after a confirmed payment, cannot activate a supported configuration after reasonable troubleshooting, or received something materially different from the product description, contact support using the reply address or support channel shown in your purchase confirmation.",
    "Include your order reference, product name, purchase date and a short description of the issue. Never send a password, full payment-card number or other payment authentication secrets. We may ask for non-sensitive diagnostic details to investigate activation or delivery problems.",
    "Refund requests are reviewed against the purchase details, delivery and activation status, the published checkout terms and applicable law. Where a refund is approved, the payment provider may need additional time to return funds to the original payment method.",
    "This policy does not remove any mandatory refund, withdrawal or consumer rights that apply to your purchase. If your local law provides stronger rights, those rights take precedence."
  ]},
  { id: "privacy", eyebrow: "04 / PRIVACY", title: "Privacy overview", paragraphs: [
    "Purchase and support workflows may require information such as your email address, order reference, product/license status and messages you send to support. This information should be used only for purposes such as delivering a purchase, managing a license, preventing fraud, maintaining the service and responding to support requests.",
    "Payments should be handled by the payment provider used at checkout. Do not send payment-card details, account passwords or license secrets through public channels.",
    "The actual payment, hosting, email, analytics and licensing providers used by the live service must be identified in the final published privacy notice. Retention periods, applicable data-controller details and contact information should also be completed for the business operating the service.",
    "For a privacy-related request, use the support channel shown in your order confirmation. Applicable privacy rights depend on the law that governs your purchase and location."
  ]}
];

export default function PoliciesPage() {
  return <main className="utility-page policy-page">
    <header className="nav-wrap"><nav className="nav shell"><a href="/" className="brand brand-mark-link" aria-label="Nest-Pro home" title="Nest-Pro"><img src="/nest-pro-horizontal-logo.webp" className="brand-mark-img" alt="Nest-Pro AI logo" width={120} height={100}/></a><div className="nav-links"><a href="/#tools">Tools</a><a href="/tools/nest-pro#features">Features</a><a href="/tools/nest-pro#workflow">Workflow</a><a href="/tools/nest-pro#resources">Resources</a><a href="/guides">Guides</a></div><a href="/support" className="nav-buy">Support <span aria-hidden="true">↗</span></a></nav></header>
    <div className="shell utility-shell">
      <div className="utility-breadcrumb"><Link href="/">Home</Link><span>/</span><span>Policies</span></div>
      <header className="utility-hero"><p className="eyebrow">POLICIES & CUSTOMER INFORMATION</p><h1>Clear terms.<br/><em>Fair expectations.</em></h1><p>Review the baseline policies for using Nest-Pro, managing a license and resolving a purchase issue.</p><p className="policy-updated">Last updated: October 15, 2026</p></header>
      <nav className="policy-jump" aria-label="Policy sections"><a href="#terms">Terms of use</a><a href="#license">License & renewal</a><a href="#refunds">Refunds</a><a href="#privacy">Privacy</a></nav>
      <div className="policy-content">
        {sections.map((section) => <section id={section.id} key={section.id} className="policy-section"><p className="eyebrow">{section.eyebrow}</p><h2>{section.title}</h2>{section.paragraphs.map((paragraph, i) => <p key={i}>{paragraph}</p>)}</section>)}
      </div>
      <aside className="policy-note"><strong>Need help with an order?</strong><p>Use the support instructions in your purchase confirmation and include the order reference. Do not post license keys or payment details publicly.</p><Link className="button dark" href="/support">Visit support <span aria-hidden="true">→</span></Link></aside>
    </div>
    <footer className="footer shell"><a href="/">Nest-Pro</a><nav className="footer-legal" aria-label="Legal and support"><a href="/policies#terms">Terms</a><a href="/policies#refunds">Refunds</a><a href="/policies#license">License</a><a href="/policies#privacy">Privacy</a><a href="/support">Support</a></nav><span>© 2026 Nest-Pro</span></footer>
  </main>;
}
