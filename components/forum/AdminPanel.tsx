"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";

type Perm = { key: string; label: string };
type Cand = { aperte: boolean; ruoli: string[]; eta_minima: number | null; domande: string[] };
type StaffRow = { profile_id: string; permission: string; profiles: { discord_username: string; mc_name: string | null; discord_id: string } | null };
type LogRow = { id: number; actor_id: string | null; action: string; target_id: string | null; details: Record<string, unknown>; created_at: string };
type Person = { id: string; discord_username: string; mc_name: string | null };

async function call(body: Record<string, unknown>) {
  const res = await fetch("/api/forum/admin", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Operazione non riuscita.");
  return data;
}

function Box({ title, lead, children }: { title: string; lead?: string; children: ReactNode }) {
  return (
    <section className="panel grid content-start gap-4 p-6 md:p-8">
      <div className="grid gap-1">
        <h2 className="text-xl">{title}</h2>
        {lead && <p className="text-sm text-white/55">{lead}</p>}
      </div>
      {children}
    </section>
  );
}

function Msg({ m }: { m: { ok: boolean; text: string } | null }) {
  if (!m) return null;
  return (
    <p role="status" className={`text-sm ${m.ok ? "text-emerald-300" : "text-[#ffb4ad]"}`}>
      {m.text}
    </p>
  );
}

function useOp() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const run = async (body: Record<string, unknown>, ok: string | ((d: Record<string, unknown>) => string)) => {
    setBusy(true);
    setMsg(null);
    try {
      const d = await call(body);
      setMsg({ ok: true, text: typeof ok === "string" ? ok : ok(d) });
      return d;
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Errore." });
      return null;
    } finally {
      setBusy(false);
    }
  };
  return { busy, msg, run };
}

