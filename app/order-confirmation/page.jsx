import Link from "next/link";

export const metadata = {
  title: "Order next steps",
  description: "What to expect after purchasing a Nest-Pro license.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/order-confirmation" }
};

export default function OrderConfirmationPage() {
  return <main className="utility-page confirmation-page">
    <header className="nav-wrap"><nav className="nav shell"><a href="/" className="brand"><span>Nest-Pro</span><sup>AI</sup></a><div className="nav-links"><a href="/#tools">Tools</a><a href="/tools/nest-pro#features">Features</a><a href="/tools/nest-pro#workflow">Workflow</a><a href="/tools/nest-pro#resources">Resources</a><a href="/guides">Guides</a></div><a href="/support" className="nav-buy">Get help <span aria-hidden="true">↗</span></a></nav></header>
    <div className="shell utility-shell confirmation-shell">
      <div className="confirmation-mark" aria-hidden="true">✓</div>
      <p className="eyebrow">AFTER CHECKOUT</p>
      <h1>Your next steps<br/><em>for Nest-Pro.</em></h1>
      <p className="confirmation-lead">If your payment provider has confirmed your purchase, use this guide to find your receipt and license activation instructions.</p>
      <div className="confirmation-notice"><strong>Important</strong><p>This page is an information page. Opening it does not verify a payment or activate a license. Your payment provider and the official license delivery system determine the transaction and activation status.</p></div>
      <div className="confirmation-steps">
        <article><b>01</b><div><h2>Check your receipt</h2><p>Keep the payment confirmation and order reference from the provider you used at checkout.</p></div></article>
        <article><b>02</b><div><h2>Find your license email</h2><p>Check the email address used at purchase, including spam, junk and promotions folders. Follow the activation instructions in the official delivery email.</p></div></article>
        <article><b>03</b><div><h2>Still missing your license?</h2><p>Confirm that the payment is completed, then use the support channel on your receipt. Include your order reference and product version, but never send a password or full payment-card details.</p></div></article>
      </div>
      <div className="support-actions"><Link className="button dark" href="/support">Purchase and activation help <span aria-hidden="true">→</span></Link><Link className="button outline" href="/tools/nest-pro">View Nest-Pro details</Link></div>
    </div>
    <footer className="footer shell"><a href="/">Nest-Pro</a><nav className="footer-legal" aria-label="Legal and support"><a href="/policies#terms">Terms</a><a href="/policies#refunds">Refunds</a><a href="/policies#license">License</a><a href="/policies#privacy">Privacy</a><a href="/support">Support</a></nav><span>© 2026 Nest-Pro</span></footer>
  </main>;
}
