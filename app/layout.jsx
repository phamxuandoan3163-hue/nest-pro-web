import "./globals.css";
import ActiveNavMarker from "./active-nav-marker";
import CookieConsent from "./cookie-consent";
import SiteTracker from "./site-tracker";
import JsonLd from "./json-ld";

const SITE = "https://www.ainovanesting.pro";
const SITE_SCHEMA = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", "@id": SITE + "/#org", name: "Nova Nesting", url: SITE + "/", logo: SITE + "/media/nova-nesting-logo.webp", email: "support@ainovanesting.pro" },
    { "@type": "WebSite", "@id": SITE + "/#site", name: "Nova Nesting", url: SITE + "/", publisher: { "@id": SITE + "/#org" } }
  ]
};

export const metadata = {
  metadataBase: new URL("https://www.ainovanesting.pro"),
  applicationName: "Nova Nesting",
  title: {
    default: "Nova Nesting | Illustrator Nesting & DTF Halftone Tools",
    template: "%s | Nova Nesting"
  },
  description: "Nova Nesting matches designs to apparel pattern pieces in Illustrator. NOVA Trame makes DTF halftones in Photoshop. Try either free for 7 days.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Nova Nesting",
    title: "Nova Nesting | Illustrator Nesting & DTF Halftone Tools",
    description: "Match designs to apparel pattern pieces in Illustrator and build DTF halftones in Photoshop. Try either tool free for 7 days.",
    url: "https://www.ainovanesting.pro/",
    locale: "en_US",
    images: [{ url: "/media/og-home.png", width: 1200, height: 630, alt: "Nova Nesting: apparel nesting for Illustrator and DTF halftones for Photoshop" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Nova Nesting | Illustrator Nesting & DTF Halftone Tools",
    description: "Apparel nesting for Illustrator and DTF halftones for Photoshop. Try either free for 7 days.",
    images: ["/media/og-home.png"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 }
  }
};

export default function RootLayout({ children }) {
  return <html lang="en"><body><JsonLd data={SITE_SCHEMA} /><a className="skip-link" href="#main-content">Skip to main content</a><div id="main-content">{children}</div><ActiveNavMarker /><CookieConsent /><SiteTracker /></body></html>;
}
