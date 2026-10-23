-- =====================================================================
-- Tiberius MC · Forum ufficiale (pratiche di assistenza, Towny, candidature)
-- Migrazione 001 · da eseguire una volta nell'SQL Editor di Supabase.
--
-- Principi:
--  * Il database è letto e scritto SOLO dal server del sito con la chiave
--    service_role. Su tutte le tabelle la Row Level Security è attiva e
--    senza policy: le chiavi pubbliche (anon/authenticated) non leggono
--    né scrivono nulla, nemmeno per errore.
--  * Categorie, sottosezioni e stati sono tabelle con chiavi esterne: una
--    pratica non può esistere in una sezione o in uno stato non previsti.
--  * Le operazioni composte (nuova pratica, risposta, cambio stato…) sono
--    funzioni SQL, quindi avvengono in un'unica transazione.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- Identità: profili (login Discord) e collegamento Minecraft verificato
-- ---------------------------------------------------------------------

create table public.profiles (
  id                uuid primary key default gen_random_uuid(),
  discord_id        text not null unique,
  discord_username  text not null,
  discord_avatar    text,
  mc_uuid           uuid unique,
  mc_name           text,
  mc_verified_at    timestamptz,
  mc_verified_by    text check (mc_verified_by in ('plugin', 'staff')),
  created_at        timestamptz not null default now(),
  last_login_at     timestamptz not null default now(),
  constraint mc_coerente check ((mc_uuid is null) = (mc_name is null) and (mc_uuid is null) = (mc_verified_at is null))
);

create table public.sessions (
  id          uuid primary key default gen_random_uuid(),
  token_hash  text not null unique,
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null
);
create index sessions_profile_idx on public.sessions(profile_id);
create index sessions_expires_idx on public.sessions(expires_at);

-- Codici generati in gioco con /collega (validi pochi minuti, monouso)
create table public.mc_link_codes (
  code_hash   text primary key,
  mc_uuid     uuid not null,
  mc_name     text not null,
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null,
  used_at     timestamptz,
  used_by     uuid references public.profiles(id) on delete set null
);
create index mc_link_codes_expires_idx on public.mc_link_codes(expires_at);

-- ---------------------------------------------------------------------
-- Permessi dello staff: uno per sezione, più l'amministrazione generale
-- ---------------------------------------------------------------------

create table public.forum_permissions (
  key   text primary key,
  label text not null
);

insert into public.forum_permissions (key, label) values
  ('assistenza',        'Assistenza generale'),
  ('unban',             'Richieste unban'),
  ('segnalazioni',      'Segnalazioni giocatori'),
  ('cambio_nick',       'Cambio nickname'),
  ('store',             'Store e Goldoni'),
  ('towny_conflitti',   'Conflitti Towny'),
  ('towny_diplomazia',  'Diplomazia e richieste di guerra'),
  ('candidature',       'Candidature staff'),
  ('admin',             'Amministrazione generale');

create table public.staff_permissions (
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  permission  text not null references public.forum_permissions(key),
  granted_by  uuid references public.profiles(id) on delete set null,
  granted_at  timestamptz not null default now(),
  primary key (profile_id, permission)
);

-- ---------------------------------------------------------------------
-- Struttura del forum: 3 categorie, 8 sottosezioni, stati per sottosezione
-- ---------------------------------------------------------------------

create table public.forum_categories (
  key       text primary key,
  label     text not null,
  position  int  not null
);

insert into public.forum_categories (key, label, position) values
  ('assistenza',  'Assistenza',         1),
  ('towny',       'Towny',              2),
  ('candidature', 'Candidature Staff',  3);

create table public.forum_subcategories (
  key         text primary key,
  category    text not null references public.forum_categories(key),
  label       text not null,
  permission  text not null references public.forum_permissions(key),
  position    int  not null,
  -- Sezioni riservate: oltre a essere private come tutte le pratiche,
  -- non compaiono mai nei conteggi o negli elenchi condivisi.
  sensitive   boolean not null default false
);

