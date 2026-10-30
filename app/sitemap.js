const BASE = "https://www.ainovanesting.pro";

export default function sitemap() {
  const now = new Date();
  const staticRoutes = [
    "",
    "/license",
    "/policies",
    "/support",
    "/guides",
    "/tools/nest-pro",
    "/tools/sticker-layout",
    "/tools/production-tools"
  ];
  const articles = [
    "/tools/nest-pro/articles/getting-started",
    "/tools/nest-pro/articles/scan-modes",
    "/tools/nest-pro/articles/nesting-workflow",
    "/tools/nest-pro/articles/laser-stroke-output",
    "/tools/sticker-layout/articles/sticker-layout-overview",
    "/tools/production-tools/articles/production-tools-roadmap"
  ];

  return [...staticRoutes, ...articles].map((route) => ({
    url: `${BASE}${route || "/"}`,
    lastModified: now,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route.startsWith("/tools/nest-pro") ? 0.8 : 0.6
  }));
}
