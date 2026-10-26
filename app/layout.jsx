import "./globals.css";
import ActiveNavMarker from "./active-nav-marker";
import CookieConsent from "./cookie-consent";

export const metadata = {
  metadataBase: new URL("https://www.ainovanesting.pro"),
  applicationName: "Nest-Pro",
  title: {
    default: "Nest-Pro — Production tools for Adobe Illustrator",
    template: "%s | Nest-Pro"
  },
  description: "Production automation tools for Adobe Illustrator, including apparel pattern preparation, size detection, artwork placement and nesting workflows.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Nest-Pro",
    title: "Nest-Pro — Production tools for Adobe Illustrator",
    description: "Explore production automation tools for apparel, print preparation and repetitive Illustrator workflows.",
    url: "https://www.ainovanesting.pro/",
    locale: "en_US"
  },
  twitter: {
    card: "summary_large_image",
    title: "Nest-Pro — Production tools for Adobe Illustrator",
    description: "Production automation tools for Adobe Illustrator and apparel workflows."
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 }
  }
};

export default function RootLayout({ children }) {
  return <html lang="en"><body><a className="skip-link" href="#main-content">Skip to main content</a><div id="main-content">{children}</div><ActiveNavMarker /><CookieConsent /></body></html>;
}