insert into public.forum_subcategories (key, category, label, permission, position, sensitive) values
  ('assistenza_generale', 'assistenza',  'Assistenza generale',    'assistenza',       1, false),
  ('unban',               'assistenza',  'Richieste unban',        'unban',            2, false),
  ('segnalazioni',        'assistenza',  'Segnalazione giocatori', 'segnalazioni',     3, true),
  ('cambio_nick',         'assistenza',  'Richieste cambio nick',  'cambio_nick',      4, false),
  ('store',               'assistenza',  'Store e Goldoni',        'store',            5, true),
  ('conflitti',           'towny',       'Conflitti',              'towny_conflitti',  1, false),
  ('diplomazia',          'towny',       'Diplomazia',             'towny_diplomazia', 2, false),
  ('candidature',         'candidature', 'Candidature Staff',      'candidature',      1, true);

create table public.forum_statuses (
  subcategory  text not null references public.forum_subcategories(key),
  key          text not null,
  label        text not null,
  is_final     boolean not null default false,
  position     int not null,
  primary key (subcategory, key)
);

insert into public.forum_statuses (subcategory, key, label, is_final, position) values
  -- A1 Assistenza generale
  ('assistenza_generale', 'aperta',            'Aperta',                        false, 1),
  ('assistenza_generale', 'in_lavorazione',    'In lavorazione',                false, 2),
  ('assistenza_generale', 'info_richieste',    'Informazioni richieste',        false, 3),
  ('assistenza_generale', 'risolta',           'Risolta',                       true,  4),
  ('assistenza_generale', 'chiusa',            'Chiusa',                        true,  5),
  -- A2 Unban
  ('unban', 'inviata',          'Inviata',                false, 1),
  ('unban', 'in_revisione',     'In revisione',           false, 2),
  ('unban', 'info_richieste',   'Informazioni richieste', false, 3),
  ('unban', 'accolta',          'Accolta',                true,  4),
  ('unban', 'respinta',         'Respinta',               true,  5),
  ('unban', 'chiusa',           'Chiusa',                 true,  6),
  -- A3 Segnalazioni
  ('segnalazioni', 'inviata',         'Inviata',                 false, 1),
  ('segnalazioni', 'in_revisione',    'In revisione',            false, 2),
  ('segnalazioni', 'info_richieste',  'Informazioni richieste',  false, 3),
  ('segnalazioni', 'provvedimento',   'Provvedimento preso',     true,  4),
  ('segnalazioni', 'non_fondata',     'Non fondata',             true,  5),
  ('segnalazioni', 'chiusa',          'Chiusa',                  true,  6),
  -- A4 Cambio nick
  ('cambio_nick', 'inviata',         'Inviata',                 false, 1),
  ('cambio_nick', 'in_revisione',    'In revisione',            false, 2),
  ('cambio_nick', 'info_richieste',  'Informazioni richieste',  false, 3),
  ('cambio_nick', 'approvata',       'Approvata',               false, 4),
  ('cambio_nick', 'respinta',        'Respinta',                true,  5),
  ('cambio_nick', 'completata',      'Completata',              true,  6),
  -- A5 Store e Goldoni
  ('store', 'inviata',         'Inviata',                 false, 1),
  ('store', 'in_revisione',    'In revisione',            false, 2),
  ('store', 'info_richieste',  'Informazioni richieste',  false, 3),
  ('store', 'risolta',         'Risolta',                 true,  4),
  ('store', 'respinta',        'Respinta',                true,  5),
  ('store', 'chiusa',          'Chiusa',                  true,  6),
  -- B1 Conflitti
  ('conflitti', 'inviata',         'Inviata',                 false, 1),
  ('conflitti', 'in_revisione',    'In revisione',            false, 2),
  ('conflitti', 'info_richieste',  'Informazioni richieste',  false, 3),
  ('conflitti', 'risolta',         'Risolta',                 true,  4),
  ('conflitti', 'respinta',        'Respinta',                true,  5),
  ('conflitti', 'chiusa',          'Chiusa',                  true,  6),
  -- B2 Diplomazia
  ('diplomazia', 'bozza',           'Bozza',                    false, 1),
  ('diplomazia', 'inviata',         'Inviata',                  false, 2),
  ('diplomazia', 'in_revisione',    'In revisione',             false, 3),
  ('diplomazia', 'info_richieste',  'In attesa di informazioni',false, 4),
  ('diplomazia', 'approvata',       'Approvata',                false, 5),
  ('diplomazia', 'respinta',        'Respinta',                 true,  6),
  ('diplomazia', 'annullata',       'Annullata',                true,  7),
  ('diplomazia', 'completata',      'Completata',               true,  8),
  -- C Candidature
  ('candidature', 'inviata',         'Inviata',                        false, 1),
  ('candidature', 'in_revisione',    'In revisione',                   false, 2),
  ('candidature', 'colloquio',       'Colloquio o approfondimento',    false, 3),
  ('candidature', 'accettata',       'Accettata',                      true,  4),
  ('candidature', 'respinta',        'Respinta',                       true,  5),
  ('candidature', 'ritirata',        'Ritirata',                       true,  6),
  ('candidature', 'chiusa',          'Chiusa',                         true,  7);

