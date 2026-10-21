-- ══════════════════════════════════════════════════════
-- MIGRAÇÃO: "Melhores do mês" vira uma coleção por mês (2026)
-- Rodar no SQL Editor do Supabase (uma vez só)
-- ══════════════════════════════════════════════════════

-- 1. Coleções por mês
insert into collections (slug, title, subtitle, "order", is_bonus) values
  ('melhores-de-junho-2026',    'Melhores de Junho 2026',    'Os anúncios que mais se destacaram em junho de 2026',    7,  false),
  ('melhores-de-julho-2026',    'Melhores de Julho 2026',    'Os anúncios que mais se destacaram em julho de 2026',    8,  false),
  ('melhores-de-agosto-2026',   'Melhores de Agosto 2026',   'Os anúncios que mais se destacaram em agosto de 2026',   9,  false),
  ('melhores-de-setembro-2026', 'Melhores de Setembro 2026', 'Os anúncios que mais se destacaram em setembro de 2026', 10, false),
  ('melhores-de-outubro-2026',  'Melhores de Outubro 2026',  'Os anúncios que mais se destacaram em outubro de 2026',  11, false)
on conflict (slug) do nothing;

update collections set "order" = 12 where slug = 'especial-black';

-- 2. Move cada anúncio para o mês dele (pelo prefixo do título)
update ads set collection_id = (select id from collections where slug = 'melhores-de-junho-2026')    where title like 'Junho · %';
update ads set collection_id = (select id from collections where slug = 'melhores-de-julho-2026')    where title like 'Julho · %';
update ads set collection_id = (select id from collections where slug = 'melhores-de-agosto-2026')   where title like 'Agosto · %';
update ads set collection_id = (select id from collections where slug = 'melhores-de-setembro-2026') where title like 'Setembro · %';
update ads set collection_id = (select id from collections where slug = 'melhores-de-outubro-2026')  where title like 'Outubro · %';

-- 3. Tira o mês do título (a coleção já diz o mês)
update ads set title = regexp_replace(title, '^(Junho|Julho|Agosto|Setembro|Outubro) · ', '')
  where title ~ '^(Junho|Julho|Agosto|Setembro|Outubro) · ';

-- 4. Remove a coleção antiga (só se ficou vazia)
delete from collections
  where slug = 'melhores-do-mes'
  and not exists (select 1 from ads where ads.collection_id = collections.id);

-- Conferir:
-- select c.title, count(a.id) from collections c left join ads a on a.collection_id = c.id group by c.title, c."order" order by c."order";
