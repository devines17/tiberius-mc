/** Intestazione semplice delle pagine interne: titolo e una riga di spiegazione. */
export function PageHead({ title, lead }: { kicker?: string; title: string; lead: string; art?: string; tone?: "paper" | "field" | "accent" }) {
  return (
    <section className="wrap pb-2 pt-10 md:pt-12">
      <h1 className="text-[clamp(1.9rem,3.6vw,2.7rem)] font-bold leading-tight">{title}</h1>
      <p className="mt-2 max-w-2xl text-white/60">{lead}</p>
    </section>
  );
}