-- ---------------------------------------------------------------------
-- Pratiche
-- ---------------------------------------------------------------------

create sequence public.ticket_number_seq start 1001;

create table public.tickets (
  id                   uuid primary key default gen_random_uuid(),
  number               bigint not null unique default nextval('public.ticket_number_seq'),
  subcategory          text not null references public.forum_subcategories(key),
  title                text not null check (char_length(title) between 3 and 140),
  author_id            uuid not null references public.profiles(id) on delete restrict,
  -- Identità Minecraft al momento dell'apertura (verificata o dichiarata)
  author_mc_uuid       uuid,
  author_mc_name       text,
  author_mc_verified   boolean not null default false,
  status               text not null,
  -- Campi specifici del modulo della sottosezione
  fields               jsonb not null default '{}'::jsonb,
  priority             text not null default 'normale' check (priority in ('bassa', 'normale', 'alta', 'urgente')),
  assigned_to          uuid references public.profiles(id) on delete set null,
  awaiting             text not null default 'staff' check (awaiting in ('staff', 'giocatore', 'nessuno')),
  reopen_requested_at  timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  author_seen_at       timestamptz not null default now(),
  closed_at            timestamptz,
  search_text          text not null default '',
  constraint ticket_status_valido foreign key (subcategory, status) references public.forum_statuses(subcategory, key)
);
create index tickets_author_idx      on public.tickets(author_id, updated_at desc);
create index tickets_sub_status_idx  on public.tickets(subcategory, status, updated_at desc);
create index tickets_assigned_idx    on public.tickets(assigned_to);
create index tickets_closed_idx      on public.tickets(closed_at);

create table public.ticket_messages (
  id          uuid primary key default gen_random_uuid(),
  ticket_id   uuid not null references public.tickets(id) on delete cascade,
  author_id   uuid references public.profiles(id) on delete set null,
  is_staff    boolean not null,
  body        text not null check (char_length(body) between 1 and 8000),
  created_at  timestamptz not null default now()
);
create index ticket_messages_ticket_idx on public.ticket_messages(ticket_id, created_at);

-- Note interne: mai visibili al giocatore
create table public.ticket_internal_notes (
  id          uuid primary key default gen_random_uuid(),
  ticket_id   uuid not null references public.tickets(id) on delete cascade,
  author_id   uuid references public.profiles(id) on delete set null,
  body        text not null check (char_length(body) between 1 and 8000),
  created_at  timestamptz not null default now()
);
create index ticket_notes_ticket_idx on public.ticket_internal_notes(ticket_id, created_at);

create table public.ticket_attachments (
  id            uuid primary key default gen_random_uuid(),
  ticket_id     uuid not null references public.tickets(id) on delete cascade,
  message_id    uuid references public.ticket_messages(id) on delete cascade,
  note_id       uuid references public.ticket_internal_notes(id) on delete cascade,
  uploader_id   uuid references public.profiles(id) on delete set null,
  storage_path  text not null unique,
  filename      text not null,
  mime          text not null,
  size_bytes    int  not null check (size_bytes > 0 and size_bytes <= 4194304),
  -- Allegato di una nota interna: visibile solo allo staff
  internal      boolean not null default false,
  created_at    timestamptz not null default now()
);
create index ticket_attachments_ticket_idx on public.ticket_attachments(ticket_id);

create table public.ticket_status_history (
  id           uuid primary key default gen_random_uuid(),
  ticket_id    uuid not null references public.tickets(id) on delete cascade,
  from_status  text,
  to_status    text not null,
  actor_id     uuid references public.profiles(id) on delete set null,
  actor_role   text not null check (actor_role in ('giocatore', 'staff', 'sistema')),
  reason       text,
  created_at   timestamptz not null default now()
);
create index ticket_history_ticket_idx on public.ticket_status_history(ticket_id, created_at);

