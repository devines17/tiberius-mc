-- =====================================================================
-- TiberiusMC · Forum · Migrazione 005 · forum pubblico
--  * le sezioni possono essere pubbliche (leggibili da tutti) o private
--  * pubbliche: Assistenza generale, Diplomazia e la nuova categoria
--    Community (Salotto, Proposte e idee) dove tutti possono rispondere
--  * le pratiche GIÀ ESISTENTI restano private: sono state scritte
--    quando il forum era privato. Diventano pubbliche solo quelle nuove.
--  * ultimo accesso dei profili (utenti e staff online)
--  * funzioni per statistiche, elenchi e membri (solo dati pubblici)
-- Da eseguire una volta nell'SQL Editor di Supabase, dopo la 004.
-- =====================================================================

-- Sezioni pubbliche e risposte aperte a tutti -------------------------

alter table public.forum_subcategories
  add column if not exists visibility text not null default 'private' check (visibility in ('private', 'public')),
  add column if not exists open_replies boolean not null default false;

-- La visibilità si decide all'apertura e resta quella
alter table public.tickets add column if not exists is_public boolean not null default false;
create index if not exists tickets_public_idx on public.tickets (subcategory, updated_at desc) where is_public;

update public.forum_subcategories set visibility = 'public' where key in ('assistenza_generale', 'diplomazia');

-- Categoria Community --------------------------------------------------

insert into public.forum_permissions (key, label) values ('community', 'Moderazione community')
on conflict (key) do nothing;

insert into public.forum_categories (key, label, position) values ('community', 'Community', 3)
on conflict (key) do update set label = excluded.label, position = excluded.position;
update public.forum_categories set position = 4 where key = 'candidature';

insert into public.forum_subcategories (key, category, label, permission, position, sensitive, visibility, open_replies) values
  ('salotto',  'community', 'Salotto della community', 'community', 1, false, 'public', true),
  ('proposte', 'community', 'Proposte e idee',         'community', 2, false, 'public', true)
on conflict (key) do update set visibility = 'public', open_replies = true;

insert into public.forum_statuses (subcategory, key, label, is_final, position) values
  ('salotto',  'aperta',         'Aperta',          false, 1),
  ('salotto',  'chiusa',         'Chiusa',          true,  2),
  ('proposte', 'aperta',         'Aperta',          false, 1),
  ('proposte', 'in_valutazione', 'In valutazione',  false, 2),
  ('proposte', 'accolta',        'Accolta',         true,  3),
  ('proposte', 'respinta',       'Respinta',        true,  4),
  ('proposte', 'chiusa',         'Chiusa',          true,  5)
on conflict (subcategory, key) do nothing;

-- Notifica per chi riceve una risposta nella propria discussione ------

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
  'risposta_giocatore', 'assegnazione', 'riapertura_richiesta', 'risposta_discussione'));

-- Ultimo accesso -------------------------------------------------------

alter table public.profiles add column if not exists last_seen_at timestamptz;
create index if not exists profiles_last_seen_idx on public.profiles (last_seen_at desc) where last_seen_at is not null;

-- Nuova pratica: la visibilità viene dalla sezione; nelle sezioni a
-- risposte aperte nessuna notifica allo staff (sono discussioni libere)
create or replace function public.forum_create_ticket(
  p_author uuid, p_subcategory text, p_title text, p_fields jsonb, p_body text,
  p_status text, p_mc_uuid uuid, p_mc_name text, p_mc_verified boolean
) returns public.tickets language plpgsql as $$
declare
  v_ticket public.tickets;
  v_sub public.forum_subcategories;
