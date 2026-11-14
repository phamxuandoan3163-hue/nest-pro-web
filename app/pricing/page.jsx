import { headers } from "next/headers";
import PricingClient from "./PricingClient";

export const metadata = {
  title: "Pricing",
  description: "Compare Starter, Pro, and Advanced Nova Nesting subscriptions.",
  alternates: { canonical: "/pricing" }
};

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  const requestHeaders = await headers();
  const headerCountry = requestHeaders.get("x-vercel-ip-country");
  const normalizedCountry = headerCountry?.trim().toUpperCase();
  const countryCode =
    normalizedCountry && /^[A-Z]{2}$/.test(normalizedCountry) && normalizedCountry !== "XX"
      ? normalizedCountry
      : undefined;

  const props = countryCode ? { countryCode } : {};
  return <PricingClient {...props} />;
}
