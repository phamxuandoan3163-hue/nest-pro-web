import "./globals.css";

export const metadata = {
  title: "Nova AI Nesting — Smart Nesting for Apparel",
  description: "Nova AI Nesting — smart nesting and production automation for apparel, sublimation printing and Adobe Illustrator."
};

metadata.icons = { icon: "/nova-nesting-logo.svg", shortcut: "/nova-nesting-logo.svg" };

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