create table public.ticket_assignments (
  id           uuid primary key default gen_random_uuid(),
  ticket_id    uuid not null references public.tickets(id) on delete cascade,
  assigned_to  uuid references public.profiles(id) on delete set null,
  assigned_by  uuid references public.profiles(id) on delete set null,
  created_at   timestamptz not null default now()
);
create index ticket_assignments_ticket_idx on public.ticket_assignments(ticket_id, created_at);

-- ---------------------------------------------------------------------
-- Notifiche, impostazioni, registro operazioni, limiti anti-spam
-- ---------------------------------------------------------------------

create table public.notifications (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  ticket_id   uuid references public.tickets(id) on delete cascade,
  kind        text not null check (kind in ('risposta_staff', 'info_richieste', 'cambio_stato', 'decisione', 'chiusura', 'nuova_pratica', 'risposta_giocatore', 'assegnazione', 'riapertura_richiesta')),
  title       text not null,
  created_at  timestamptz not null default now(),
  read_at     timestamptz
);
create index notifications_profile_idx on public.notifications(profile_id, read_at, created_at desc);

create table public.forum_settings (
  key         text primary key,
  value       jsonb not null,
  updated_by  uuid references public.profiles(id) on delete set null,
  updated_at  timestamptz not null default now()
);

insert into public.forum_settings (key, value) values
  ('candidature', '{"aperte": true, "ruoli": ["Helper", "Moderatore", "Builder"], "eta_minima": null, "domande": []}'::jsonb),
  ('archivio',    '{"conservazione_giorni": null}'::jsonb);

create table public.audit_log (
  id          bigint generated always as identity primary key,
  actor_id    uuid references public.profiles(id) on delete set null,
  action      text not null,
  ticket_id   uuid references public.tickets(id) on delete set null,
  target_id   uuid references public.profiles(id) on delete set null,
  details     jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);
create index audit_log_created_idx on public.audit_log(created_at desc);
create index audit_log_ticket_idx  on public.audit_log(ticket_id);

create table public.rate_limits (
  bucket        text not null,
  window_start  timestamptz not null,
  hits          int not null default 0,
  primary key (bucket, window_start)
);

-- ---------------------------------------------------------------------
-- Funzioni
-- ---------------------------------------------------------------------

-- Testo per la ricerca: titolo + campi del modulo (minuscolo)
create or replace function public.tickets_search_text() returns trigger
language plpgsql as $$
begin
  new.search_text := lower(coalesce(new.title, '') || ' ' || coalesce(new.fields::text, '') || ' ' || coalesce(new.author_mc_name, ''));
  return new;
end $$;

create trigger tickets_search_text_trg
  before insert or update of title, fields, author_mc_name on public.tickets
  for each row execute function public.tickets_search_text();

-- Conta una richiesta in una finestra di tempo; restituisce true se il limite è superato
create or replace function public.forum_rate_hit(p_bucket text, p_window_seconds int, p_max int)
returns boolean language plpgsql as $$
declare
  v_start timestamptz := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  v_hits int;
begin
  insert into public.rate_limits (bucket, window_start, hits) values (p_bucket, v_start, 1)
  on conflict (bucket, window_start) do update set hits = public.rate_limits.hits + 1
  returning hits into v_hits;
  delete from public.rate_limits where window_start < now() - interval '1 day';
  return v_hits > p_max;
end $$;

-- Nuova pratica: pratica + primo messaggio + storico + notifiche allo staff, in un'unica transazione
create or replace function public.forum_create_ticket(
  p_author uuid, p_subcategory text, p_title text, p_fields jsonb, p_body text,
  p_status text, p_mc_uuid uuid, p_mc_name text, p_mc_verified boolean
) returns public.tickets language plpgsql as $$
declare
  v_ticket public.tickets;
  v_perm text;
