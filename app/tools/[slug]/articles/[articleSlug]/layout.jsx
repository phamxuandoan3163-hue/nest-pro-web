const ARTICLES = {
  "nest-pro": {
    "getting-started": ["Getting started with Nest-Pro and Laser Cut", "Prepare the active artboard, match pattern silhouettes, and optionally configure Inside/Outside stroke widths and colors."],
    "scan-modes": ["How silhouette matching works", "Learn how geometry filters, normalized shape fingerprints, perimeter comparison and 0°/180° orientation determine a design-to-pattern match."],
    "nesting-workflow": ["The exact Nesting + Laser Cut sequence", "Follow the source-file workflow from active-artboard scan through 0°/180° alignment and optional color-configurable laser strokes."],
    "laser-stroke-output": ["Configuring Inside and Outside laser strokes", "Learn how to enable Laser Cut, adjust widths and colors, and manage the dedicated output layer."]
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
    openGraph: { title, description, type: "article", url: path }
  };
}

export default function ArticleLayout({ children }) {
  return children;
}
