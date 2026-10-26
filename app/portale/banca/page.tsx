import type { Metadata } from "next";
import { Suspense } from "react";
import { ForumLoading } from "@/components/forum/states";
import { portalGate } from "@/components/gestionale/gate";
import { ContoView } from "@/components/gestionale/views/Conto";

export const metadata: Metadata = { title: "Banca · Gestionale", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <>
      <Suspense fallback={<ForumLoading rows={2} />}>
        <Body />
      </Suspense>
    </>
  );
}

async function Body() {
  const gate = await portalGate("/portale/banca");
  if (!gate.ok) return gate.node;
  return <ContoView player={gate.player} />;
}
