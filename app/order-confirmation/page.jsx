import Link from "next/link";

export const metadata = {
  title: "Nova Nesting order next steps",
  description: "What happens after a Nova Nesting Paddle checkout.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/order-confirmation" }
};

export default function OrderConfirmationPage() {
  return <main className="utility-page confirmation-page">
    <header className="nav-wrap"><nav className="nav shell"><a href="/" className="brand brand-mark-link" aria-label="Nova Nesting home" title="Nova Nesting"><img src="https://drive.google.com/thumbnail?id=1Nz3XYxmcu7rB8w5hgPyfxT-4HJrIuY8h&sz=w1000" className="brand-mark-img" alt="NOVA NESTING AI logo" width={120} height={100}/></a><div className="nav-links"><a href="/#tools">Tools</a><a href="/tools/nest-pro#features">Features</a><a href="/tools/nest-pro#workflow">Workflow</a><a href="/guides">Guides</a></div><a href="/support" className="nav-buy">Get help <span aria-hidden="true">↗</span></a></nav></header>
    <div className="shell utility-shell confirmation-shell">
      <div className="confirmation-mark" aria-hidden="true">✓</div>
      <p className="eyebrow">PADDLE CHECKOUT</p>
      <h1>Thanks for your order.<br/><em>Check your email.</em></h1>
      <p className="confirmation-lead">Paddle checkout has returned you to Nova Nesting. The license is issued only after our server verifies Paddle's completed-payment notification.</p>
      <div className="confirmation-notice"><strong>Sandbox test</strong><p>This integration branch uses Paddle Sandbox. Test checkouts do not charge real money. A successful Sandbox purchase should send its license key to the email address entered at checkout.</p></div>
      <div className="confirmation-steps">
        <article><b>01</b><div><h2>Wait for the license email</h2><p>Check the inbox and spam folder for “Your Nova Nesting license.” The key is created after the verified payment event reaches the license service.</p></div></article>
        <article><b>02</b><div><h2>Activate in Illustrator</h2><p>Open Nova Nesting, enter the emailed key, and activate this device. Monthly and Annual allow one device; Annual Pro allows two.</p></div></article>
        <article><b>03</b><div><h2>Need help?</h2><p>If the payment completed but no email arrives after a few minutes, contact support with the Paddle order reference. Never send a password or full payment-card details.</p></div></article>
      </div>
      <div className="support-actions"><Link className="button dark" href="/support">Purchase and activation help <span aria-hidden="true">→</span></Link><Link className="button outline" href="/tools/nest-pro">View Nova Nesting details</Link></div>
    </div>
    <footer className="footer shell"><a href="/">Nova Nesting</a><nav className="footer-legal" aria-label="Legal and support"><a href="/policies#terms">Terms</a><a href="/policies#refunds">Refunds</a><a href="/policies#license">License</a><a href="/policies#privacy">Privacy</a><a href="/support">Support</a></nav><span>© 2026 Nova Nesting</span></footer>
  </main>;
}
