-- =====================================================================
-- TiberiusMC · News ed eventi
-- Migrazione 004 · da eseguire una volta nell'SQL Editor di Supabase.
--
-- Come il forum: la tabella è letta e scritta solo dal server del sito
-- (chiave service_role). RLS attiva e senza policy.
-- Le news le pubblica solo il Founder: il controllo è nel sito.
-- =====================================================================

create table if not exists public.news (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 90),
  title         text not null check (char_length(btrim(title)) between 3 and 120),
  category      text not null check (category in ('aggiornamento', 'evento', 'annuncio', 'manutenzione')),
  summary       text not null check (char_length(btrim(summary)) between 3 and 220),
  body          text not null default '' check (char_length(body) <= 20000),
  cover_path    text,
  event_at      timestamptz,
  author_id     uuid references public.profiles(id) on delete set null,
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  -- La data dell'evento ha senso solo per la categoria "evento"
  constraint news_evento_coerente check (event_at is null or category = 'evento')
);

create index if not exists news_published_idx on public.news (published_at desc) where published_at is not null;
create index if not exists news_event_idx on public.news (event_at) where event_at is not null and published_at is not null;

create or replace function public.news_touch() returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists news_touch on public.news;
create trigger news_touch before update on public.news for each row execute function public.news_touch();

alter table public.news enable row level security;
alter table public.news force row level security;

-- Copertine: bucket pubblico (le news sono pubbliche), solo immagini fino a 4 MB.
-- Si carica solo passando dal sito, che controlla chi sei.
do $$
begin
  if exists (select 1 from pg_namespace where nspname = 'storage') then
    insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    values ('news-copertine', 'news-copertine', true, 4194304,
            array['image/png','image/jpeg','image/webp','image/gif'])
    on conflict (id) do update set public = true;
  end if;
end $$;
