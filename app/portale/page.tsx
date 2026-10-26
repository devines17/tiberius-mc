import type { Metadata } from "next";
import { Suspense } from "react";
import { ForumLoading } from "@/components/forum/states";
import { portalGate } from "@/components/gestionale/gate";
import { PanoramicaView } from "@/components/gestionale/views/Panoramica";

export const metadata: Metadata = { title: "Gestionale", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <Suspense fallback={<ForumLoading rows={3} />}>
      <Body />
    </Suspense>
  );
}

async function Body() {
  const gate = await portalGate("/portale");
  if (!gate.ok) return gate.node;
  return <PanoramicaView player={gate.player} />;
}
