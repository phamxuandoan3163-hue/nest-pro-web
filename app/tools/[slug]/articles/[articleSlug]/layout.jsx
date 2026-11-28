import { notFound } from "next/navigation";
import JsonLd from "../../../../json-ld";

const ARTICLES = {
  "nest-pro": {
    "getting-started": ["Getting Started with Nova Nesting in Illustrator","Prepare the artboard, set the 2 cm matching tolerance, choose whether to use Laser Cut and review the result before you save."],
    "how-silhouette-matching-works": ["How Silhouette Matching Works in Nova Nesting", "How Nova Nesting pairs designs with pattern pieces: geometry filters, shape fingerprints, perimeter comparison and 0°/180° orientation."],
    "nesting-workflow": ["Nesting + Laser Cut Workflow in Illustrator, Step by Step", "Follow the exact order: scan the active artboard, match, align at 0° or 180°, add optional laser strokes, then review and save."],
    "laser-stroke-output": ["Set Inside and Outside Laser Strokes in Illustrator", "Enable Laser Cut, set inside and outside stroke widths and colors, and manage the LASER CUT layer before you send the file to cut."]
  },
  "sticker-layout": {
    "sticker-layout-overview": ["Sticker Layout overview", "A first look at sheet setup, object sizing, spacing and cut-margin planning."]
  },
  "production-tools": {
    "production-tools-roadmap": ["Production Tools roadmap", "An overview of planned utilities for repetitive production tasks."]
  }
};

export async function generateMetadata({ params }) {
  const { slug, articleSlug } = await params;
  const item = ARTICLES[slug]?.[articleSlug];
  if (!item) return { title: "Article not found", robots: { index: false, follow: false } };
  const title = item[0];
  const description = item[1];
  const path = `/tools/${slug}/articles/${articleSlug}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    // Articles for tools that are not released yet stay out of search until launch.
    ...(slug !== "nest-pro" ? { robots: { index: false, follow: true } } : {}),
    openGraph: { title, description, type: "article", url: path, images: [{ url: "/media/og-home.png", width: 1200, height: 630, alt: "Nova Nesting: apparel nesting for Illustrator and DTF halftones for Photoshop" }] },
    twitter: { card: "summary_large_image", title, description, images: ["/media/og-home.png"] }
  };
}

export default async function ArticleLayout({ children, params }) {
  const { slug, articleSlug } = await params;
  // Unknown articles return a real 404 instead of a 200 "Article not found" page.
  if (!ARTICLES[slug]?.[articleSlug]) notFound();
  const crumbs = slug === "nest-pro"
    ? { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://www.ainovanesting.pro/" },
        { "@type": "ListItem", position: 2, name: "Guides", item: "https://www.ainovanesting.pro/guides" },
        { "@type": "ListItem", position: 3, name: ARTICLES[slug][articleSlug][0] }
      ] }
    : null;
  return <>{crumbs && <JsonLd data={crumbs} />}{children}</>;
}
