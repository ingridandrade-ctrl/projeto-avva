-- Páginas dentro do Acervo: um segundo tipo de item (kind = 'pagina'), com
-- classificação própria (page_type) em vez dos objetivos dos anúncios.
-- Rodar no SQL Editor do Supabase. Pode rodar mais de uma vez.

alter table ads add column if not exists kind text not null default 'anuncio';
alter table ads drop constraint if exists ads_kind_check;
alter table ads add constraint ads_kind_check check (kind in ('anuncio', 'pagina'));

alter table ads add column if not exists page_type text;
alter table ads drop constraint if exists ads_page_type_check;
alter table ads add constraint ads_page_type_check
  check (page_type is null or page_type in ('vendas', 'captura', 'obrigado', 'servico'));

create index if not exists ads_kind_idx on ads (kind);

-- A coleção única das páginas (fica num bloco próprio na página do Acervo)
insert into collections (slug, title, subtitle, "order", is_bonus)
values ('paginas', 'Páginas', 'Páginas de vendas, captura, obrigado e serviço, com a análise do que faz cada uma converter', 40, false)
on conflict (slug) do nothing;