const fmt = (iso: string) => new Intl.DateTimeFormat("it-IT", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Rome" }).format(new Date(iso));

export function AdminPanel({ permissions, candidature, retention }: { permissions: Perm[]; candidature: Cand; retention: number | null }) {
  const [staff, setStaff] = useState<StaffRow[]>([]);
  const [log, setLog] = useState<{ rows: LogRow[]; people: Map<string, string> }>({ rows: [], people: new Map() });

  const refresh = useCallback(async () => {
    try {
      const [s, r] = await Promise.all([call({ azione: "staff_elenco" }), call({ azione: "registro" })]);
      setStaff(s.staff ?? []);
      setLog({ rows: r.registro ?? [], people: new Map((r.persone as Person[]).map((p) => [p.id, p.mc_name ?? p.discord_username])) });
    } catch {
      /* mostrato vuoto */
    }
  }, []);
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Permessi
  const perm = useOp();
  const [who, setWho] = useState("");
  const [permKey, setPermKey] = useState(permissions[0]?.key ?? "");

  // Candidature
  const cand = useOp();
  const [aperte, setAperte] = useState(candidature.aperte);
  const [ruoli, setRuoli] = useState(candidature.ruoli.join("\n"));
  const [eta, setEta] = useState(candidature.eta_minima?.toString() ?? "");
  const [domande, setDomande] = useState(candidature.domande.join("\n"));

  // Archivio
  const arch = useOp();
  const [days, setDays] = useState(retention?.toString() ?? "");

  // Minecraft
  const mc = useOp();
  const [mcWho, setMcWho] = useState("");
  const [mcNick, setMcNick] = useState("");

  const label = (k: string) => permissions.find((p) => p.key === k)?.label ?? k;
  const grouped = new Map<string, { name: string; discord: string; perms: string[] }>();
  for (const r of staff) {
    const g = grouped.get(r.profile_id) ?? { name: r.profiles?.mc_name ?? r.profiles?.discord_username ?? "?", discord: r.profiles?.discord_id ?? "", perms: [] };
    g.perms.push(r.permission);
    grouped.set(r.profile_id, g);
  }
  const lines = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Box title="Permessi dello staff" lead="Indica Discord ID, nickname Minecraft o nome Discord. La persona deve aver già fatto l'accesso al sito.">
        <form
          className="grid gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            const attivo = (e.nativeEvent as SubmitEvent).submitter?.getAttribute("value") === "1";
            perm.run({ azione: "permesso", chi: who, permesso: permKey, attivo }, attivo ? "Permesso concesso." : "Permesso revocato.").then((d) => d && refresh());
          }}
        >
          <input className="field" placeholder="chi" value={who} onChange={(e) => setWho(e.target.value)} aria-label="Persona" required />
          <select className="field" value={permKey} onChange={(e) => setPermKey(e.target.value)} aria-label="Permesso">
            {permissions.map((p) => (
              <option key={p.key} value={p.key}>
                {p.label}
              </option>
            ))}
          </select>
          <div className="flex flex-wrap gap-3">
            <button className="btn btn-accent" name="v" value="1" disabled={perm.busy}>
              concedi
            </button>
            <button className="btn" name="v" value="0" disabled={perm.busy}>
              revoca
            </button>
          </div>
          <Msg m={perm.msg} />
        </form>
        <ul className="grid gap-2 text-sm">
          {[...grouped.values()].map((g) => (
            <li key={g.discord} className="rounded-xl bg-white/5 px-4 py-3">
              <strong>{g.name}</strong> <span className="text-white/45">· {g.discord}</span>
              <span className="mt-1 block text-white/65">{g.perms.map(label).join(", ")}</span>
            </li>
          ))}
          {grouped.size === 0 && <li className="text-white/50">Nessun membro dello staff ancora.</li>}
        </ul>
      </Box>

      <Box title="Candidature staff" lead="Ruoli e domande del modulo. Le candidature non assegnano mai ruoli in automatico.">
        <form
          className="grid gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            cand.run({ azione: "impostazioni_candidature", aperte, ruoli: lines(ruoli), eta_minima: eta === "" ? null : Number(eta), domande: lines(domande) }, "Impostazioni salvate.");
          }}
        >
          <label className="flex items-center gap-3 text-sm font-semibold">
            <input type="checkbox" checked={aperte} onChange={(e) => setAperte(e.target.checked)} className="size-4" /> Candidature aperte
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Ruoli (uno per riga)
            <textarea className="field min-h-24" value={ruoli} onChange={(e) => setRuoli(e.target.value)} />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Età minima (vuoto = nessuna)
            <input className="field" type="number" min={0} max={99} value={eta} onChange={(e) => setEta(e.target.value)} />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Domande aggiuntive (una per riga)
            <textarea className="field min-h-24" value={domande} onChange={(e) => setDomande(e.target.value)} />
          </label>
          <div>
            <button className="btn btn-accent" disabled={cand.busy}>
              salva
            </button>
          </div>
          <Msg m={cand.msg} />
        </form>
      </Box>

      <Box title="Collegamento Minecraft manuale" lead="Da usare finché il plugin non è installato, o se un giocatore non riesce a usare /collega. Verifica prima l'identità (in gioco o su Discord).">
        <form
          className="grid gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            const unlink = (e.nativeEvent as SubmitEvent).submitter?.getAttribute("value") === "0";
            mc.run(unlink ? { azione: "scollega_mc", chi: mcWho } : { azione: "collega_mc", chi: mcWho, nickname: mcNick }, (d) => (unlink ? "Account scollegato." : `Collegato a ${String(d.mc_name)}.`)).then((d) => d && refresh());
          }}
        >
          <input className="field" placeholder="chi (Discord ID o nome Discord)" value={mcWho} onChange={(e) => setMcWho(e.target.value)} aria-label="Persona" required />
          <input className="field" placeholder="nickname Minecraft" value={mcNick} onChange={(e) => setMcNick(e.target.value)} aria-label="Nickname Minecraft" maxLength={16} spellCheck={false} autoComplete="off" />
          <div className="flex flex-wrap gap-3">
            <button className="btn btn-accent" name="v" value="1" disabled={mc.busy}>
              collega
            </button>
            <button className="btn" name="v" value="0" disabled={mc.busy}>
              scollega
            </button>
          </div>
          <Msg m={mc.msg} />
        </form>
      </Box>

      <Box title="Conservazione dell'archivio" lead="Quando applichi la regola, le pratiche chiuse da più giorni di così vengono eliminate insieme agli allegati. Lascia vuoto per tenere tutto.">
        <form
          className="grid gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            arch.run({ azione: "impostazioni_archivio", conservazione_giorni: days === "" ? null : Number(days) }, "Impostazione salvata.");
          }}
        >
          <label className="grid gap-2 text-sm font-semibold">
            Giorni (minimo 30)
            <input className="field" type="number" min={30} max={3650} value={days} onChange={(e) => setDays(e.target.value)} />
          </label>
          <div className="flex flex-wrap gap-3">
            <button className="btn btn-accent" disabled={arch.busy}>
              salva
            </button>
            <button
              type="button"
              className="btn"
              disabled={arch.busy || !retention}
              onClick={() => {
                if (window.confirm("Eliminare definitivamente le pratiche chiuse oltre il limite?")) arch.run({ azione: "applica_conservazione" }, (d) => `Eliminate ${String(d.eliminate)} pratiche.`);
              }}
            >
              applica ora
            </button>
          </div>
          <Msg m={arch.msg} />
        </form>
      </Box>

      <section className="panel grid gap-4 p-6 md:p-8 lg:col-span-2">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-xl">Registro attività</h2>
          <button type="button" className="btn" onClick={refresh}>
            aggiorna
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="text-white/50">
              <tr>
                <th className="py-2 pr-4 font-semibold">Quando</th>
                <th className="py-2 pr-4 font-semibold">Chi</th>
                <th className="py-2 pr-4 font-semibold">Azione</th>
                <th className="py-2 font-semibold">Dettagli</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {log.rows.map((r) => (
                <tr key={r.id}>
                  <td className="whitespace-nowrap py-2 pr-4 text-white/60">{fmt(r.created_at)}</td>
                  <td className="py-2 pr-4">{r.actor_id ? log.people.get(r.actor_id) ?? "?" : "sistema"}</td>
                  <td className="py-2 pr-4">
                    {r.action.replaceAll("_", " ")}
                    {r.target_id ? ` → ${log.people.get(r.target_id) ?? "?"}` : ""}
                  </td>
                  <td className="py-2 text-white/60">
                    {Object.entries(r.details ?? {})
                      .map(([k, v]) => `${k}: ${String(v)}`)
                      .join(" · ")}
                  </td>
                </tr>
              ))}
              {log.rows.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-4 text-white/50">
                    Nessuna attività registrata.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
