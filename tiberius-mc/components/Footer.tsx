import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { navItems, siteConfig } from "@/lib/site-config";
import { TiberiusLogo } from "@/components/TiberiusLogo";
import { Dentil } from "@/components/ui";

export function Footer() {
  const community = [
    siteConfig.links.discord && { href: siteConfig.links.discord, label: "Discord" },
    siteConfig.links.store && { href: siteConfig.links.store, label: "Store Goldoni" },
  ].filter(Boolean) as { href: string; label: string }[];

  return (
    <footer className="mt-auto bg-basalt">
      <Dentil />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div>
          <TiberiusLogo variant="footer" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-stone">
            Server Minecraft Java a tema romano, basato su Survival Towny. Fonda una città, guida una nazione, scrivi
            la storia dell&apos;impero.
          </p>
        </div>

        <nav aria-label="Esplora il sito">
          <h2 className="font-display text-xs font-semibold uppercase tracking-[0.28em] text-gold">Esplora</h2>
          <ul className="mt-4 space-y-2.5">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link href={`/${item.href}`} className="text-sm text-stone transition-colors hover:text-gold-bright">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/#entra" className="text-sm text-stone transition-colors hover:text-gold-bright">
                Come entrare
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className="font-display text-xs font-semibold uppercase tracking-[0.28em] text-gold">Community</h2>
          {community.length > 0 ? (
            <ul className="mt-4 space-y-2.5">
              {community.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-stone transition-colors hover:text-gold-bright"
                  >
                    {item.label}
                    <ExternalLink className="size-3" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm leading-relaxed text-stone-dim">
              I collegamenti alla community (Discord e store) saranno pubblicati a breve.
            </p>
          )}
        </div>
      </div>

      <div className="border-t border-gold/10">
        <p className="mx-auto max-w-7xl px-4 py-5 text-xs leading-relaxed text-stone-dim sm:px-6 lg:px-8">
          © Tiberius MC. Minecraft è un marchio di Mojang Studios / Microsoft. Tiberius MC è un progetto della
          community e non è affiliato a Mojang o Microsoft.
        </p>
      </div>
    </footer>
  );
}
