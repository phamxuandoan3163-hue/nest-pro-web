import "./globals.css";

export const metadata = {
  title: "Nest-Pro — Production tools for Adobe Illustrator",
  description: "Nest-Pro is a growing suite of production automation tools for Adobe Illustrator, starting with pattern recognition, size preparation and smart nesting."
};

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
