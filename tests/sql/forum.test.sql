-- Test del database del forum. Si esegue su un database con la migrazione applicata:
--   psql -v ON_ERROR_STOP=1 -f tests/sql/forum.test.sql
-- Ogni controllo che fallisce interrompe lo script con un errore esplicito.
-- Tutto avviene in una transazione annullata alla fine: nessun dato resta.

begin;

create or replace function pg_temp.check(ok boolean, msg text) returns void language plpgsql as $$
begin
  if not coalesce(ok, false) then raise exception 'TEST FALLITO: %', msg; end if;
  raise notice 'ok  %', msg;
end $$;

-- Dati di prova
insert into profiles (id, discord_id, discord_username, mc_uuid, mc_name, mc_verified_at, mc_verified_by) values
  ('00000000-0000-0000-0000-00000000000a', 'd-a', 'giocatoreA', '11111111-1111-1111-1111-111111111111', 'GiocatoreA', now(), 'plugin'),
  ('00000000-0000-0000-0000-00000000000b', 'd-b', 'giocatoreB', null, null, null, null),
  ('00000000-0000-0000-0000-0000000000c1', 'd-c1', 'staffStore', null, null, null, null),
  ('00000000-0000-0000-0000-0000000000c2', 'd-c2', 'staffCandidature', null, null, null, null);
insert into staff_permissions (profile_id, permission) values
  ('00000000-0000-0000-0000-0000000000c1', 'store'),
  ('00000000-0000-0000-0000-0000000000c2', 'candidature');

-- 1. Esistono solo le 4 categorie e le 11 sottosezioni previste (dopo le migrazioni 002, 003 e 005) (unban una volta sola)
select pg_temp.check((select count(*) from forum_categories) = 4, 'quattro categorie');
select pg_temp.check((select count(*) from forum_subcategories) = 11, 'undici sottosezioni');
select pg_temp.check((select array_agg(key order by key) from forum_subcategories where visibility = 'public') = array['assistenza_generale','diplomazia','proposte','salotto'],
  'pubbliche solo assistenza generale, diplomazia e community');
select pg_temp.check((select bool_and(not open_replies) from forum_subcategories where category <> 'community'), 'risposte aperte solo in community');
select pg_temp.check((select count(*) from forum_subcategories where key like '%unban%') = 1, 'unban non duplicato');

-- 2. Una pratica non può stare in una sezione o in uno stato inesistenti
do $$ begin
  begin
    insert into tickets (subcategory, title, author_id, status) values ('suggerimenti', 'prova', '00000000-0000-0000-0000-00000000000a', 'inviata');
    raise exception 'TEST FALLITO: accettata una sezione inesistente';
  exception when foreign_key_violation then raise notice 'ok  sezione inesistente rifiutata';
  end;
  begin
    insert into tickets (subcategory, title, author_id, status) values ('store', 'prova', '00000000-0000-0000-0000-00000000000a', 'bozza');
    raise exception 'TEST FALLITO: accettato uno stato non previsto per la sezione';
  exception when foreign_key_violation then raise notice 'ok  stato non previsto rifiutato';
  end;
end $$;

-- 3. Creazione pratica: messaggio, storico e notifica solo allo staff con il permesso giusto
select forum_create_ticket('00000000-0000-0000-0000-00000000000a', 'store', 'Goldoni non accreditati',
  '{"tipo_problema":"goldoni_non_accreditati"}'::jsonb, 'Ho pagato ieri', 'inviata',
  '11111111-1111-1111-1111-111111111111', 'GiocatoreA', true);
select forum_create_ticket('00000000-0000-0000-0000-00000000000b', 'candidature', 'Candidatura Helper',
  '{"ruolo":"Helper"}'::jsonb, 'Vorrei aiutare', 'inviata', null, null, false);

select pg_temp.check((select count(*) from ticket_messages) = 2, 'primo messaggio salvato');
select pg_temp.check((select count(*) from ticket_status_history) = 2, 'storico stati alla creazione');
select pg_temp.check((select count(*) from notifications where profile_id = '00000000-0000-0000-0000-0000000000c1') = 1, 'staff store notificato della pratica store');
select pg_temp.check((select count(*) from notifications n join tickets t on t.id = n.ticket_id
  where n.profile_id = '00000000-0000-0000-0000-0000000000c1' and t.subcategory = 'candidature') = 0,
  'staff store NON notificato delle candidature');

-- 4. Ricerca con permessi
select pg_temp.check((select count(*) from forum_search('00000000-0000-0000-0000-00000000000a', '{}', null, null, null, null, null, null, null, null, 50)) = 1,
  'giocatore A vede solo la propria pratica');
select pg_temp.check((select count(*) from forum_search('00000000-0000-0000-0000-00000000000a', '{}', 'helper', null, null, null, null, null, null, null, 50)) = 0,
  'giocatore A non trova la candidatura di B cercando "helper"');
select pg_temp.check((select count(*) from forum_search('00000000-0000-0000-0000-0000000000c1', array['store'], null, null, null, null, null, null, null, null, 50)) = 1,
  'staff store vede solo le pratiche store');
