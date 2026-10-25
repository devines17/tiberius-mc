/**
 * Intestazione delle pagine interne: solo titolo e una riga di spiegazione,
 * come nei forum dei server. (Le vecchie testate con il legionario sono nella
 * cronologia del progetto, se si vuole tornare indietro.)
 */
export function ForumHero({ title, lead }: { kicker?: string; title: string; lead: string; art?: string; full?: boolean }) {
  return (
    <section className="wrap pb-2 pt-10 md:pt-12">
      <h1 className="text-[clamp(1.9rem,3.6vw,2.7rem)] font-bold leading-tight">{title}</h1>
      <p className="mt-2 max-w-2xl text-white/60">{lead}</p>
    </section>
  );
}
