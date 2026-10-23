"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** Inserimento del codice ottenuto in gioco con /collega. */
export function LinkMinecraft({ next }: { next?: string }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [state, setState] = useState<{ kind: "idle" | "busy" | "error" | "ok"; msg?: string }>({ kind: "idle" });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState({ kind: "busy" });
    try {
      const res = await fetch("/api/mc/link", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return setState({ kind: "error", msg: data.error ?? "Collegamento non riuscito." });
      setState({ kind: "ok", msg: `Account ${data.mc_name} collegato.` });
      router.refresh();
      if (next) router.push(next);
    } catch {
      setState({ kind: "error", msg: "Connessione non riuscita. Riprova." });
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
      <label className="grid gap-2">
        <span className="text-sm font-semibold">Codice da /collega</span>
        <input
          className="field font-mono text-lg uppercase tracking-[0.3em]"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))}
          placeholder="ABC123"
          inputMode="text"
          autoComplete="one-time-code"
          aria-invalid={state.kind === "error"}
          required
        />
      </label>
      <button type="submit" className="btn btn-accent" disabled={code.length !== 6 || state.kind === "busy"}>
        {state.kind === "busy" ? "verifico…" : "collega"}
      </button>
      {state.msg && (
        <p role="status" className={`text-sm sm:col-span-2 ${state.kind === "error" ? "text-[#ffb4ad]" : "text-emerald-300"}`}>
          {state.msg}
        </p>
      )}
    </form>
  );
}