select pg_temp.check((select count(*) from forum_search('00000000-0000-0000-0000-0000000000c1', array['store'], 'vorrei aiutare', null, null, null, null, null, null, null, 50)) = 0,
  'staff store non trova contenuti delle candidature');
select pg_temp.check((select count(*) from forum_search('00000000-0000-0000-0000-0000000000c2', array['candidature'], null, null, null, null, null, null, 'giocatorea', null, 50)) = 0,
  'staff candidature non trova pratiche store cercando l''autore');

-- 5. Note interne cercabili solo dallo staff della sezione
insert into ticket_internal_notes (ticket_id, author_id, body)
  select id, '00000000-0000-0000-0000-0000000000c1', 'nota segreta transazione' from tickets where subcategory = 'store';
select pg_temp.check((select count(*) from forum_search('00000000-0000-0000-0000-00000000000a', '{}', 'nota segreta', null, null, null, null, null, null, null, 50)) = 0,
  'l''autore non trova la pratica cercando il testo di una nota interna');
select pg_temp.check((select count(*) from forum_search('00000000-0000-0000-0000-0000000000c1', array['store'], 'nota segreta', null, null, null, null, null, null, null, 50)) = 1,
  'lo staff della sezione trova la nota interna');

-- 6. Le bozze sono visibili solo all'autore
select forum_create_ticket('00000000-0000-0000-0000-00000000000b', 'diplomazia', 'Alleanza', '{}'::jsonb, null, 'bozza', null, null, false);
insert into staff_permissions (profile_id, permission) values ('00000000-0000-0000-0000-0000000000c1', 'towny_diplomazia');
select pg_temp.check((select count(*) from forum_search('00000000-0000-0000-0000-0000000000c1', array['store','diplomazia'], 'alleanza', null, null, null, null, null, null, null, 50)) = 0,
  'lo staff non vede le bozze diplomatiche altrui');
select pg_temp.check((select count(*) from notifications where title like '%Alleanza%') = 0, 'nessuna notifica per una bozza');

-- 6b. Bozza inviata: ora lo staff la vede e viene notificato
select forum_set_status((select id from tickets where subcategory = 'diplomazia'), '00000000-0000-0000-0000-00000000000b', 'giocatore', 'inviata', 'Bozza inviata', null);
select forum_notify_staff_new((select id from tickets where subcategory = 'diplomazia'));
select pg_temp.check((select count(*) from forum_search('00000000-0000-0000-0000-0000000000c1', array['store','diplomazia'], 'alleanza', null, null, null, null, null, null, null, 50)) = 1,
  'bozza inviata visibile allo staff diplomazia');
select pg_temp.check((select count(*) from notifications where title like '%Alleanza%' and profile_id = '00000000-0000-0000-0000-0000000000c1') = 1, 'staff diplomazia notificato all''invio');

-- 7. Risposta staff con richiesta di informazioni: stato, attesa, notifica, storico
select forum_add_message((select id from tickets where subcategory = 'store'), '00000000-0000-0000-0000-0000000000c1', true, 'Ci serve il numero ordine', 'info_richieste');
select pg_temp.check((select status = 'info_richieste' and awaiting = 'giocatore' from tickets where subcategory = 'store'), 'stato e attesa aggiornati');
select pg_temp.check((select count(*) from notifications where profile_id = '00000000-0000-0000-0000-00000000000a' and kind = 'info_richieste') = 1, 'giocatore notificato della richiesta di informazioni');
select pg_temp.check((select count(*) from ticket_status_history h join tickets t on t.id = h.ticket_id where t.subcategory = 'store') = 2, 'cambio stato nello storico');

-- 8. Decisione finale: chiusura registrata e notificata
select forum_set_status((select id from tickets where subcategory = 'store'), '00000000-0000-0000-0000-0000000000c1', 'staff', 'risolta', 'Goldoni accreditati manualmente', 'decisione');
select pg_temp.check((select closed_at is not null and awaiting = 'nessuno' from tickets where subcategory = 'store'), 'pratica chiusa con data');
select pg_temp.check((select reason from ticket_status_history where to_status = 'risolta') = 'Goldoni accreditati manualmente', 'motivazione registrata');
select pg_temp.check((select count(*) from notifications where profile_id = '00000000-0000-0000-0000-00000000000a' and kind = 'decisione') = 1, 'giocatore notificato della decisione');

-- 8b. Forum pubblico
-- Una pratica privata non è mai pubblica; una nuova in sezione pubblica sì
select pg_temp.check((select not is_public from tickets where subcategory = 'store'), 'pratica store privata');
select forum_create_ticket('00000000-0000-0000-0000-00000000000a', 'assistenza_generale', 'Non riesco a entrare', '{"tipo_problema":"connessione"}'::jsonb, 'Mi dà timeout', 'aperta', null, null, false);
select pg_temp.check((select is_public from tickets where subcategory = 'assistenza_generale'), 'assistenza generale nasce pubblica');
-- Una pratica pubblica si trova anche senza account, quelle private no
select pg_temp.check((select count(*) from forum_search(null, '{}', null, null, null, null, null, null, null, null, 50)) = 2,
  'anonimo trova solo le discussioni pubbliche (assistenza e diplomazia inviata)');
