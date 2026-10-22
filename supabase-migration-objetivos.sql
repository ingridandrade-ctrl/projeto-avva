-- ══════════════════════════════════════════════════════
-- MIGRAÇÃO: objetivos por anúncio (vários por anúncio)
-- O anúncio continua na coleção de origem (mês/especial) e aparece
-- também em cada "coleção por objetivo" marcada.
-- Rodar no SQL Editor do Supabase (uma vez só)
-- ══════════════════════════════════════════════════════

-- 1. Coluna de tags
alter table ads add column if not exists objectives text[] not null default '{}';
create index if not exists ads_objectives_idx on ads using gin (objectives);

-- 2. Classificação inicial (sugestão pelo título/análise — ajuste no admin)
-- Valores: ser-descoberta, mostrar-que-voce-entende, provar-que-funciona,
--          quebrar-o-mas, vender-agora, datas-especiais

-- Black Friday → Datas especiais + Vender agora
update ads set objectives = array['datas-especiais','vender-agora']
  where objectives = '{}' and (title ilike '%black%' or title ilike '%timing da black%');

-- Prova social / prova como argumento
update ads set objectives = array['provar-que-funciona']
  where objectives = '{}' and (title ilike '%prova%' or title ilike '%como sei que%');

-- Quebra de objeção
update ads set objectives = array['quebrar-o-mas']
  where objectives = '{}' and (
    title ilike '%objeção%' or title ilike '%pare de ignorar%' or title ilike '%continue ignorando%'
    or title ilike '%não é tão difícil%' or title ilike '%hanah franklin%'
  );

-- Oferta direta, remarketing, lançamento, lembrete
update ads set objectives = array['vender-agora']
  where objectives = '{}' and (
    title ilike '%remarketing%' or title ilike '%lançamento pago%' or title ilike '%r$%'
    or title ilike '%whatsapp%' or title ilike '%lembrete%' or title ilike '%captura dupla%'
    or title ilike '%anti-pitch%' or title ilike '%programação%' or title ilike '%letícia vaz%'
  );

-- Autoridade: storytelling, bastidores, UGC, método
update ads set objectives = array['mostrar-que-voce-entende']
  where objectives = '{}' and (
    title ilike '%storytelling%' or title ilike '%bastidores%' or title ilike '%pega de surpresa%'
    or title ilike '%ugc%' or title ilike '%old way%' or title ilike '%same problem%'
    or title ilike '%checklist%' or title ilike '%stories que vendem%' or title ilike '%michel queiroz%'
  );

-- Ser descoberta: formatos de atenção (meme, notícia, estático criativo)
update ads set objectives = array['ser-descoberta']
  where objectives = '{}' and (
    title ilike '%meme%' or title ilike '%the sims%' or title ilike '%notícia%'
    or title ilike '%antisocial%' or title ilike '%ódio%' or title ilike '%anúncio estático%'
    or title ilike '%marina ulhôa%' or title ilike '%conteudalista%'
  );

-- Os demais (ex.: "Fulano — criativo 2") ficam sem objetivo até alguém marcar no admin.
-- Conferir:
-- select title, objectives from ads order by created_at;
