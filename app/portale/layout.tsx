import { Suspense } from "react";
import { Sidebar, SidebarSkeleton } from "@/components/gestionale/Sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[90rem] pb-16 pt-8 sm:px-[var(--gutter)] md:pt-12">
      <div className="overflow-hidden bg-[#17181a] sm:rounded-md">
        <header>
          <h1 className="bg-[#8f1d14] pb-3 pt-7 text-center text-3xl font-bold uppercase text-white md:text-4xl">Gestionale</h1>
          <div className="bg-[#d0362b] pt-2">
            <div aria-hidden className="onde translate-y-px" />
          </div>
        </header>
        <div className="mx-auto grid max-w-[75rem] gap-6 px-4 pb-10 pt-8 md:px-8 lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-start">
          <aside>
            <Suspense fallback={<SidebarSkeleton />}>
              <Sidebar />
            </Suspense>
          </aside>
          <div className="gest-box min-w-0 p-5 md:p-7">{children}</div>
        </div>
      </div>
    </div>
  );
}
