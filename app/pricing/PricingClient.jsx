"use client";

import { useEffect, useState } from "react";
import { initializePaddle } from "@paddle/paddle-js";
import { pricingTiers } from "./tiers";
import styles from "./pricing.module.css";

const paddleEnvironment = process.env.NEXT_PUBLIC_PADDLE_ENV;
const paddleToken = process.env.NEXT_PUBLIC_PADDLE_SANDBOX_CLIENT_TOKEN;

if (!paddleEnvironment) {
  throw new Error("NEXT_PUBLIC_PADDLE_ENV is required; refusing to guess the Paddle account.");
}
if (paddleEnvironment !== "sandbox") {
  throw new Error("This pricing preview is Sandbox-only. Set NEXT_PUBLIC_PADDLE_ENV=sandbox.");
}
if (!paddleToken) {
  throw new Error("NEXT_PUBLIC_PADDLE_SANDBOX_CLIENT_TOKEN is required for Paddle Sandbox.");
}
if (!paddleToken.startsWith("test_")) {
  throw new Error("Paddle Sandbox client tokens must start with test_.");
}

export default function PricingClient({ countryCode, signedInEmail }) {
  const [billing, setBilling] = useState("month");
  const [paddle, setPaddle] = useState(null);
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    initializePaddle({
      token: paddleToken,
      environment: paddleEnvironment
    }).then((instance) => {
      if (cancelled) return;
      if (!instance) {
        setError("Paddle Sandbox could not initialize. Refresh the page and try again.");
        setLoading(false);
        return;
      }
      setPaddle(instance);
    }).catch((cause) => {
      console.error("Paddle Sandbox initialization failed", cause);
      if (!cancelled) {
        setError("Paddle Sandbox could not initialize. Refresh the page and try again.");
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!paddle) return;
    let cancelled = false;
    setLoading(true);
    setError("");

    const params = {
      items: pricingTiers.flatMap((tier) =>
        [tier.priceId.month, tier.priceId.year].map((priceId) => ({ priceId, quantity: 1 }))
      )
    };
    if (countryCode) {
      params.address = { countryCode };
    }

    paddle.PricePreview(params).then((preview) => {
      const nextPrices = {};
      const lineItems = preview?.data?.details?.lineItems || [];
      for (const item of lineItems) {
        const id = item?.price?.id;
        const formattedTotal = item?.formattedTotals?.total;
        if (id && formattedTotal) nextPrices[id] = formattedTotal;
      }
      if (!cancelled) {
        setPrices(nextPrices);
        if (Object.keys(nextPrices).length !== pricingTiers.length * 2) {
          setError("Paddle returned an incomplete price preview. Please refresh before subscribing.");
        }
      }
    }).catch((cause) => {
      console.error("Paddle.PricePreview failed", cause);
      if (!cancelled) setError("We couldn't load localized prices. Please refresh and try again.");
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => { cancelled = true; };
  }, [countryCode, paddle]);

  function subscribe(tier) {
    const priceId = tier.priceId[billing];
    if (!paddle || !prices[priceId]) return;
    setError("");
    try {
      paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        ...(signedInEmail ? { customer: { email: signedInEmail } } : {}),
        settings: {
          displayMode: "overlay",
          variant: "one-page",
          successUrl: window.location.origin + "/welcome"
        }
      });
    } catch (cause) {
      console.error("Paddle.Checkout.open failed", cause);
      setError("Checkout couldn't open. Please try again.");
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a href="/" className={styles.brand}>NOVA <span>NESTING</span></a>
        <nav aria-label="Main navigation">
          <a href="/tools/nest-pro">Product</a>
          <a href="/pricing" aria-current="page">Pricing</a>
          <a href="/support">Support</a>
        </nav>
      </header>

      <section className={styles.hero}>
        <p className={styles.eyebrow}>NOVA NESTING · SIMPLE SUBSCRIPTIONS</p>
        <h1>Choose the right<br /><em>nesting workflow.</em></h1>
        <p className={styles.lead}>
          Pattern matching, artwork placement, and optional Laser Cut workflows for Adobe Illustrator.
          Choose a plan and billing term that fits your production.
        </p>

        <div className={styles.billing} role="group" aria-label="Billing frequency">
          <button type="button" aria-pressed={billing === "month"} onClick={() => setBilling("month")}>Monthly</button>
          <button type="button" aria-pressed={billing === "year"} onClick={() => setBilling("year")}>Yearly</button>
        </div>
      </section>

      <section className={styles.plans} aria-label="Subscription plans">
        {pricingTiers.map((tier) => {
          const priceId = tier.priceId[billing];
          const formattedTotal = prices[priceId];
          return (
            <article key={tier.id} className={tier.featured ? styles.featuredCard : styles.card}>
              <div className={styles.cardTop}>
                <p className={styles.tierLabel}>{tier.name}</p>
                {tier.featured && <span className={styles.recommended}>RECOMMENDED</span>}
              </div>
              <p className={styles.description}>{tier.description}</p>
              <div className={styles.price} aria-live="polite">
                <span>{loading ? "Loading…" : (formattedTotal || "—")}</span>
                <small>/{billing === "month" ? "month" : "year"}</small>
              </div>
              <p className={styles.renewal}>
                {billing === "month" ? "Billed monthly, renews monthly." : "Billed yearly, renews yearly."}
              </p>
              <ul className={styles.features}>
                {tier.features.map((feature) => <li key={feature}><span aria-hidden="true">✓</span>{feature}</li>)}
              </ul>
              <button
                className={styles.subscribe}
                type="button"
                onClick={() => subscribe(tier)}
                disabled={!paddle || loading || !formattedTotal || Boolean(error)}
              >
                Subscribe
                <span aria-hidden="true">↗</span>
              </button>
            </article>
          );
        })}
      </section>

      {error && <p className={styles.error} role="alert">{error}</p>}
      <p className={styles.note}>Taxes and currency are calculated by Paddle for your location. The checkout total will match the selected plan and billing term.</p>
      <footer className={styles.footer}>© 2026 Nova Nesting · <a href="/policies">Policies</a> · <a href="/support">Contact</a></footer>
    </main>
  );
}
