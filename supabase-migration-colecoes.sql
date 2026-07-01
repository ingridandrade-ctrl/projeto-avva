-- ══════════════════════════════════════════════════════
-- MIGRAÇÃO: Acervo de Anúncios — Coleções
-- Rodar no SQL Editor do Supabase (uma vez só)
-- ══════════════════════════════════════════════════════

-- 1. Tabela de Coleções (fixas, por objetivo do anúncio)
create table collections (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  title text not null,
  subtitle text,
  "order" int not null,
  is_bonus boolean default false
);

alter table collections enable row level security;

create policy "Coleções visíveis para autenticados"
  on collections for select
  to authenticated
  using (true);

insert into collections (slug, title, subtitle, "order", is_bonus) values
  ('ser-descoberta', 'Ser descoberta', 'Atrair seguidores', 1, false),
  ('mostrar-que-voce-entende', 'Mostrar que você entende', 'Gerar autoridade', 2, false),
  ('provar-que-funciona', 'Provar que funciona', 'Prova social', 3, false),
  ('quebrar-o-mas', 'Quebrar o "mas..."', 'Quebra de objeção', 4, false),
  ('vender-agora', 'Vender agora', 'Oferta direta e remarketing', 5, false),
  ('datas-especiais', 'Datas especiais', 'Black Friday, Dia das Mães, aniversário...', 6, true);

-- 2. Anúncios: coleção + nichos (tags múltiplas)
alter table ads add column collection_id uuid references collections;
alter table ads add column niches text[] default '{}';

-- 3. Remover campos antigos (formato, momento, subnicho)
alter table ads drop column if exists subniche;
alter table ads drop column if exists format;
alter table ads drop column if exists moment;

-- 4. Tipo de mídia: adicionar carrossel
alter table ads drop constraint if exists ads_media_type_check;
alter table ads add constraint ads_media_type_check
  check (media_type in ('video', 'image', 'carousel'));

-- 5. module_id vira opcional (navegação agora é por coleção)
alter table ads alter column module_id drop not null;

-- 6. Índices novos
create index idx_ads_collection on ads (collection_id);
create index idx_ads_niches on ads using gin (niches);

-- Índices antigos que não existem mais (ignore erros se já removidos)
drop index if exists idx_ads_moment;
drop index if exists idx_ads_format;
drop index if exists idx_ads_subniche;
