-- =====================================================================
-- TiberiusMC · Gestionale delle città · Migrazione 006 · fase 1
--  * città registrate sul sito (approvate dallo staff), con scheda pubblica
--  * cittadini e ruoli (sindaco, assistente, cittadino)
--  * candidature per entrare in una città
--  * bacheca interna e cantieri con i materiali
-- I dati del server (banca, claim, tasse…) arriveranno dal plugin in una
-- fase successiva: qui non ce n'è nessuno, per non avere due versioni.
-- Da eseguire una volta nell'SQL Editor di Supabase, dopo la 005.
-- =====================================================================

insert into public.forum_permissions (key, label) values ('citta', 'Registrazioni città')
on conflict (key) do nothing;

create table if not exists public.towns (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 60),
  name           text not null check (char_length(btrim(name)) between 3 and 40),
  motto          text not null default '' check (char_length(motto) <= 120),
  description    text not null default '' check (char_length(description) <= 4000),
  nation         text not null default '' check (char_length(nation) <= 40),
  recruiting     boolean not null default true,
  emblem_path    text,
  photos         text[] not null default '{}' check (cardinality(photos) <= 6),
  status         text not null default 'in_attesa' check (status in ('in_attesa', 'attiva', 'respinta', 'chiusa')),
  review_note    text check (char_length(review_note) <= 1000),
  founder_id     uuid references public.profiles(id) on delete set null,
  reviewed_by    uuid references public.profiles(id) on delete set null,
  reviewed_at    timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create unique index if not exists towns_name_unique on public.towns (lower(btrim(name))) where status in ('in_attesa', 'attiva');
create index if not exists towns_status_idx on public.towns (status, name);

-- Un giocatore sta in una sola città (come in Towny)
create table if not exists public.town_members (
  profile_id  uuid primary key references public.profiles(id) on delete cascade,
  town_id     uuid not null references public.towns(id) on delete cascade,
  role        text not null check (role in ('sindaco', 'assistente', 'cittadino')),
  joined_at   timestamptz not null default now()
);
create index if not exists town_members_town_idx on public.town_members (town_id, role);
-- Un solo sindaco per città
create unique index if not exists town_members_one_mayor on public.town_members (town_id) where role = 'sindaco';

create table if not exists public.town_applications (
  id          uuid primary key default gen_random_uuid(),
  town_id     uuid not null references public.towns(id) on delete cascade,
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  message     text not null default '' check (char_length(message) <= 1000),
  status      text not null default 'in_attesa' check (status in ('in_attesa', 'accettata', 'rifiutata', 'ritirata')),
  decided_by  uuid references public.profiles(id) on delete set null,
  decided_at  timestamptz,
  created_at  timestamptz not null default now()
);
create unique index if not exists town_applications_pending on public.town_applications (town_id, profile_id) where status = 'in_attesa';
create index if not exists town_applications_town_idx on public.town_applications (town_id, status, created_at desc);

