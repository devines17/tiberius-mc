/**
 * Accesso al database Supabase tramite la sua API REST (PostgREST),
 * con la chiave service_role. Solo codice server: questa chiave non deve
 * mai finire nel browser (non ha il prefisso NEXT_PUBLIC_, quindi Next non
 * la include nei bundle client).
 */

export class DbError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message);
  }
}

function env() {
  const url = process.env.SUPABASE_URL?.replace(/\/+$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? { url, key } : null;
}

export function dbConfigured(): boolean {
  return env() !== null;
}

function cfg() {
  const e = env();
  if (!e) throw new DbError("Database non configurato", 503, "not_configured");
  return e;
}

export function storageEndpoint(path: string): { url: string; headers: Record<string, string> } {
  const { url, key } = cfg();
  return { url: `${url}/storage/v1/${path}`, headers: { apikey: key, Authorization: `Bearer ${key}` } };
}

type Filters = Record<string, string | number | boolean | null | undefined>;

/** Costruisce la query PostgREST. I valori dei filtri vanno già nella forma "eq.x", "in.(a,b)"… */
function qs(select: string | undefined, filters: Filters = {}, extra: Record<string, string> = {}) {
  const p = new URLSearchParams();
  if (select) p.set("select", select);
  for (const [k, v] of Object.entries(filters)) if (v !== undefined && v !== null) p.append(k, String(v));
  for (const [k, v] of Object.entries(extra)) p.set(k, v);
  const s = p.toString();
  return s ? `?${s}` : "";
}

async function rest<T>(method: string, path: string, body?: unknown, prefer?: string): Promise<T> {
  const { url, key } = cfg();
  const res = await fetch(`${url}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(prefer ? { Prefer: prefer } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) {
    let detail: { message?: string; code?: string } = {};
    try {
      detail = await res.json();
    } catch {
      // risposta non JSON
    }
    // Il dettaglio resta nei log del server, mai nelle risposte al browser
    console.error("[db]", method, path.split("?")[0], res.status, detail.code, detail.message);
    throw new DbError(detail.message ?? `Errore database ${res.status}`, res.status, detail.code);
  }
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

/** Escape di un valore per i filtri PostgREST con virgole o parentesi (in.(…)). */
export function pgList(values: string[]): string {
  return `(${values.map((v) => `"${v.replace(/["\\]/g, "")}"`).join(",")})`;
}

export const db = {
  select<T>(table: string, select: string, filters?: Filters, extra?: Record<string, string>): Promise<T[]> {
    return rest<T[]>("GET", `${table}${qs(select, filters, extra)}`);
  },

  async one<T>(table: string, select: string, filters?: Filters): Promise<T | null> {
    const rows = await rest<T[]>("GET", `${table}${qs(select, filters, { limit: "1" })}`);
    return rows[0] ?? null;
  },

  async count(table: string, filters?: Filters): Promise<number> {
    const { url, key } = cfg();
    const res = await fetch(`${url}/rest/v1/${table}${qs("id", filters, { limit: "1" })}`, {
      method: "HEAD",
      headers: { apikey: key, Authorization: `Bearer ${key}`, Prefer: "count=exact" },
      cache: "no-store",
    });
    const range = res.headers.get("content-range");
    return range ? Number(range.split("/")[1]) || 0 : 0;
  },

  insert<T>(table: string, rows: unknown, opts: { upsert?: string; returning?: boolean } = {}): Promise<T[]> {
    const prefer = [opts.returning === false ? "return=minimal" : "return=representation"];
    let path = table;
    if (opts.upsert) {
      prefer.push("resolution=merge-duplicates");
      path += `?on_conflict=${encodeURIComponent(opts.upsert)}`;
    }
    return rest<T[]>("POST", path, rows, prefer.join(","));
  },

  update<T>(table: string, filters: Filters, patch: unknown): Promise<T[]> {
    return rest<T[]>("PATCH", `${table}${qs(undefined, filters)}`, patch, "return=representation");
  },

  remove(table: string, filters: Filters): Promise<void> {
    return rest<void>("DELETE", `${table}${qs(undefined, filters)}`, undefined, "return=minimal");
  },

  rpc<T>(fn: string, args: Record<string, unknown>): Promise<T> {
    return rest<T>("POST", `rpc/${fn}`, args);
  },
};
