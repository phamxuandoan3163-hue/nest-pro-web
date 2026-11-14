"use client";

import { ArrowRight, Check, ShieldCheck, Zap } from "lucide-react";

const highlights = [
  "Nesting and artwork matching",
  "Optional Laser Cut workflow",
  "Plans for one or two computer activations"
];

export default function LicenseContent() {
  return (
    <div id="licensing" className="license-page tool-license-content">
      <section className="license-hero shell">
        <p className="eyebrow">STARTER · PRO · ADVANCED</p>
        <h2>Choose the plan<br/><em>that fits your workflow.</em></h2>
        <p>
          Compare monthly and yearly Nova Nesting subscriptions. Paddle calculates the current
          price and applicable tax for your location before checkout.
        </p>
        <div className="license-highlights">
          <span><ShieldCheck/> Secure Paddle checkout</span>
          <span><Zap/> Nesting and artwork matching</span>
          <span><Check/> One or two computer activations</span>
        </div>
        <a href="/pricing" className="license-hero-cta">Compare subscription plans <ArrowRight size={15}/></a>
      </section>
      <section className="shell license-options">
        <div className="license-section-head">
          <div><p className="eyebrow">LIVE SANDBOX PRICING</p><h2>See your localized total.</h2></div>
          <p>Review Starter, Pro, and Advanced with monthly or yearly billing. Checkout opens as a one-page Paddle overlay.</p>
        </div>
        <div className="license-grid">
          {["Starter", "Pro", "Advanced"].map((name) => (
            <article key={name} className="license-card">
              <div className="license-card-top"><span>{name.toUpperCase()}</span></div>
              <h3>{name}</h3>
              <p>{name === "Starter" ? "Flexible access for shorter production runs." : name === "Pro" ? "Everyday nesting for one workstation." : "Advanced nesting for longer and more complex work."}</p>
              <div className="license-divider"/>
              <ul>{highlights.map((item) => <li key={item}><Check size={14}/>{item}</li>)}</ul>
              <a href="/pricing" className="button outline">See plan and price <ArrowRight size={15}/></a>
            </article>
          ))}
        </div>
        <p className="license-note">Subscription prices renew on the selected schedule. The price page displays totals returned by Paddle for your location.</p>
      </section>
    </div>
  );
}
