const ARTICLES = {
  "nest-pro": {
    "getting-started": ["Getting started with Nest-Pro", "A practical overview of importing pattern files, preparing sizes and reviewing the final Illustrator document."],
    "scan-modes": ["Choosing Quick Scan or High Performance Scan", "Compare scan modes for lighter files and more complex pattern documents."],
    "nesting-workflow": ["A cleaner pattern-to-nesting workflow", "Prepare pattern geometry, review placement and check the final production document." ]
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
