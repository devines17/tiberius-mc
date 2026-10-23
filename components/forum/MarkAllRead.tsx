"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function MarkAllRead() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      className="btn"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await fetch("/api/forum/notifiche", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ tutte: true }) }).catch(() => {});
        setBusy(false);
        router.refresh();
      }}
    >
      {busy ? "un momento…" : "segna tutte come lette"}
    </button>
  );
}
