/** Stendardo romano con l'iniziale della città: asta, drappo rosso con frange d'oro, che ondeggia. */
export function Vexillum({ name }: { name: string | null }) {
  const letter = (name ?? "?").trim().charAt(0).toUpperCase() || "?";
  return (
    <div className="gx-vex" aria-hidden>
      <span className="gx-vex-pole" />
      <span className="gx-vex-bar" />
      <span className="gx-vex-cloth">
        <span className="gx-vex-letter">{letter}</span>
      </span>
      <span className="gx-vex-eagle" />
    </div>
  );
}
