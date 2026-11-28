// Media and fonts are served from this site and change rarely, so browsers and the CDN may
// cache them for a year. When you replace one of these files, give the new file a new name
// (for example nova-nesting-demo-v2.mp4) so visitors do not keep the old copy.
const longCache = [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }];

module.exports = {
  // Permanent redirects keep old links and search results working after a URL is renamed.
  async redirects() {
    return [
      { source: "/tools/nest-pro/articles/scan-modes", destination: "/tools/nest-pro/articles/how-silhouette-matching-works", permanent: true },
      { source: "/license", destination: "/tools/nest-pro#licensing", permanent: true }
    ];
  },
  async headers() {
    return [
      { source: "/media/:path*", headers: longCache },
      { source: "/fonts/:path*", headers: longCache }
    ];
  }
};
