export const metadata = {
  title: "Nova Nesting and NOVA Trame Guides",
  description: "Step-by-step guides: prepare your Illustrator file, match designs to patterns, set laser cut strokes, and install and use NOVA Trame in Photoshop.",
  alternates: { canonical: "/guides" },
  openGraph: {
    title: "Nova Nesting and NOVA Trame Guides",
    description: "Step-by-step guides for Illustrator marker making and nesting, and for DTF halftones in Photoshop.",
    type: "website",
    url: "/guides",
    images: [{ url: "/media/og-home.png", width: 1200, height: 630, alt: "Nova Nesting guides" }]
  }
};

export default function GuidesLayout({ children }) {
  return children;
}