begin
  select * into v_sub from public.forum_subcategories where key = p_subcategory;
  if v_sub.key is null then raise exception 'sottosezione_non_valida'; end if;

  insert into public.tickets (subcategory, title, author_id, author_mc_uuid, author_mc_name, author_mc_verified, status, fields, awaiting, is_public)
  values (p_subcategory, p_title, p_author, p_mc_uuid, p_mc_name, coalesce(p_mc_verified, false), p_status, coalesce(p_fields, '{}'::jsonb),
          case when p_status = 'bozza' or v_sub.open_replies then 'nessuno' else 'staff' end,
          v_sub.visibility = 'public')
  returning * into v_ticket;

  if p_body is not null and char_length(p_body) > 0 then
    insert into public.ticket_messages (ticket_id, author_id, is_staff, body) values (v_ticket.id, p_author, false, p_body);
  end if;

  insert into public.ticket_status_history (ticket_id, from_status, to_status, actor_id, actor_role, reason)
  values (v_ticket.id, null, p_status, p_author, 'giocatore', null);

  if p_status <> 'bozza' and not v_sub.open_replies then
    insert into public.notifications (profile_id, ticket_id, kind, title)
    select distinct sp.profile_id, v_ticket.id, 'nuova_pratica', 'Nuova pratica #' || v_ticket.number || ': ' || p_title
    from public.staff_permissions sp
    where sp.permission = v_sub.permission and sp.profile_id <> p_author;
  end if;

  return v_ticket;
end $$;

-- Messaggio: nelle sezioni a risposte aperte chi non è l'autore può
-- rispondere; l'autore riceve la notifica, lo staff no.
create or replace function public.forum_add_message(
  p_ticket uuid, p_author uuid, p_is_staff boolean, p_body text, p_new_status text
) returns public.ticket_messages language plpgsql as $$
declare
  v_t public.tickets;
  v_msg public.ticket_messages;
  v_sub public.forum_subcategories;
  v_is_author boolean;
begin
  select * into v_t from public.tickets where id = p_ticket for update;
  if v_t.id is null then raise exception 'pratica_non_trovata'; end if;
  select * into v_sub from public.forum_subcategories where key = v_t.subcategory;
  v_is_author := v_t.author_id = p_author;

  if not p_is_staff and not v_is_author and not v_sub.open_replies then
    raise exception 'risposta_non_consentita';
  end if;

  insert into public.ticket_messages (ticket_id, author_id, is_staff, body) values (p_ticket, p_author, p_is_staff, p_body)
  returning * into v_msg;

  if p_new_status is not null and p_new_status <> v_t.status then
    insert into public.ticket_status_history (ticket_id, from_status, to_status, actor_id, actor_role, reason)
    values (p_ticket, v_t.status, p_new_status, p_author, case when p_is_staff then 'staff' else 'giocatore' end,
            case when p_is_staff then null else 'Risposta del giocatore' end);
  end if;

  if v_sub.open_replies then
    -- Discussione libera: nessuna attesa, si aggiorna solo l'attività
    update public.tickets set
      status = coalesce(p_new_status, status),
      awaiting = 'nessuno',
      updated_at = now(),
      author_seen_at = case when v_is_author then now() else author_seen_at end
    where id = p_ticket;
    if not v_is_author then
      insert into public.notifications (profile_id, ticket_id, kind, title)
      values (v_t.author_id, p_ticket, 'risposta_discussione', 'Nuova risposta alla tua discussione: ' || v_t.title);
    end if;
    return v_msg;
  end if;

  update public.tickets set
    status     = coalesce(p_new_status, status),
    awaiting   = case when p_is_staff then (case when coalesce(p_new_status, status) = 'info_richieste' then 'giocatore' else 'nessuno' end) else 'staff' end,
    updated_at = now(),
    author_seen_at = case when p_is_staff then author_seen_at else now() end
  where id = p_ticket;

  if p_is_staff then
    insert into public.notifications (profile_id, ticket_id, kind, title)
    values (v_t.author_id, p_ticket,
            case when p_new_status = 'info_richieste' then 'info_richieste' else 'risposta_staff' end,
            case when p_new_status = 'info_richieste' then 'Lo staff chiede informazioni sulla pratica #' || v_t.number
                 else 'Nuova risposta dello staff alla pratica #' || v_t.number end);
  else
    insert into public.notifications (profile_id, ticket_id, kind, title)
    select distinct x.pid, p_ticket, 'risposta_giocatore', 'Il giocatore ha risposto alla pratica #' || v_t.number
    from (
      select v_t.assigned_to as pid where v_t.assigned_to is not null
      union
      select sp.profile_id from public.staff_permissions sp where sp.permission = v_sub.permission and v_t.assigned_to is null
    ) x where x.pid is not null and x.pid <> p_author;
  end if;

  return v_msg;
