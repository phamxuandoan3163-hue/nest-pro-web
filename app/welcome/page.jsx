import Link from "next/link";

export const metadata = {
  title: "Welcome",
  description: "Your Nova Nesting subscription is being confirmed.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/welcome" }
};

export default function WelcomePage() {
  return <main className="utility-page confirmation-page">
    <div className="shell utility-shell confirmation-shell">
      <div className="confirmation-mark" aria-hidden="true">✓</div>
      <p className="eyebrow">PADDLE CHECKOUT</p>
      <h1>Welcome to Nova Nesting.<br/><em>Your subscription is being confirmed.</em></h1>
      <p className="confirmation-lead">Paddle returned you here after checkout. We’ll email your license once the completed transaction is verified.</p>
      <div className="confirmation-notice"><strong>Next step</strong><p>Check your inbox for the Nova Nesting license email. The license remains active while the subscription is in good standing and renews on the billing schedule shown at checkout.</p></div>
      <div className="support-actions">
        <Link className="button dark" href="/tools/nest-pro">Explore Nova Nesting <span aria-hidden="true">→</span></Link>
        <Link className="button outline" href="/support">Contact support <span aria-hidden="true">→</span></Link>
      </div>
    </div>
  </main>;
}
