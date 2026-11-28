export const metadata = {
  title: "NOVA Trame: DTF Halftone Plugin for Photoshop",
  description: "130 halftone styles for DTF printing on black and white shirts. LPI set from your print size, live preview and white underbase. Free 7-day trial.",
  alternates: { canonical: "/trame-preview" },
  openGraph: {
    title: "NOVA Trame: DTF Halftone Plugin for Photoshop",
    description: "130 halftone styles for DTF printing on black and white shirts, with print-size LPI and a live preview.",
    type: "website",
    url: "/trame-preview",
    images: [{ url: "/media/og-home.png", width: 1200, height: 630, alt: "NOVA Trame DTF halftone plugin for Photoshop" }]
  },
  twitter: { card: "summary_large_image", title: "NOVA Trame: DTF Halftone Plugin for Photoshop", description: "130 halftone styles for DTF printing on black and white shirts, in Photoshop.", images: ["/media/og-home.png"] }
};

const SITE = "https://www.ainovanesting.pro";
// Keep the offers in step with the plans on the page.
const TRAME_SCHEMA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "NOVA Trame",
      applicationCategory: "DesignApplication",
      operatingSystem: "Windows, macOS",
      description: "Photoshop plugin with 130 halftone styles for DTF printing on black and white shirts.",
      url: SITE + "/trame-preview",
      publisher: { "@id": SITE + "/#org" },
      offers: [
        { "@type": "Offer", name: "Free trial (7 days)", price: "0", priceCurrency: "USD" },
        { "@type": "Offer", name: "Monthly", price: "5", priceCurrency: "USD" },
        { "@type": "Offer", name: "Yearly", price: "50", priceCurrency: "USD" },
        { "@type": "Offer", name: "Yearly Pro", price: "60", priceCurrency: "USD" }
      ]
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE + "/" },
        { "@type": "ListItem", position: 2, name: "NOVA Trame" }
      ]
    }
  ]
};

export default function TrameLayout({ children }) {
  // Paddle.js (checkout) is the only third-party script on these pages: open its connection early.
  return <>
    <link rel="preconnect" href="https://cdn.paddle.com" crossOrigin="anonymous"/>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(TRAME_SCHEMA).replace(/</g, "\\u003c") }} />
    {children}
  </>;
}
