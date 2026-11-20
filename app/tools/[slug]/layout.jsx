import { notFound } from "next/navigation";

const PRODUCTS = {
  "nest-pro": {
    title: "Nova Nesting and Laser Cut for Illustrator",
    description: "Match pattern outlines to design silhouettes, align artwork in Adobe Illustrator, and optionally create configurable Inside/Outside laser strokes with color pickers."
  },
  "sticker-layout": {
    title: "Sticker Layout — Product information",
    description: "Learn about the planned Sticker Layout workflow for sheet sizing, spacing, quantity planning and decal-cut margins."
  },
  "production-tools": {
    title: "Production Tools",
    description: "Explore focused tools planned for repetitive Illustrator production and print-preparation tasks."
  }
};

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = PRODUCTS[slug];
  if (!product) return { title: "Tool not found", robots: { index: false, follow: false } };
  return {
    title: product.title,
    description: product.description,
    alternates: { canonical: `/tools/${slug}` },
    openGraph: { title: product.title, description: product.description, type: "website", url: `/tools/${slug}` }
  };
}

export default async function ToolLayout({ children, params }) {
  const { slug } = await params;
  // Unknown product slugs return a real 404 instead of a 200 "not found" page.
  if (!PRODUCTS[slug]) notFound();
  return children;
}