end $$;

-- Ricerca: anche le discussioni pubbliche (mai le bozze); chi cerca può
-- non avere un account (p_viewer null).
create or replace function public.forum_search(
  p_viewer uuid, p_staff_subs text[], p_q text, p_number bigint, p_subcategory text,
  p_status text, p_from date, p_to date, p_author text, p_closed boolean, p_limit int
) returns setof public.tickets language sql stable as $$
  select t.* from public.tickets t
  where (
      (p_viewer is not null and t.author_id = p_viewer)
      or (t.subcategory = any(coalesce(p_staff_subs, '{}')) and t.status <> 'bozza')
      or (t.is_public and t.status <> 'bozza')
    )
    and (p_number is null or t.number = p_number)
    and (p_subcategory is null or t.subcategory = p_subcategory)
    and (p_status is null or t.status = p_status)
    and (p_from is null or t.created_at >= p_from)
    and (p_to is null or t.created_at < p_to + 1)
    and (p_closed is null or (t.closed_at is not null) = p_closed)
    and (
      p_author is null
      or ((t.is_public or t.subcategory = any(coalesce(p_staff_subs, '{}')))
          and lower(coalesce(t.author_mc_name, '')) like '%' || lower(p_author) || '%')
    )
    and (
      p_q is null or p_q = ''
      or t.search_text like '%' || lower(p_q) || '%'
      or exists (select 1 from public.ticket_messages m where m.ticket_id = t.id and lower(m.body) like '%' || lower(p_q) || '%')
      or (t.subcategory = any(coalesce(p_staff_subs, '{}'))
          and exists (select 1 from public.ticket_internal_notes n where n.ticket_id = t.id and lower(n.body) like '%' || lower(p_q) || '%'))
    )
  order by t.updated_at desc
  limit least(coalesce(p_limit, 50), 200);
$$;

-- Dati pubblici per le pagine del forum --------------------------------
-- Contano SOLO le discussioni pubbliche: le sezioni private non
-- compaiono mai in conteggi o elenchi.

create or replace function public.forum_display_name(p public.profiles) returns text
language sql immutable as $$ select coalesce(p.mc_name, p.discord_username) $$;

-- Una riga per discussione pubblica con autore e ultimo messaggio
create or replace function public.forum_public_threads(
  p_subcategory text, p_status text, p_limit int, p_offset int
) returns table (
  number bigint, subcategory text, title text, status text, created_at timestamptz, updated_at timestamptz,
  author_name text, author_mc text, replies bigint,
  last_at timestamptz, last_name text, last_mc text, total bigint
) language sql stable as $$
  with base as (
    select t.* from public.tickets t
    where t.is_public and t.status <> 'bozza'
      and (p_subcategory is null or t.subcategory = p_subcategory)
      and (p_status is null or t.status = p_status)
  )
  select t.number, t.subcategory, t.title, t.status, t.created_at, t.updated_at,
         public.forum_display_name(a), a.mc_name,
         greatest((select count(*) from public.ticket_messages m where m.ticket_id = t.id) - 1, 0),
         lm.created_at, lm.name, lm.mc,
         count(*) over ()
  from base t
  join public.profiles a on a.id = t.author_id
  left join lateral (
    select m.created_at, public.forum_display_name(p) as name, p.mc_name as mc
    from public.ticket_messages m left join public.profiles p on p.id = m.author_id
    where m.ticket_id = t.id order by m.created_at desc limit 1
  ) lm on true
  order by coalesce(lm.created_at, t.updated_at) desc
  limit least(coalesce(p_limit, 20), 100) offset greatest(coalesce(p_offset, 0), 0);
