-- =====================================================================
-- TiberiusMC · Gestionale · Migrazione 006
-- Fotografia dei dati di gioco di ogni giocatore (soldi, Goldoni, città,
-- nazione, banca, PvP…), scritta dal plugin del server ogni pochi minuti
-- e letta dal sito per il gestionale personale. Il sito non la modifica:
-- finché il plugin non è collegato la tabella resta vuota.
-- Da eseguire una volta nell'SQL Editor di Supabase, dopo la 005.
-- =====================================================================

create table if not exists public.player_snapshots (
  mc_uuid     uuid primary key,
  mc_name     text not null,
  data        jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

alter table public.player_snapshots enable row level security;
alter table public.player_snapshots force row level security;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke all on public.player_snapshots from anon;
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    revoke all on public.player_snapshots from authenticated;
  end if;
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    grant all on public.player_snapshots to service_role;
  end if;
end $$;
