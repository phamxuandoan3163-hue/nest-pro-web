const BASE = "https://www.ainovanesting.pro";

// Only public, indexable pages that answer HTTP 200 belong here: no redirects (such as /license),
// no "coming soon" pages (Sticker Layout, Production Tools are noindex until they launch), no ZIP files.
// lastModified is the day the page content last changed in a meaningful way (YYYY-MM-DD).
// Update it when you edit a page; do not use the build time, Google stops trusting it.
const PAGES = [
  ["/", "weekly", 1.0, "2026-11-28"],
  ["/tools/nest-pro", "weekly", 0.9, "2026-11-28"],
  ["/trame-preview", "weekly", 0.9, "2026-11-28"],
  ["/guides", "weekly", 0.8, "2026-11-28"],
  ["/tools/nest-pro/articles/getting-started", "monthly", 0.8, "2026-11-28"],
  ["/tools/nest-pro/articles/how-silhouette-matching-works", "monthly", 0.7, "2026-11-28"],
  ["/tools/nest-pro/articles/nesting-workflow", "monthly", 0.7, "2026-11-28"],
  ["/tools/nest-pro/articles/laser-stroke-output", "monthly", 0.7, "2026-11-28"],
  ["/trame-preview/install", "monthly", 0.8, "2026-11-28"],
  ["/trame-preview/guide", "monthly", 0.8, "2026-11-28"],
  ["/support", "yearly", 0.5, "2026-11-20"],
  ["/policies", "yearly", 0.3, "2026-11-20"]
];

export default function sitemap() {
  return PAGES.map(([route, changeFrequency, priority, date]) => ({
    url: route === "/" ? `${BASE}/` : `${BASE}${route}`,
    lastModified: new Date(date),
    changeFrequency,
    priority
  }));
}
