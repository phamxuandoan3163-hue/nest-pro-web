const PRODUCTS = {
  "nest-pro": {
    title: "Nest-Pro V2.5 — Nesting and Laser Cut for Illustrator",
    description: "Follow the Nest-Pro V2.5 Illustrator workflow: scan rập outlines, match design silhouettes, orient at 0° or 180°, align designs and generate white/black laser strokes."
  },
  "sticker-layout": {
    title: "Sticker Layout — Product information",
    description: "Learn about the planned Sticker Layout workflow for sheet sizing, spacing, quantity planning and decal-cut margins."
  },
  "production-tools": {
    title: "Production Tools — Nest-Pro",
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

export default function ToolLayout({ children }) {
  return children;
}
