export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/order-confirmation"]
      }
    ],
    sitemap: "https://nest-pro-web.vercel.app/sitemap.xml"
  };
}
