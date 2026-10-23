import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "./globals.css";
import { siteConfig } from "@/lib/site-config";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MotionRoot } from "@/components/motion/MotionRoot";

const title = "Tiberius MC — Minecraft Towny a tema romano";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: title, template: "%s · Tiberius MC" },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  openGraph: {
    type: "website",
    locale: "it_IT",
    siteName: siteConfig.name,
    title,
    description: siteConfig.description,
    images: [{ url: "/images/tiberius-mc-logo.png", width: 1254, height: 1254, alt: "Logo ufficiale Tiberius MC" }],
  },
  twitter: { card: "summary", title, description: siteConfig.description, images: ["/images/tiberius-mc-logo.png"] },
};

export const viewport: Viewport = { themeColor: "#ffffff" };

/* Mette .motion prima del primo disegno, solo se l'utente non ha chiesto meno movimento. */
const motionGate = `try{if(!matchMedia("(prefers-reduced-motion: reduce)").matches){document.documentElement.classList.add("motion");setTimeout(function(){document.documentElement.classList.remove("motion")},6000)}}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="it" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionGate }} />
      </head>
      <body className="flex min-h-svh flex-col">
        <a
          href="#contenuto"
          className="sr-only z-[120] bg-accent px-4 py-2 font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Vai al contenuto
        </a>
        <Header />
        <main id="contenuto" className="flex-1">
          {children}
        </main>
        <Footer />
        <MotionRoot />
      </body>
    </html>
  );
}
