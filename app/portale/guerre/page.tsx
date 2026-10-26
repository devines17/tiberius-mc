import type { Metadata } from "next";
import { Suspense } from "react";
import { ForumLoading } from "@/components/forum/states";
import { portalGate } from "@/components/gestionale/gate";
import { GuerreView } from "@/components/gestionale/views/Guerre";

export const metadata: Metadata = { title: "Guerre · Gestionale", robots: { index: false, follow: false } };

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
  const gate = await portalGate("/portale/guerre");
  if (!gate.ok) return gate.node;
  return <GuerreView player={gate.player} />;
}
