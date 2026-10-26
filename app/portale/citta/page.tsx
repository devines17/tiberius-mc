import type { Metadata } from "next";
import { Suspense } from "react";
import { ForumLoading } from "@/components/forum/states";
import { portalGate } from "@/components/gestionale/gate";
import { CittaView } from "@/components/gestionale/views/Citta";

export const metadata: Metadata = { title: "Città · Gestionale", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <>
      <Suspense fallback={<ForumLoading rows={3} />}>
        <Body />
      </Suspense>
    </>
  );
}

async function Body() {
  const gate = await portalGate("/portale/citta");
  if (!gate.ok) return gate.node;
  return <CittaView player={gate.player} />;
}
