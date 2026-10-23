import Link from "next/link";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Building,
  Copyright,
  House,
  Info,
  LayoutDashboard,
  Mail,
  Map as MapIcon,
  MessagesSquare,
  Newspaper,
  ScrollText,
  Shield,
  Store,
  Vote,
} from "lucide-react";
import { TiberiusLogo } from "@/components/TiberiusLogo";
import { DiscordIcon } from "@/components/ui/DiscordIcon";
import { TelegramIcon } from "@/components/ui/TelegramIcon";
import { siteConfig } from "@/lib/site-config";

/* Le stesse voci della barra in alto, con le stesse icone, su una riga. */
const nav: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/", label: "home", icon: House },
  { href: "/news", label: "news", icon: Newspaper },
  { href: "/regole", label: "regole", icon: ScrollText },
  { href: "/mappa", label: "mappa", icon: MapIcon },
  { href: "/forum", label: "forum", icon: MessagesSquare },
  { href: "/store", label: "store", icon: Store },
  { href: "/staff", label: "staff", icon: Shield },
  { href: "/vota", label: "vota", icon: Vote },
  { href: "/wiki", label: "wiki", icon: BookOpen },
  { href: "/portale", label: "gestionale", icon: LayoutDashboard },
];

/** Riga informativa con piccola icona davanti. */
function Line({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <span className="mt-[0.2em] shrink-0 text-white/40" aria-hidden>
        {icon}
      </span>
      <span>{children}</span>
    </li>
  );
}

export function Footer() {
  const { contact, legal, links } = siteConfig;

  const legalLinks = [
    { href: "/regole", label: "regolamento", internal: true },
    ...(legal.privacy ? [{ href: legal.privacy, label: "privacy policy", internal: false }] : []),
    ...(legal.terms ? [{ href: legal.terms, label: "termini e condizioni", internal: false }] : []),
    ...(legal.cookies ? [{ href: legal.cookies, label: "cookie policy", internal: false }] : []),
  ];

  return (
    <footer className="on-field">
      <div className="wrap">
        {/* Riga superiore: logo · pagine · social */}
        <div
          className="grid items-center justify-items-center gap-8 pb-10 pt-14 md:pt-16 lg:grid-cols-[auto_1fr_auto] lg:justify-items-stretch lg:gap-12"
          data-stagger="0.1"
        >
          <Link href="/" aria-label="TiberiusMC, home" className="block w-fit transition-opacity hover:opacity-85 lg:justify-self-start">
            <TiberiusLogo variant="fluid" className="h-20 md:h-24" />
          </Link>

          <nav aria-label="Pagine del sito" className="w-full">
            <ul className="mx-auto flex flex-wrap justify-center gap-x-5 gap-y-2.5 text-sm font-semibold text-white/75 xl:flex-nowrap xl:gap-x-4 2xl:gap-x-5">
              {nav.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <Link href={href} className="group flex items-center gap-1.5 whitespace-nowrap">
                    <Icon className="size-4 shrink-0 transition-colors group-hover:text-accent" aria-hidden />
                    <span className="foot-link">{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center lg:justify-end">
            <ul className="flex items-center gap-2.5" aria-label="Social">
              <li>
                <a href={links.discord} target="_blank" rel="noopener noreferrer" aria-label="Discord di TiberiusMC" className="social">
                  <DiscordIcon className="size-5" />
                </a>
              </li>
              <li>
                <a href={links.telegram} target="_blank" rel="noopener noreferrer" aria-label={`Telegram ${links.telegramHandle}`} className="social">
                  <TelegramIcon className="size-5" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Separatore */}
        <div className="h-px bg-white/15" role="presentation" />

        {/* Riga inferiore: informazioni · link legali */}
        <div className="grid gap-6 py-8 text-sm text-white/60 md:grid-cols-[1fr_auto] md:items-start md:gap-10" data-reveal="fade">
          <ul className="grid gap-2 text-center md:text-left [&>li]:justify-center md:[&>li]:justify-start">
            <Line icon={<Copyright className="size-3.5" />}>TiberiusMC. Tutti i diritti riservati.</Line>
            {contact.company && <Line icon={<Building className="size-3.5" />}>{contact.company}</Line>}
            {contact.email && (
              <Line icon={<Mail className="size-3.5" />}>
                <a href={`mailto:${contact.email}`} className="foot-link">
                  {contact.email}
                </a>
              </Line>
            )}
            <Line icon={<Info className="size-3.5" />}>Progetto non affiliato a Mojang Studios o Microsoft.</Line>
          </ul>

          <nav aria-label="Note legali">
            <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 font-semibold text-white/75 md:justify-end">
              {legalLinks.map((l) => (
                <li key={l.href}>
                  {l.internal ? (
                    <Link href={l.href} className="foot-link">
                      {l.label}
                    </Link>
                  ) : (
                    <a href={l.href} className="foot-link" target="_blank" rel="noopener noreferrer">
                      {l.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
