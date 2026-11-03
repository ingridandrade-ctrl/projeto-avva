-- Confere se todas as migrações do projeto foram rodadas neste banco.
-- Cole no SQL Editor do Supabase e rode. Sai uma lista: o que está OK e
-- o que FALTA, com o nome do arquivo que precisa rodar.
-- Não altera nada.

with checks (ordem, item, arquivo, ok) as (
  values
  -- tabelas
  (1,  'tabela users',                 'supabase-schema.sql',                 to_regclass('public.users') is not null),
  (2,  'tabela ads',                   'supabase-schema.sql',                 to_regclass('public.ads') is not null),
  (3,  'tabela kit_items',             'supabase-schema.sql',                 to_regclass('public.kit_items') is not null),
  (4,  'tabela user_favorites',        'supabase-schema.sql',                 to_regclass('public.user_favorites') is not null),
  (5,  'tabela user_progress',         'supabase-schema.sql',                 to_regclass('public.user_progress') is not null),
  (6,  'tabela aplicacoes (mentoria)', 'supabase-schema.sql',                 to_regclass('public.aplicacoes') is not null),
  (7,  'tabela collections',           'supabase-migration-colecoes.sql',     to_regclass('public.collections') is not null),
  (8,  'tabela cakto_events',          'supabase-migration-cakto.sql',        to_regclass('public.cakto_events') is not null),
  (9,  'tabela sugestoes (caixinha)',  'supabase-migration-sugestoes.sql',    to_regclass('public.sugestoes') is not null),

  -- colunas
  (10, 'ads.collection_id',            'supabase-migration-colecoes.sql',     exists (select 1 from information_schema.columns where table_schema='public' and table_name='ads' and column_name='collection_id')),
  (11, 'ads.niches',                   'supabase-migration-colecoes.sql',     exists (select 1 from information_schema.columns where table_schema='public' and table_name='ads' and column_name='niches')),
  (12, 'ads.objectives',               'supabase-migration-objetivos.sql',    exists (select 1 from information_schema.columns where table_schema='public' and table_name='ads' and column_name='objectives')),
  (13, 'ads.kind (anúncio ou página)', 'supabase-migration-paginas.sql',      exists (select 1 from information_schema.columns where table_schema='public' and table_name='ads' and column_name='kind')),
  (14, 'ads.page_type',                'supabase-migration-paginas.sql',      exists (select 1 from information_schema.columns where table_schema='public' and table_name='ads' and column_name='page_type')),
  (15, 'collections.cover_url',        'supabase-migration-capas.sql',        exists (select 1 from information_schema.columns where table_schema='public' and table_name='collections' and column_name='cover_url')),
  (16, 'collections.featured',         'supabase-migration-destaque.sql',     exists (select 1 from information_schema.columns where table_schema='public' and table_name='collections' and column_name='featured')),
  (31, 'ads.duration_seconds (duração do vídeo)', 'supabase-migration-duracao.sql', exists (select 1 from information_schema.columns where table_schema='public' and table_name='ads' and column_name='duration_seconds')),
  (30, 'ads.extras (também nas especiais)', 'supabase-migration-extras.sql', exists (select 1 from information_schema.columns where table_schema='public' and table_name='ads' and column_name='extras')),
  (29, 'collections.kind (tipo da coleção)', 'supabase-migration-tipos-colecao.sql', exists (select 1 from information_schema.columns where table_schema='public' and table_name='collections' and column_name='kind')),
  (17, 'users.cakto_order_id',         'supabase-migration-cakto.sql',        exists (select 1 from information_schema.columns where table_schema='public' and table_name='users' and column_name='cakto_order_id')),
  (18, 'users.access_blocked',         'supabase-migration-cakto.sql',        exists (select 1 from information_schema.columns where table_schema='public' and table_name='users' and column_name='access_blocked')),
  (19, 'users.avatar_url (foto)',      'supabase-migration-foto.sql',         exists (select 1 from information_schema.columns where table_schema='public' and table_name='users' and column_name='avatar_url')),

  -- coleções que precisam existir
  (20, 'coleções por objetivo (5)',    'supabase-migration-colecoes.sql',     (select count(*) from collections where slug in ('ser-descoberta','mostrar-que-voce-entende','provar-que-funciona','quebrar-o-mas','vender-agora')) = 5),
  (21, 'coleções dos meses',           'supabase-migration-meses.sql',        exists (select 1 from collections where slug like 'melhores-de-%')),
  (22, 'coleção Páginas',              'supabase-migration-paginas.sql',      exists (select 1 from collections where slug = 'paginas')),

  -- buckets de arquivos
  (23, 'bucket covers (capas)',        'supabase-migration-capas.sql',        exists (select 1 from storage.buckets where id = 'covers')),
  (24, 'bucket avatars (fotos)',       'supabase-migration-foto.sql',         exists (select 1 from storage.buckets where id = 'avatars')),

  -- permissões (RLS) que o app usa
  (25, 'policy: aluna envia sugestão', 'supabase-migration-sugestoes.sql',    exists (select 1 from pg_policies where tablename = 'sugestoes' and policyname = 'Aluna envia sugestão')),
  (26, 'policy: admin lê sugestões',   'supabase-migration-sugestoes.sql',    exists (select 1 from pg_policies where tablename = 'sugestoes' and policyname = 'Admin lê sugestões')),
  (27, 'policy: admin atualiza coleções', 'supabase-migration-capas.sql',     exists (select 1 from pg_policies where tablename = 'collections' and policyname = 'Admin atualiza coleções')),
  (28, 'policy: admin insere anúncios','supabase-schema.sql',                 exists (select 1 from pg_policies where tablename = 'ads' and policyname = 'Admin insere anúncios'))
)
select
  case when ok then 'OK' else 'FALTA' end as status,
  item,
  case when ok then '' else 'rodar ' || arquivo end as "o que fazer"
from checks
order by ok, ordem;