select pg_temp.check((select count(*) from forum_search(null, '{}', 'goldoni', null, null, null, null, null, null, null, 50)) = 0, 'anonimo non trova lo store');
select pg_temp.check((select count(*) from forum_search(null, '{}', 'vorrei aiutare', null, null, null, null, null, null, null, 50)) = 0, 'anonimo non trova le candidature');
-- In una sezione non aperta chi non è autore né staff non può rispondere
do $$ begin
  begin
    perform forum_add_message((select id from tickets where subcategory = 'assistenza_generale'), '00000000-0000-0000-0000-00000000000b', false, 'intrusione', null);
    raise exception 'TEST FALLITO: risposta di un estraneo accettata';
  exception when raise_exception then
    if sqlerrm <> 'risposta_non_consentita' then raise; end if;
    raise notice 'ok  estraneo non risponde in assistenza';
  end;
end $$;
-- Community: nessuna notifica allo staff, risposte libere con notifica all'autore
insert into staff_permissions (profile_id, permission) values ('00000000-0000-0000-0000-0000000000c2', 'community');
select forum_create_ticket('00000000-0000-0000-0000-00000000000a', 'salotto', 'Presentiamoci', '{}'::jsonb, 'Ciao a tutti', 'aperta', null, null, false);
select pg_temp.check((select count(*) from notifications where title like '%Presentiamoci%') = 0, 'nessuna notifica staff per una discussione community');
select forum_add_message((select id from tickets where subcategory = 'salotto'), '00000000-0000-0000-0000-00000000000b', false, 'Ciao!', null);
select pg_temp.check((select count(*) from notifications where profile_id = '00000000-0000-0000-0000-00000000000a' and kind = 'risposta_discussione') = 1, 'autore notificato della risposta');
select pg_temp.check((select awaiting = 'nessuno' from tickets where subcategory = 'salotto'), 'community senza attesa staff');
select forum_add_message((select id from tickets where subcategory = 'salotto'), '00000000-0000-0000-0000-00000000000a', false, 'Benvenuto', null);
select pg_temp.check((select count(*) from notifications where kind = 'risposta_discussione') = 1, 'nessuna notifica a sé stessi');
-- Statistiche ed elenchi solo pubblici
select pg_temp.check((select threads from forum_stats()) = 3, 'statistiche: tre discussioni pubbliche');
select pg_temp.check((select messages from forum_stats()) = 4, 'statistiche: messaggi solo pubblici');
select pg_temp.check((select members from forum_stats()) = 4, 'statistiche: membri');
select pg_temp.check((select count(*) from forum_section_counts() where subcategory in ('store','candidature')) = 0, 'conteggi senza sezioni private');
select pg_temp.check((select replies from forum_public_threads('salotto', null, 10, 0)) = 2, 'risposte contate');
select pg_temp.check((select last_name from forum_public_threads('salotto', null, 10, 0)) = 'GiocatoreA', 'ultimo messaggio');
select pg_temp.check((select total from forum_public_threads(null, null, 1, 0)) = 3, 'totale per la paginazione');
select pg_temp.check((select messages from forum_members(null, 10, 0) where name = 'giocatoreB') = 1, 'messaggi pubblici del membro');
select pg_temp.check((select messages from forum_members(null, 10, 0) where name = 'staffCandidature') = 0, 'messaggi privati non contati');
update profiles set last_seen_at = now() where discord_username in ('giocatoreB', 'staffCandidature');
select pg_temp.check((select count(*) from forum_online()) = 2 and (select count(*) from forum_online() where is_staff) = 1, 'utenti e staff online');

-- 9. Limite anti-spam
select pg_temp.check(not forum_rate_hit('test', 3600, 2) and not forum_rate_hit('test', 3600, 2) and forum_rate_hit('test', 3600, 2), 'rate limit scatta al terzo tentativo');

-- 10. Le chiavi pubbliche non leggono nulla e non chiamano funzioni
set local role anon;
do $$ begin
  begin
    perform 1 from tickets limit 1;
    raise exception 'TEST FALLITO: anon legge le pratiche';
  exception when insufficient_privilege then raise notice 'ok  anon non legge le pratiche';
  end;
  begin
    perform forum_search(null, '{store}', null, null, null, null, null, null, null, null, 10);
    raise exception 'TEST FALLITO: anon chiama forum_search';
  exception when insufficient_privilege then raise notice 'ok  anon non chiama le funzioni';
  end;
end $$;
reset role;
set local role authenticated;
do $$ begin
  begin
    perform 1 from ticket_internal_notes limit 1;
    raise exception 'TEST FALLITO: authenticated legge le note interne';
  exception when insufficient_privilege then raise notice 'ok  authenticated non legge le note interne';
  end;
end $$;
reset role;

rollback;
\echo TUTTI I TEST SQL SUPERATI
