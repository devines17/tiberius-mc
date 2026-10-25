import type { Metadata, Viewport } from "next";
import { Lilita_One, Montserrat } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/lib/site-config";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MotionRoot } from "@/components/motion/MotionRoot";
import { NavLoader } from "@/components/motion/NavLoader";
import { Suspense } from "react";

/* Lilita One: solo il marchio "TiberiusMC" nella barra in alto. */
const lilita = Lilita_One({ weight: "400", subsets: ["latin"], display: "swap", variable: "--font-lilita" });
/* Montserrat: testi 400, evidenze e interfaccia 700, titoli 800. */
const montserrat = Montserrat({ weight: ["400", "500", "700", "800"], subsets: ["latin"], display: "swap", variable: "--font-montserrat" });

const title = "TiberiusMC — Minecraft Towny a tema romano";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: title, template: "%s · TiberiusMC" },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  openGraph: {
    type: "website",
    locale: "it_IT",
    siteName: siteConfig.name,
    title,
    description: siteConfig.description,
    images: [{ url: "/images/tiberius-mc-logo.png", width: 1254, height: 1254, alt: "Logo ufficiale TiberiusMC" }],
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
const motionGate = `try{if(!matchMedia("(prefers-reduced-motion: reduce)").matches){var r=document.documentElement;r.classList.add("motion");var ext=true;try{ext=!document.referrer||new URL(document.referrer).origin!==location.origin}catch(e){}if(location.pathname==="/"&&ext)r.classList.add("intro");window.__motionTimer=setTimeout(function(){r.classList.remove("motion","intro")},4000)}}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="it" className={`${lilita.variable} ${montserrat.variable}`} suppressHydrationWarning>
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
        <Suspense fallback={null}>
          <NavLoader />
        </Suspense>
      </body>
    </html>
  );
}
