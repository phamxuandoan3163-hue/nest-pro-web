import { notFound } from "next/navigation";
import JsonLd from "../../json-ld";

const SITE = "https://www.ainovanesting.pro";

// `soon: true` pages are placeholders for tools that are not released yet. They stay reachable
// but are kept out of search (noindex) and out of the sitemap until the tool launches.
const PRODUCTS = {
  "nest-pro": {
    title: "Illustrator Marker Making & Nesting Tool",
    description: "Match apparel pattern pieces to your artwork, align designs in place at 0° or 180° and add optional laser cut strokes in Adobe Illustrator. 7-day free trial."
  },
  "sticker-layout": {
    soon: true,
    title: "Sticker Layout — Product information",
    description: "Learn about the planned Sticker Layout workflow for sheet sizing, spacing, quantity planning and decal-cut margins."
  },
  "production-tools": {
    soon: true,
    title: "Production Tools",
    description: "Explore focused tools planned for repetitive Illustrator production and print-preparation tasks."
  }
};

// Structured data for the Nova Nesting product page. Keep the offers in step with the plans on the page.
const NEST_SCHEMA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "Nova Marker Making and Nesting",
      applicationCategory: "DesignApplication",
      operatingSystem: "Windows, macOS",
      description: "Match apparel pattern pieces to artwork, align designs in place at 0° or 180° and add optional laser cut strokes in Adobe Illustrator.",
      url: SITE + "/tools/nest-pro",
      publisher: { "@id": SITE + "/#org" },
      offers: [
        { "@type": "Offer", name: "Free trial (7 days)", price: "0", priceCurrency: "USD" },
        { "@type": "Offer", name: "Monthly (30 days)", price: "9.90", priceCurrency: "USD" },
        { "@type": "Offer", name: "Annual (1 computer)", price: "63.90", priceCurrency: "USD" },
        { "@type": "Offer", name: "Annual Pro (up to 2 computers)", price: "95.90", priceCurrency: "USD" }
      ]
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE + "/" },
        { "@type": "ListItem", position: 2, name: "Nova Nesting" }
      ]
    }
  ]
};

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = PRODUCTS[slug];
  if (!product) return { title: "Tool not found", robots: { index: false, follow: false } };
  return {
    title: product.title,
    description: product.description,
    alternates: { canonical: `/tools/${slug}` },
    ...(product.soon ? { robots: { index: false, follow: true } } : {}),
    openGraph: { title: product.title, description: product.description, type: "website", url: `/tools/${slug}`, images: [{ url: "/media/og-home.png", width: 1200, height: 630, alt: "Nova Nesting: apparel nesting for Illustrator and DTF halftones for Photoshop" }] },
    twitter: { card: "summary_large_image", title: product.title, description: product.description, images: ["/media/og-home.png"] }
  };
}

export default async function ToolLayout({ children, params }) {
  const { slug } = await params;
  // Unknown product slugs return a real 404 instead of a 200 "not found" page.
  if (!PRODUCTS[slug]) notFound();
  return <>{slug === "nest-pro" && <JsonLd data={NEST_SCHEMA} />}{children}</>;
}
