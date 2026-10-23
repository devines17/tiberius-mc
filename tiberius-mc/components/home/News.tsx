import { Newspaper } from "lucide-react";
import { EmptyState, SectionHeading } from "@/components/ui";

export function News() {
  return (
    <section id="news" className="stone-section">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <SectionHeading
          eyebrow="News ed eventi"
          title="Dal Foro"
          description="Annunci ufficiali, eventi in programma e le ultime notizie dall'impero."
        />
        <div className="mx-auto mt-12 max-w-3xl">
          <EmptyState icon={Newspaper} title="Nessuna notizia pubblicata">
            Quando lo staff pubblicherà annunci ed eventi, li troverai qui. Nel frattempo, entra nel server e inizia a
            costruire la tua storia.
          </EmptyState>
        </div>
      </div>
    </section>
  );
}
