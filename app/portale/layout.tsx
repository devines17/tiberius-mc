import "@fontsource-variable/cinzel/index.css";
import { Suspense } from "react";
import { Hero, HeroFrame } from "@/components/gestionale/Hero";
import { Tabs } from "@/components/gestionale/Tabs";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[90rem] pb-16 pt-8 sm:px-[var(--gutter)] md:pt-12">
      <div className="overflow-hidden bg-[#17181a] sm:rounded-md">
        <Suspense fallback={<HeroFrame><div className="h-[7.5rem]" /></HeroFrame>}>
          <Hero />
        </Suspense>
        <div className="bg-[#d0362b]">
          <Tabs />
          <div aria-hidden className="onde translate-y-px" />
        </div>
        <div className="mx-auto max-w-[72rem] px-4 pb-10 pt-8 md:px-8">{children}</div>
      </div>
    </div>
  );
}
