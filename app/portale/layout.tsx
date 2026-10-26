import { Suspense } from "react";
import { Stage, StageSkeleton } from "@/components/gestionale/Stage";
import { Dock, Spotlight } from "@/components/gestionale/motion";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="gx pb-20">
      <Spotlight />
      <div className="mx-auto w-full max-w-[90rem] pt-4 sm:px-[var(--gutter)] md:pt-8">
        <Suspense fallback={<StageSkeleton />}>
          <Stage />
        </Suspense>
      </div>
      <Dock />
      <main className="mx-auto w-full max-w-[72rem] px-4 pt-8 md:px-8">{children}</main>
    </div>
  );
}
