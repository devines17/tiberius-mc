import Link from "next/link";
import { TiberiusLogo } from "@/components/TiberiusLogo";
import { CopyIp } from "@/components/ui/CopyIp";
import { pages, siteConfig } from "@/lib/site-config";

export function Footer() {
  return (
    <footer className="on-field">
      <div className="wrap grid gap-14 py-20 md:grid-cols-[1.2fr_1fr_1fr]">
        <div className="grid content-start gap-6">
          <TiberiusLogo variant="footer" />
          <p className="max-w-sm text-white/70">Minecraft Java Survival Towny a tema romano. Fonda, governa, conquista.</p>
          <CopyIp ip={siteConfig.server.ip} tone="dark" />
        </div>
        <nav aria-label="Pagine" className="grid content-start gap-3">
          <h2 className="text-2xl">pagine</h2>
          {pages.map((p) => (
            <Link key={p.href} href={p.href} className="w-fit font-semibold text-white/80 hover:text-accent">
              {p.short}
            </Link>
          ))}
        </nav>
        <div className="grid content-start gap-3">
          <h2 className="text-2xl">community</h2>
          <a className="w-fit font-semibold text-white/80 hover:text-accent" href={siteConfig.links.discord} target="_blank" rel="noopener noreferrer">
            discord
          </a>
          <a className="w-fit font-semibold text-white/80 hover:text-accent" href={siteConfig.links.telegram} target="_blank" rel="noopener noreferrer">
            telegram {siteConfig.links.telegramHandle}
          </a>
          <Link className="w-fit font-semibold text-white/80 hover:text-accent" href="/portale">
            portale giocatore
          </Link>
        </div>
      </div>
      <div className="wrap border-t border-white/15 py-6 text-sm text-white/50">
        © Tiberius MC. Progetto non affiliato a Mojang Studios o Microsoft.
      </div>
    </footer>
  );
}
