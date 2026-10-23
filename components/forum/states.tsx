import Link from "next/link";
import { DiscordIcon } from "@/components/ui/DiscordIcon";
import { Notice } from "./bits";

/** Scheletro mostrato mentre arrivano i dati dell'utente. */
export function ForumLoading({ rows = 3 }: { rows?: number }) {
  return (
    <div className="wrap grid gap-4" aria-busy="true" aria-live="polite">
      <span className="sr-only">Caricamento…</span>
      <div className="panel h-14 animate-pulse" />
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="panel h-20 animate-pulse" style={{ animationDelay: `${i * 120}ms` }} />
      ))}
    </div>
  );
}

export function NotConfigured() {
  return (
    <div className="wrap">
      <Notice tone="warn">Il forum è in fase di attivazione. Nel frattempo, per assistenza scrivici sul Discord.</Notice>
    </div>
  );
}

export function LoginRequired({ next, text = "Per aprire e seguire le tue pratiche accedi con il tuo account Discord." }: { next: string; text?: string }) {
  return (
    <div className="wrap">
      <div className="panel panel-discord grid gap-5 p-8 md:p-12">
        <h2 className="text-[length:var(--step-head)]">Accedi per continuare.</h2>
        <p className="max-w-xl text-white/80">{text}</p>
        <div>
          <a href={`/api/auth/discord/login?next=${encodeURIComponent(next)}`} className="btn btn-discord">
            <DiscordIcon className="size-5" /> Accedi con Discord
          </a>
        </div>
      </div>
    </div>
  );
}

export function NeedsMinecraft({ next }: { next: string }) {
  return (
    <div className="wrap">
      <div className="panel grid gap-4 p-8 md:p-12">
        <h2 className="text-[length:var(--step-head)]">Collega il tuo account Minecraft.</h2>
        <p className="max-w-xl text-muted">Questa sezione richiede un account Minecraft verificato, così lo staff sa con certezza chi sta scrivendo. Ci vuole un minuto.</p>
        <div>
          <Link href={`/forum/account?next=${encodeURIComponent(next)}`} className="btn btn-accent">
            collega l&apos;account
          </Link>
        </div>
      </div>
    </div>
  );
}
