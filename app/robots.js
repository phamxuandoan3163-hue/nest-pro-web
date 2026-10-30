export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/order-confirmation"]
      }
    ],
    sitemap: "https://www.ainovanesting.pro/sitemap.xml"
  };
}