begin
  select permission into v_perm from public.forum_subcategories where key = p_subcategory;
  if v_perm is null then raise exception 'sottosezione_non_valida'; end if;

  insert into public.tickets (subcategory, title, author_id, author_mc_uuid, author_mc_name, author_mc_verified, status, fields, awaiting)
  values (p_subcategory, p_title, p_author, p_mc_uuid, p_mc_name, coalesce(p_mc_verified, false), p_status, coalesce(p_fields, '{}'::jsonb),
          case when p_status = 'bozza' then 'nessuno' else 'staff' end)
  returning * into v_ticket;

  if p_body is not null and char_length(p_body) > 0 then
    insert into public.ticket_messages (ticket_id, author_id, is_staff, body) values (v_ticket.id, p_author, false, p_body);
  end if;

  insert into public.ticket_status_history (ticket_id, from_status, to_status, actor_id, actor_role, reason)
  values (v_ticket.id, null, p_status, p_author, 'giocatore', null);

  if p_status <> 'bozza' then
    insert into public.notifications (profile_id, ticket_id, kind, title)
    select distinct sp.profile_id, v_ticket.id, 'nuova_pratica', 'Nuova pratica #' || v_ticket.number || ': ' || p_title
    from public.staff_permissions sp
    where sp.permission = v_perm and sp.profile_id <> p_author;
  end if;

  return v_ticket;
end $$;

-- Notifica allo staff della sezione per una pratica appena inviata (es. bozza diplomatica inviata)
create or replace function public.forum_notify_staff_new(p_ticket uuid) returns void language plpgsql as $$
declare v_t public.tickets; v_perm text;
begin
  select * into v_t from public.tickets where id = p_ticket;
  if v_t.id is null or v_t.status = 'bozza' then return; end if;
  select permission into v_perm from public.forum_subcategories where key = v_t.subcategory;
  insert into public.notifications (profile_id, ticket_id, kind, title)
  select distinct sp.profile_id, v_t.id, 'nuova_pratica', 'Nuova pratica #' || v_t.number || ': ' || v_t.title
  from public.staff_permissions sp where sp.permission = v_perm and sp.profile_id <> v_t.author_id;
end $$;

-- Messaggio in una pratica (giocatore o staff), con aggiornamento di attesa/stato e notifiche
create or replace function public.forum_add_message(
  p_ticket uuid, p_author uuid, p_is_staff boolean, p_body text, p_new_status text
) returns public.ticket_messages language plpgsql as $$
declare
  v_t public.tickets;
  v_msg public.ticket_messages;
  v_perm text;
begin
  select * into v_t from public.tickets where id = p_ticket for update;
  if v_t.id is null then raise exception 'pratica_non_trovata'; end if;

  insert into public.ticket_messages (ticket_id, author_id, is_staff, body) values (p_ticket, p_author, p_is_staff, p_body)
  returning * into v_msg;

  if p_new_status is not null and p_new_status <> v_t.status then
    insert into public.ticket_status_history (ticket_id, from_status, to_status, actor_id, actor_role, reason)
    values (p_ticket, v_t.status, p_new_status, p_author, case when p_is_staff then 'staff' else 'giocatore' end,
            case when p_is_staff then null else 'Risposta del giocatore' end);
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
    select permission into v_perm from public.forum_subcategories where key = v_t.subcategory;
    insert into public.notifications (profile_id, ticket_id, kind, title)
    select distinct x.pid, p_ticket, 'risposta_giocatore', 'Il giocatore ha risposto alla pratica #' || v_t.number
    from (
      select v_t.assigned_to as pid where v_t.assigned_to is not null
      union
      select sp.profile_id from public.staff_permissions sp where sp.permission = v_perm and v_t.assigned_to is null
    ) x where x.pid is not null and x.pid <> p_author;
  end if;

  return v_msg;
end $$;

-- Cambio di stato con motivazione, storico e notifica al giocatore
create or replace function public.forum_set_status(
  p_ticket uuid, p_actor uuid, p_actor_role text, p_status text, p_reason text, p_notify_kind text
) returns public.tickets language plpgsql as $$
declare
  v_t public.tickets;
  v_final boolean;
  v_label text;
