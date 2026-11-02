-- Um anúncio pode aparecer em especiais além da coleção de origem
-- (ex.: mora em "Melhores de Outubro 2026" e aparece também na
-- "Especial Mini VSL"). Igual aos objetivos: etiqueta por slug.
-- Pode rodar mais de uma vez.

alter table ads add column if not exists extras text[] not null default '{}';
create index if not exists ads_extras_idx on ads using gin (extras);