-- Bacheca interna: annunci e risposte (parent_id)
create table if not exists public.town_posts (
  id          uuid primary key default gen_random_uuid(),
  town_id     uuid not null references public.towns(id) on delete cascade,
  author_id   uuid references public.profiles(id) on delete set null,
  parent_id   uuid references public.town_posts(id) on delete cascade,
  body        text not null check (char_length(btrim(body)) between 1 and 4000),
  pinned      boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists town_posts_town_idx on public.town_posts (town_id, parent_id, created_at desc);

-- Cantieri con l'elenco dei materiali
create table if not exists public.town_projects (
  id            uuid primary key default gen_random_uuid(),
  town_id       uuid not null references public.towns(id) on delete cascade,
  title         text not null check (char_length(btrim(title)) between 3 and 80),
  description   text not null default '' check (char_length(description) <= 2000),
  location      text not null default '' check (char_length(location) <= 80),
  status        text not null default 'da_iniziare' check (status in ('da_iniziare', 'in_corso', 'fermo', 'completato')),
  lead_id       uuid references public.profiles(id) on delete set null,
  created_by    uuid references public.profiles(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  completed_at  timestamptz
);
create index if not exists town_projects_town_idx on public.town_projects (town_id, status, updated_at desc);

create table if not exists public.town_project_items (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.town_projects(id) on delete cascade,
  name        text not null check (char_length(btrim(name)) between 1 and 60),
  needed      int not null check (needed between 1 and 1000000),
  done        int not null default 0 check (done >= 0 and done <= 1000000),
  position    int not null default 0
);
create index if not exists town_project_items_idx on public.town_project_items (project_id, position);

-- Notifiche: ora possono riguardare anche una città
alter table public.notifications add column if not exists town_id uuid references public.towns(id) on delete cascade;
do $$
declare c text;
begin
  for c in select conname from pg_constraint
           where conrelid = 'public.notifications'::regclass and contype = 'c' and pg_get_constraintdef(oid) like '%kind%'
  loop
    execute format('alter table public.notifications drop constraint %I', c);
  end loop;
end $$;
alter table public.notifications add constraint notifications_kind_check check (kind in (
  'risposta_staff', 'info_richieste', 'cambio_stato', 'decisione', 'chiusura', 'nuova_pratica',
  'risposta_giocatore', 'assegnazione', 'riapertura_richiesta', 'risposta_discussione',
  'citta_registrazione', 'citta_esito', 'citta_candidatura', 'citta_candidatura_esito', 'citta_annuncio'));

-- Funzioni (una transazione ciascuna) ---------------------------------

-- Registrazione: la città nasce "in attesa" con il richiedente come sindaco;
-- lo staff con il permesso "citta" riceve la notifica.
create or replace function public.town_register(
  p_founder uuid, p_slug text, p_name text, p_motto text, p_description text, p_nation text
) returns public.towns language plpgsql as $$
declare v public.towns;
begin
  if exists (select 1 from public.town_members where profile_id = p_founder) then
    raise exception 'gia_in_una_citta';
  end if;
  insert into public.towns (slug, name, motto, description, nation, founder_id)
  values (p_slug, btrim(p_name), coalesce(p_motto, ''), coalesce(p_description, ''), coalesce(p_nation, ''), p_founder)
  returning * into v;
  insert into public.town_members (profile_id, town_id, role) values (p_founder, v.id, 'sindaco');
  insert into public.notifications (profile_id, town_id, kind, title)
  select distinct sp.profile_id, v.id, 'citta_registrazione', 'Nuova città da verificare: ' || v.name
  from public.staff_permissions sp where sp.permission in ('citta') and sp.profile_id <> p_founder;
  return v;
end $$;

-- Decisione dello staff sulla registrazione
create or replace function public.town_review(p_town uuid, p_actor uuid, p_approve boolean, p_note text)
returns public.towns language plpgsql as $$
declare v public.towns;
begin
  select * into v from public.towns where id = p_town for update;
  if v.id is null then raise exception 'citta_non_trovata'; end if;
  if v.status <> 'in_attesa' then raise exception 'gia_decisa'; end if;
  update public.towns set
    status = case when p_approve then 'attiva' else 'respinta' end,
    review_note = nullif(btrim(coalesce(p_note, '')), ''),
    reviewed_by = p_actor, reviewed_at = now(), updated_at = now()
  where id = p_town returning * into v;
  -- Respinta: chi era dentro torna libero
  if not p_approve then delete from public.town_members where town_id = p_town; end if;
  if v.founder_id is not null then
    insert into public.notifications (profile_id, town_id, kind, title)
    values (v.founder_id, v.id, 'citta_esito',
            case when p_approve then 'La tua città ' || v.name || ' è stata approvata'
                 else 'La registrazione di ' || v.name || ' non è stata approvata' end);
  end if;
  return v;
end $$;

-- Candidatura accettata o rifiutata da sindaco o assistente
create or replace function public.town_decide_application(p_app uuid, p_actor uuid, p_accept boolean)
returns public.town_applications language plpgsql as $$
declare a public.town_applications; t public.towns;
begin
  select * into a from public.town_applications where id = p_app for update;
  if a.id is null then raise exception 'candidatura_non_trovata'; end if;
  if a.status <> 'in_attesa' then raise exception 'gia_decisa'; end if;
  select * into t from public.towns where id = a.town_id;
  if t.status <> 'attiva' then raise exception 'citta_non_attiva'; end if;
  if p_accept then
    if exists (select 1 from public.town_members where profile_id = a.profile_id) then
      raise exception 'gia_in_una_citta';
    end if;
    insert into public.town_members (profile_id, town_id, role) values (a.profile_id, a.town_id, 'cittadino');
    -- Le altre candidature dello stesso giocatore non servono più
    update public.town_applications set status = 'ritirata', decided_at = now()
    where profile_id = a.profile_id and status = 'in_attesa' and id <> a.id;
  end if;
  update public.town_applications set status = case when p_accept then 'accettata' else 'rifiutata' end,
    decided_by = p_actor, decided_at = now()
  where id = p_app returning * into a;
  insert into public.notifications (profile_id, town_id, kind, title)
  values (a.profile_id, a.town_id, 'citta_candidatura_esito',
          case when p_accept then 'Sei entrato nella città ' || t.name else 'La tua candidatura per ' || t.name || ' non è stata accettata' end);
  return a;
end $$;

-- Sicurezza: come le altre tabelle, RLS attiva e senza policy -----------

do $$
declare r text;
begin
  foreach r in array array['towns','town_members','town_applications','town_posts','town_projects','town_project_items'] loop
    execute format('alter table public.%I enable row level security', r);
    execute format('alter table public.%I force row level security', r);
  end loop;
  revoke execute on all functions in schema public from public;
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke all on all tables in schema public from anon;
    revoke execute on all functions in schema public from anon;
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    revoke all on all tables in schema public from authenticated;
    revoke execute on all functions in schema public from authenticated;
  end if;
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    grant all on all tables in schema public to service_role;
    grant execute on all functions in schema public to service_role;
  end if;
end $$;

-- Immagini delle città (stemma e foto): bucket pubblico, solo immagini fino a 4 MB.
do $$
begin
  if exists (select 1 from pg_namespace where nspname = 'storage') then
    insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    values ('citta-immagini', 'citta-immagini', true, 4194304, array['image/png','image/jpeg','image/webp','image/gif'])
    on conflict (id) do update set public = true;
  end if;
end $$;
