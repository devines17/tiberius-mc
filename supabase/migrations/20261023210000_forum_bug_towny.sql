-- =====================================================================
-- Tiberius MC · Forum · Migrazione 002
--  * nuova sezione "Segnalazione bug" in Assistenza (permesso "bug")
--  * rimossa la sezione Towny "Conflitti" (solo se non contiene pratiche)
-- Da eseguire una volta nell'SQL Editor di Supabase, dopo la 001.
-- =====================================================================

insert into public.forum_permissions (key, label) values ('bug', 'Segnalazioni bug')
on conflict (key) do nothing;

insert into public.forum_subcategories (key, category, label, permission, position, sensitive) values
  ('bug', 'assistenza', 'Segnalazione bug', 'bug', 2, false)
on conflict (key) do nothing;

update public.forum_subcategories set position = 3 where key = 'unban';
update public.forum_subcategories set position = 4 where key = 'segnalazioni';
update public.forum_subcategories set position = 5 where key = 'cambio_nick';
update public.forum_subcategories set position = 6 where key = 'store';
update public.forum_subcategories set position = 1 where key = 'diplomazia';

insert into public.forum_statuses (subcategory, key, label, is_final, position) values
  ('bug', 'inviata',            'Inviata',                 false, 1),
  ('bug', 'in_revisione',       'In verifica',             false, 2),
  ('bug', 'info_richieste',     'Informazioni richieste',  false, 3),
  ('bug', 'confermato',         'Bug confermato',          false, 4),
  ('bug', 'risolto',            'Risolto',                 true,  5),
  ('bug', 'non_riproducibile',  'Non riproducibile',       true,  6),
  ('bug', 'chiusa',             'Chiusa',                  true,  7)
on conflict (subcategory, key) do nothing;

do $$
begin
  if exists (select 1 from public.tickets where subcategory = 'conflitti') then
    raise exception 'La sezione Conflitti contiene pratiche: non viene eliminata.';
  end if;
  delete from public.forum_statuses where subcategory = 'conflitti';
  delete from public.forum_subcategories where key = 'conflitti';
  delete from public.staff_permissions where permission = 'towny_conflitti';
  delete from public.forum_permissions where key = 'towny_conflitti';
end $$;
