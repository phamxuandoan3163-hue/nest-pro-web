const ARTICLES = {
  "nest-pro": {
    "getting-started": ["Preparing a document for Nest-Pro V2.5", "Set the active artboard, pattern outlines, design position, matching tolerance and laser settings before running the Nesting + Laser workflow."],
    "scan-modes": ["How silhouette matching works", "Learn how geometry filters, normalized shape fingerprints, perimeter comparison and 0°/180° orientation determine a design-to-pattern match."],
    "nesting-workflow": ["The exact Nesting + Laser sequence", "Follow the Nest-Pro V2.5 steps from active-artboard scan through design alignment, dual laser strokes and manual saving."],
    "laser-stroke-output": ["Understanding the laser stroke output", "Learn how white and black laser paths are created from successfully placed closed design silhouettes and how to inspect the output."]
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