$$;

-- Conteggi per sezione pubblica (discussioni, messaggi)
create or replace function public.forum_section_counts()
returns table (subcategory text, threads bigint, messages bigint)
language sql stable as $$
  select t.subcategory, count(distinct t.id), count(m.id)
  from public.tickets t left join public.ticket_messages m on m.ticket_id = t.id
  where t.is_public and t.status <> 'bozza'
  group by t.subcategory;
$$;

-- Statistiche generali
create or replace function public.forum_stats()
returns table (threads bigint, messages bigint, members bigint, newest text, newest_mc text)
language sql stable as $$
  select
    (select count(*) from public.tickets where is_public and status <> 'bozza'),
    (select count(*) from public.ticket_messages m join public.tickets t on t.id = m.ticket_id where t.is_public and t.status <> 'bozza'),
    (select count(*) from public.profiles),
    (select public.forum_display_name(p) from public.profiles p order by p.created_at desc limit 1),
    (select p.mc_name from public.profiles p order by p.created_at desc limit 1);
$$;

-- Membri con i messaggi scritti nelle discussioni pubbliche
create or replace function public.forum_members(p_q text, p_limit int, p_offset int)
returns table (id uuid, name text, mc_name text, created_at timestamptz, last_seen_at timestamptz, messages bigint, is_staff boolean, total bigint)
language sql stable as $$
  select p.id, public.forum_display_name(p), p.mc_name, p.created_at, p.last_seen_at,
         (select count(*) from public.ticket_messages m join public.tickets t on t.id = m.ticket_id
           where m.author_id = p.id and t.is_public and t.status <> 'bozza'),
         exists (select 1 from public.staff_permissions sp where sp.profile_id = p.id),
         count(*) over ()
  from public.profiles p
  where p_q is null or p_q = '' or lower(public.forum_display_name(p)) like '%' || lower(p_q) || '%'
  order by p.created_at desc
  limit least(coalesce(p_limit, 30), 100) offset greatest(coalesce(p_offset, 0), 0);
$$;

-- Chi è online (attività negli ultimi 10 minuti)
create or replace function public.forum_online()
returns table (name text, mc_name text, is_staff boolean)
language sql stable as $$
  select public.forum_display_name(p), p.mc_name,
         exists (select 1 from public.staff_permissions sp where sp.profile_id = p.id)
  from public.profiles p
  where p.last_seen_at > now() - interval '10 minutes'
  order by p.last_seen_at desc
  limit 200;
$$;

-- Schede autore dei messaggi di una discussione pubblica
create or replace function public.forum_author_cards(p_ids uuid[])
returns table (id uuid, name text, mc_name text, created_at timestamptz, messages bigint, is_staff boolean)
language sql stable as $$
  select p.id, public.forum_display_name(p), p.mc_name, p.created_at,
         (select count(*) from public.ticket_messages m join public.tickets t on t.id = m.ticket_id
           where m.author_id = p.id and t.is_public and t.status <> 'bozza'),
         exists (select 1 from public.staff_permissions sp where sp.profile_id = p.id)
  from public.profiles p where p.id = any(p_ids);
$$;

-- Stesse regole di sicurezza della migrazione 001 per le nuove funzioni
do $$
begin
  revoke execute on all functions in schema public from public;
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke execute on all functions in schema public from anon;
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    revoke execute on all functions in schema public from authenticated;
  end if;
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    grant execute on all functions in schema public to service_role;
  end if;
end $$;
