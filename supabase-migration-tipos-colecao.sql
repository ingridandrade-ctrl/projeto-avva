-- Tipo de cada coleção (kind), pra criar coleções por objetivo e especiais
-- pelo admin, sem depender do código. Pode rodar mais de uma vez.
--
--   objetivo  = coleção por objetivo (o anúncio entra pela tag "Objetivos")
--   mes       = Melhores do mês (coleção de origem)
--   especial  = especial (coleção de origem), ex.: Especial Black
--   paginas   = a coleção única das páginas

alter table collections add column if not exists kind text;
alter table collections drop constraint if exists collections_kind_check;
alter table collections add constraint collections_kind_check
  check (kind is null or kind in ('objetivo', 'mes', 'especial', 'paginas'));

update collections set kind = 'objetivo'
  where kind is null and slug in ('ser-descoberta', 'mostrar-que-voce-entende', 'provar-que-funciona', 'quebrar-o-mas', 'vender-agora');
update collections set kind = 'mes'      where kind is null and slug like 'melhores-%';
update collections set kind = 'paginas'  where kind is null and slug = 'paginas';
update collections set kind = 'especial' where kind is null;
