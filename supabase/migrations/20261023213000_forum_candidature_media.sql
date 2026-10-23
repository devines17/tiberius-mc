-- =====================================================================
-- Tiberius MC · Forum · Migrazione 003
--  * nuova sezione "Candidature Media" (permesso "candidature_media")
--  * "Store e Goldoni" si chiama ora "Store"
-- Da eseguire una volta nell'SQL Editor di Supabase, dopo la 002.
-- =====================================================================

insert into public.forum_permissions (key, label) values ('candidature_media', 'Candidature media')
on conflict (key) do nothing;

update public.forum_permissions set label = 'Store' where key = 'store';
update public.forum_subcategories set label = 'Store' where key = 'store';
update public.forum_categories set label = 'Candidature' where key = 'candidature';

insert into public.forum_subcategories (key, category, label, permission, position, sensitive) values
  ('candidature_media', 'candidature', 'Candidature Media', 'candidature_media', 2, true)
on conflict (key) do nothing;

insert into public.forum_statuses (subcategory, key, label, is_final, position) values
  ('candidature_media', 'inviata',       'Inviata',                      false, 1),
  ('candidature_media', 'in_revisione',  'In revisione',                 false, 2),
  ('candidature_media', 'colloquio',     'Colloquio o approfondimento',  false, 3),
  ('candidature_media', 'accettata',     'Accettata',                    true,  4),
  ('candidature_media', 'respinta',      'Respinta',                     true,  5),
  ('candidature_media', 'ritirata',      'Ritirata',                     true,  6),
  ('candidature_media', 'chiusa',        'Chiusa',                       true,  7)
on conflict (subcategory, key) do nothing;
