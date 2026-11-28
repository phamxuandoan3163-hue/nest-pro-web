export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // The installer ZIPs are downloads, not pages. Images, guides and media stay crawlable.
        disallow: ["/admin", "/order-confirmation", "/nest-pro/", "/trame/NOVA-NESTING-TRAME-SET_UP.zip"]
      }
    ],
    sitemap: "https://www.ainovanesting.pro/sitemap.xml"
  };
}
