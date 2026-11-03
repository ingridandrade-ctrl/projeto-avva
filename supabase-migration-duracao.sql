-- Duração do anúncio em vídeo, em segundos. O "Fazer a minha versão" pede a
-- mesma duração do original; sem o campo, usa uma faixa pela coleção.
-- Pode rodar mais de uma vez.

alter table ads add column if not exists duration_seconds integer;