begin
  select * into v_t from public.tickets where id = p_ticket for update;
  if v_t.id is null then raise exception 'pratica_non_trovata'; end if;
  select is_final, label into v_final, v_label from public.forum_statuses where subcategory = v_t.subcategory and key = p_status;
  if v_label is null then raise exception 'stato_non_valido'; end if;
  if p_status = v_t.status then return v_t; end if;

  insert into public.ticket_status_history (ticket_id, from_status, to_status, actor_id, actor_role, reason)
  values (p_ticket, v_t.status, p_status, p_actor, p_actor_role, nullif(p_reason, ''));

  update public.tickets set
    status = p_status,
    closed_at = case when v_final then now() else null end,
    reopen_requested_at = case when v_final then reopen_requested_at else null end,
    awaiting = case when v_final then 'nessuno' when p_status = 'info_richieste' then 'giocatore' when p_actor_role = 'giocatore' then 'staff' else awaiting end,
    updated_at = now()
  where id = p_ticket
  returning * into v_t;

  if p_actor_role = 'staff' and p_notify_kind is not null then
    insert into public.notifications (profile_id, ticket_id, kind, title)
    values (v_t.author_id, p_ticket, p_notify_kind, 'Pratica #' || v_t.number || ': ' || v_label);
  end if;

  return v_t;
end $$;

-- Ricerca che rispetta i permessi.
-- p_viewer: chi cerca. p_staff_subs: sottosezioni per cui ha permessi staff.
-- Un giocatore vede solo le proprie pratiche; lo staff anche quelle delle sue sezioni
-- (mai le bozze altrui). Le note interne sono cercate solo nelle sezioni dello staff.
create or replace function public.forum_search(
  p_viewer uuid, p_staff_subs text[], p_q text, p_number bigint, p_subcategory text,
  p_status text, p_from date, p_to date, p_author text, p_closed boolean, p_limit int
) returns setof public.tickets language sql stable as $$
  select t.* from public.tickets t
  where (
      t.author_id = p_viewer
      or (t.subcategory = any(coalesce(p_staff_subs, '{}')) and t.status <> 'bozza')
    )
    and (p_number is null or t.number = p_number)
    and (p_subcategory is null or t.subcategory = p_subcategory)
    and (p_status is null or t.status = p_status)
    and (p_from is null or t.created_at >= p_from)
    and (p_to is null or t.created_at < p_to + 1)
    and (p_closed is null or (t.closed_at is not null) = p_closed)
    and (
      p_author is null
      or (t.subcategory = any(coalesce(p_staff_subs, '{}')) and lower(coalesce(t.author_mc_name, '')) like '%' || lower(p_author) || '%')
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

-- ---------------------------------------------------------------------
-- Sicurezza: RLS attiva ovunque, nessuna policy, nessun accesso pubblico
-- ---------------------------------------------------------------------

do $$
declare r record;
begin
  for r in select tablename from pg_tables where schemaname = 'public' and tablename in (
    'profiles','sessions','mc_link_codes','forum_permissions','staff_permissions','forum_categories',
    'forum_subcategories','forum_statuses','tickets','ticket_messages','ticket_internal_notes',
    'ticket_attachments','ticket_status_history','ticket_assignments','notifications','forum_settings',
    'audit_log','rate_limits')
  loop
    execute format('alter table public.%I enable row level security', r.tablename);
    execute format('alter table public.%I force row level security', r.tablename);
  end loop;
end $$;

-- Su Supabase esistono i ruoli anon e authenticated: togliamo ogni permesso,
-- comprese le funzioni (che altrimenti sarebbero richiamabili via API).
do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke all on all tables in schema public from anon;
    revoke all on all sequences in schema public from anon;
    revoke execute on all functions in schema public from anon;
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    revoke all on all tables in schema public from authenticated;
    revoke all on all sequences in schema public from authenticated;
    revoke execute on all functions in schema public from authenticated;
  end if;
  revoke execute on all functions in schema public from public;
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    grant execute on all functions in schema public to service_role;
    grant all on all tables in schema public to service_role;
    grant all on all sequences in schema public to service_role;
  end if;
end $$;

-- ---------------------------------------------------------------------
-- Allegati: bucket privato (solo su Supabase, dove esiste lo schema storage)
-- ---------------------------------------------------------------------

do $$
begin
  if exists (select 1 from pg_namespace where nspname = 'storage') then
    insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    values ('forum-allegati', 'forum-allegati', false, 4194304,
            array['image/png','image/jpeg','image/webp','image/gif','application/pdf','text/plain'])
    on conflict (id) do update set public = false;
  end if;
end $$;
