import type { Metadata, Viewport } from "next";
import { Lilita_One, Nunito } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/lib/site-config";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MotionRoot } from "@/components/motion/MotionRoot";

/* Lilita One: marchio e titoli principali (peso unico 400, già molto pesante). */
const lilita = Lilita_One({ weight: "400", subsets: ["latin"], display: "swap", variable: "--font-lilita" });
/* Nunito: testi lunghi 500–600, enfasi, pulsanti e navigazione 800–900. */
const nunito = Nunito({ weight: ["500", "600", "800", "900"], subsets: ["latin"], display: "swap", variable: "--font-nunito" });

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

/*
 * Mette .motion prima del primo disegno, solo se l'utente non ha chiesto meno movimento.
 * Rete di sicurezza: se il motore delle animazioni non parte entro 4 secondi
 * (JavaScript bloccato o in errore), .motion viene tolta e tutto il contenuto
 * appare. MotionRoot annulla il timer appena è pronto.
 */
const motionGate = `try{if(!matchMedia("(prefers-reduced-motion: reduce)").matches){var r=document.documentElement;r.classList.add("motion");window.__motionTimer=setTimeout(function(){r.classList.remove("motion")},4000)}}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="it" className={`${lilita.variable} ${nunito.variable}`} suppressHydrationWarning>
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
        <main id="contenuto" className="flex-1 pt-[var(--header-h)]">
          {children}
        </main>
        <Footer />
        <MotionRoot />
      </body>
    </html>
  );
}
