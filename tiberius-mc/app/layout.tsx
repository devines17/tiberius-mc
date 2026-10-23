import type { Metadata, Viewport } from "next";
import "@fontsource-variable/cinzel";
import "@fontsource-variable/inter";
import "./globals.css";
import { siteConfig } from "@/lib/site-config";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "Tiberius MC — Server Minecraft Towny a tema romano",
    template: "%s · Tiberius MC",
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  openGraph: {
    type: "website",
    locale: "it_IT",
    siteName: siteConfig.name,
    title: "Tiberius MC — Server Minecraft Towny a tema romano",
    description: siteConfig.description,
    images: [
      {
        url: "/images/tiberius-mc-logo.png",
        width: 569,
        height: 569,
        alt: "Logo ufficiale Tiberius MC",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Tiberius MC",
    description: siteConfig.description,
    images: ["/images/tiberius-mc-logo.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0a090c",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="it" className="h-full">
      <body className="flex min-h-full flex-col">
        <a
          href="#contenuto"
          className="sr-only z-[60] rounded-md bg-gold px-4 py-2 font-semibold text-obsidian focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Vai al contenuto
        </a>
        <Navbar />
        <main id="contenuto" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
