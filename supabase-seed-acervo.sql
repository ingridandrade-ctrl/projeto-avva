-- ══════════════════════════════════════════════════════
-- SEED: Acervo de Anúncios — Melhores do mês + Especial Black
-- Gerado a partir da pasta do Drive da Flora
-- Rodar no SQL Editor do Supabase (uma vez só)
-- ══════════════════════════════════════════════════════

-- 1. Novas coleções
insert into collections (slug, title, subtitle, "order", is_bonus) values
  ('melhores-do-mes', 'Melhores do mês', 'Os anúncios que mais se destacaram, mês a mês', 7, false),
  ('especial-black', 'Especial Black', 'Black Friday: páginas e criativos que venderam', 8, false)
on conflict (slug) do nothing;

-- 2. Tipo de mídia: aceitar PDF (páginas de venda)
alter table ads drop constraint if exists ads_media_type_check;
alter table ads add constraint ads_media_type_check
  check (media_type in ('video', 'image', 'carousel', 'pdf'));

-- 3. Anúncios (70)
insert into ads (collection_id, title, media_type, drive_url, niches, analysis, active) values
  ((select id from collections where slug = 'especial-black'), 'Página de Black Friday · LBA', 'pdf', 'https://drive.google.com/file/d/1XT8urnu9JP1VnmrlJo4yrBjAV4m0QVEe/view', array['infoproduto'], NULL, true),
  ((select id from collections where slug = 'especial-black'), 'Página de Black Friday · Willian Baldan', 'pdf', 'https://drive.google.com/file/d/1XwvH1bxVHXp63MRkpWGkUr1qMe_BYy36/view', array['infoproduto'], NULL, true),
  ((select id from collections where slug = 'especial-black'), 'Criativo de Black Friday 1', 'image', 'https://drive.google.com/file/d/1FCoffo2CEFE6LwiyDbsQLIkjgLzLvoML/view', '{}', NULL, true),
  ((select id from collections where slug = 'especial-black'), 'Criativo de Black Friday 2', 'image', 'https://drive.google.com/file/d/14L3LJgL8igKrxFUYkOIfwlR5_ZruXQ64/view', '{}', NULL, true),
  ((select id from collections where slug = 'especial-black'), 'Criativo de Black Friday 3', 'image', 'https://drive.google.com/file/d/1VB-_zWGMI13bN6mHgQOkbrMkhDepavVk/view', '{}', NULL, true),
  ((select id from collections where slug = 'especial-black'), 'Criativo de Black Friday 4', 'image', 'https://drive.google.com/file/d/1U53YPaoLWupUeybj-FSH2nh6MydXfaoz/view', '{}', NULL, true),
  ((select id from collections where slug = 'melhores-do-mes'), 'Outubro · Willian Baldan — criativo 1', 'video', 'https://drive.google.com/file/d/1Pv2qVipE5pb_JGVEeX910l68PMiSE680/view', array['infoproduto'], NULL, true),
  ((select id from collections where slug = 'melhores-do-mes'), 'Outubro · Willian Baldan — criativo 2', 'video', 'https://drive.google.com/file/d/1835b611PU-tarNkSGlLNMhGsWlEssK6n/view', array['infoproduto'], NULL, true),
  ((select id from collections where slug = 'melhores-do-mes'), 'Outubro · Willian Baldan — criativo 3', 'video', 'https://drive.google.com/file/d/1pG-A4LYInRRVF-Efi4B5CsoGAPn_1W3k/view', array['infoproduto'], NULL, true),
  ((select id from collections where slug = 'melhores-do-mes'), 'Outubro · Iago Santiago', 'video', 'https://drive.google.com/file/d/1mxHxVD002q_AQ_3I7zyo23sHF1XnfAUT/view', '{}', NULL, true),
  ((select id from collections where slug = 'melhores-do-mes'), 'Outubro · Imatize — criativo 1', 'video', 'https://drive.google.com/file/d/1ylEClm7dtBaUUT_CRUN3mfI5IOiV6647/view', '{}', NULL, true),
  ((select id from collections where slug = 'melhores-do-mes'), 'Outubro · Imatize — criativo 2', 'video', 'https://drive.google.com/file/d/1hdKlkLuFc5HWdBlXz1S03Uv1Cr395No5/view', '{}', NULL, true),
  ((select id from collections where slug = 'melhores-do-mes'), 'Outubro · Priscila Zillo', 'video', 'https://drive.google.com/file/d/1LYpfgdpCimWoXG7lbw1nlQeIf3tBoCyi/view', '{}', NULL, true),
  ((select id from collections where slug = 'melhores-do-mes'), 'Outubro · "De quem é a responsabilidade"', 'video', 'https://drive.google.com/file/d/1pe1FTx1xgLi710shK0b-FtpgjbC-EX3o/view', '{}', NULL, true),
  ((select id from collections where slug = 'melhores-do-mes'), 'Setembro · Gabi Melo', 'video', 'https://drive.google.com/file/d/1xs06y20a89bUyF7X1MmxdcSOBxXREwer/view', '{}', NULL, true),
  ((select id from collections where slug = 'melhores-do-mes'), 'Setembro · Diandra', 'video', 'https://drive.google.com/file/d/18USYqZIvfmPj5PC11trkP1sG-EqRc_yL/view', '{}', NULL, true),
  ((select id from collections where slug = 'melhores-do-mes'), 'Setembro · Biblioteca de Anúncios — 1', 'video', 'https://drive.google.com/file/d/1yF4sxuqycIEzvS-2GF5MS69bUjnN9ZXV/view', '{}', NULL, true),
  ((select id from collections where slug = 'melhores-do-mes'), 'Setembro · Biblioteca de Anúncios — 2', 'video', 'https://drive.google.com/file/d/182KEOgZlHY_F5Amf4utJQ3NJtuD3In57/view', '{}', NULL, true),
  ((select id from collections where slug = 'melhores-do-mes'), 'Setembro · Biblioteca de Anúncios — 3', 'video', 'https://drive.google.com/file/d/1HenPiROwtY10lwrtS5OtzxYk8cVieCGV/view', '{}', NULL, true),
  ((select id from collections where slug = 'melhores-do-mes'), 'Setembro · Biblioteca de Anúncios — 4', 'video', 'https://drive.google.com/file/d/1HsDxGBIrHzAR_Gm0paxdEmnxZKn7dVo5/view', '{}', NULL, true),
  ((select id from collections where slug = 'melhores-do-mes'), 'Setembro · Biblioteca de Anúncios — 5', 'video', 'https://drive.google.com/file/d/1vVEGQp6ajN4HJ_0P9Ue36ehqq7dcpS1J/view', '{}', NULL, true),
  ((select id from collections where slug = 'melhores-do-mes'), 'Setembro · Anúncio estático 1', 'image', 'https://drive.google.com/file/d/1PbMceAgGHcaTzFjla_W7xQrEOTUK90kK/view', '{}', NULL, true),
  ((select id from collections where slug = 'melhores-do-mes'), 'Setembro · Anúncio estático 2', 'image', 'https://drive.google.com/file/d/16XJpgkpPqwLjO15neAFOhHQLugMadOEB/view', '{}', NULL, true),
  ((select id from collections where slug = 'melhores-do-mes'), 'Setembro · Anúncio estático 3', 'image', 'https://drive.google.com/file/d/1yi2kRSu8JXq43klVbOnyjFDxkXULg6tj/view', '{}', NULL, true),
  ((select id from collections where slug = 'melhores-do-mes'), 'Setembro · ManyChat', 'video', 'https://drive.google.com/file/d/1icbLM0qA5mx7zbuABTibK3kwWsJnGanc/view', '{}', NULL, true),
  ((select id from collections where slug = 'melhores-do-mes'), 'Setembro · Thaize Tavares — destaque', 'video', 'https://drive.google.com/file/d/1u_LDzs3cx3suln2I7MoikhNrKzj8dJhx/view', '{}', NULL, true),
  ((select id from collections where slug = 'melhores-do-mes'), 'Setembro · Thaize Tavares — criativo 2', 'video', 'https://drive.google.com/file/d/1zxIPkqinah2239FhA7hdWQCKj88eLFB_/view', '{}', NULL, true),
  ((select id from collections where slug = 'melhores-do-mes'), 'Setembro · Thaize Tavares — criativo 3', 'video', 'https://drive.google.com/file/d/1yISPR8tkadzBEM24W_UamtTUGiWNzfYN/view', '{}', NULL, true),
  ((select id from collections where slug = 'melhores-do-mes'), 'Setembro · Thaize Tavares — criativo 4', 'video', 'https://drive.google.com/file/d/1OiUw2UaC2EjzjUzq-tRxGBE0a5QxPiaP/view', '{}', NULL, true),
  ((select id from collections where slug = 'melhores-do-mes'), 'Setembro · Thaize Tavares — criativo 5', 'video', 'https://drive.google.com/file/d/1_Sc9ZuUFPMu-OWvxcTF6I4miolyoTwDi/view', '{}', NULL, true),
  ((select id from collections where slug = 'melhores-do-mes'), 'Setembro · Thaize Tavares — criativo 6', 'video', 'https://drive.google.com/file/d/1NlYBE1IVFZJ3O_Sd4eS72dkysfTAgKxV/view', '{}', NULL, true),
  ((select id from collections where slug = 'melhores-do-mes'), 'Agosto · Remarketing Sobral', 'video', 'https://drive.google.com/file/d/1xaLqxiLvk0Qxrh_QhyK0VCuC3eN1c-to/view', '{}', NULL, true),
  ((select id from collections where slug = 'melhores-do-mes'), 'Agosto · Leandro Ferrari', 'image', 'https://drive.google.com/file/d/1Tjga-rKKqox0FhgmIB3pyzsRWtipWt2V/view', '{}', NULL, true),
  ((select id from collections where slug = 'melhores-do-mes'), 'Agosto · Ciclo', 'image', 'https://drive.google.com/file/d/1LtyfW13hPuFJZbGEIFnfFdofT47qjC0M/view', '{}', NULL, true),
  ((select id from collections where slug = 'melhores-do-mes'), 'Agosto · The Sims caos', 'video', 'https://drive.google.com/file/d/13BNJnQDlXVfJprj4RyTbonZH7YRVvpJR/view', '{}', NULL, true),
  ((select id from collections where slug = 'melhores-do-mes'), 'Agosto · Anúncio estático 1', 'image', 'https://drive.google.com/file/d/1_N96o46TeKGDO9npxoUsK80aG1UlHsbJ/view', '{}', NULL, true),
  ((select id from collections where slug = 'melhores-do-mes'), 'Agosto · Anúncio estático 2', 'image', 'https://drive.google.com/file/d/14R5NiJIwewxI1O9e-ggf6nWb750x--km/view', '{}', NULL, true),
  ((select id from collections where slug = 'melhores-do-mes'), 'Agosto · Anúncio estático 3', 'image', 'https://drive.google.com/file/d/1185QBoAo3C4ar2Bxt1gLGIR7k1L0kjjo/view', '{}', NULL, true),
  ((select id from collections where slug = 'melhores-do-mes'), 'Agosto · Anúncio estático 4', 'image', 'https://drive.google.com/file/d/1YNIiyjKhT8lfRpkQZ7kfTIhm5fZs9XCT/view', '{}', NULL, true),
  ((select id from collections where slug = 'melhores-do-mes'), 'Agosto · Anúncio estático 5', 'image', 'https://drive.google.com/file/d/17Rs4pmbTiAh89l67jm_wSV4bpRKJejrf/view', '{}', NULL, true),
  ((select id from collections where slug = 'melhores-do-mes'), 'Agosto · Anúncio estático 6', 'image', 'https://drive.google.com/file/d/1jKCS6uSadZdFbz1JvgoHuvy38dvskVKN/view', '{}', NULL, true),
  ((select id from collections where slug = 'melhores-do-mes'), 'Agosto · Anúncio estático 7', 'image', 'https://drive.google.com/file/d/1leqW2S-DCQA1bc95P9fgXdI-ZoUWRxNf/view', '{}', NULL, true),
  ((select id from collections where slug = 'melhores-do-mes'), 'Agosto · Anúncio estático 8', 'image', 'https://drive.google.com/file/d/1r-E432aTIkRO-ra6PwO9YfNgrjiOLFeZ/view', '{}', NULL, true),
  ((select id from collections where slug = 'melhores-do-mes'), 'Agosto · Julia Pretti — criativo 1', 'video', 'https://drive.google.com/file/d/1e7XGtvoSgU8W3YPzCjc8AsUEMA868puT/view', '{}', NULL, true),
  ((select id from collections where slug = 'melhores-do-mes'), 'Agosto · Julia Pretti — criativo 2', 'video', 'https://drive.google.com/file/d/1dTPDOXNUkIBOhm-tZGFwadJDSdFUNlEx/view', '{}', NULL, true),
  ((select id from collections where slug = 'melhores-do-mes'), 'Agosto · Julia Pretti — criativo 3', 'video', 'https://drive.google.com/file/d/1h0Cve0eWJ4GFu0wKbc0E2aS4Wqb0vuQ8/view', '{}', NULL, true),
  ((select id from collections where slug = 'melhores-do-mes'), 'Julho · Marina Ulhôa', 'video', 'https://drive.google.com/file/d/1y65rWuptJ6AoGCdEtQUTFqDrOULxrOPm/view', '{}', 'Entra pelo formato: simples e ótimo para quem tem dificuldade de gravar olhando para a câmera. Chama atenção porque a pessoa consegue ler tudo que está acontecendo na tela enquanto ela fala — prende de um jeito diferente.', true),
  ((select id from collections where slug = 'melhores-do-mes'), 'Julho · FYHE', 'video', 'https://drive.google.com/file/d/1wXEztIDEuLu3sX6YQ6uH2K5GzgfiD3m_/view', '{}', NULL, true),
  ((select id from collections where slug = 'melhores-do-mes'), 'Julho · Michel Queiroz', 'video', 'https://drive.google.com/file/d/15j1yRp-lQvKsnerbfj5KkXw8agsDhA2U/view', array['infoproduto'], 'Formato diferente: ele mostra o print e abre uma curiosidade ("quais são esses tipos de pessoas?") que te faz querer saber. Vídeo fácil de fazer, sem muita edição, que prende — e enquanto prende, ele explica o método dele para resolver aquela dor.', true),
  ((select id from collections where slug = 'melhores-do-mes'), 'Julho · Hanah Franklin', 'video', 'https://drive.google.com/file/d/1awa190gaUxG6VYoY_itK0Ou42vdnPYmK/view', array['infoproduto'], 'Te prende num desafio e quebra todas as objeções: traz prova social de terceiros e dela mesma, bate no inimigo em comum e faz um conteúdo denso, com boa narrativa, do começo ao fim. Ela pesquisou a maior dor da audiência do Instagram e argumentou completamente em cima disso.', true),
  ((select id from collections where slug = 'melhores-do-mes'), 'Julho · Letícia Vaz Store — criativo 1', 'video', 'https://drive.google.com/file/d/1BSsRMSv2EyuAF_2vtr7vArw_2-8vtY_Z/view', array['ecommerce'], 'Ela te prende num desafio, te ensina a vender e te converte em um minuto e meio. Dá vários exemplos mostrando a calça e falando as qualidades enquanto você fica curiosa para ver todas as formas de vendê-la. Deu uma aula de marketing enquanto fazia uma venda.', true),
  ((select id from collections where slug = 'melhores-do-mes'), 'Julho · Letícia Vaz Store — criativo 2', 'video', 'https://drive.google.com/file/d/1yifqRSz8DP8X9EDFIZrzyqjz2qIP0Bx3/view', array['ecommerce'], 'Mesma lógica do criativo 1: desafio que prende, produto demonstrado na prática e venda acontecendo enquanto ela ensina.', true),
  ((select id from collections where slug = 'melhores-do-mes'), 'Julho · Conteudalista', 'video', 'https://drive.google.com/file/d/12ukQ2n6Li62KRElIa6YG6JySy_iVpT8_/view', '{}', NULL, true),
  ((select id from collections where slug = 'melhores-do-mes'), 'Julho · Adobe', 'video', 'https://drive.google.com/file/d/1OY6CpHub8Na-op98hDlaFZ7YKZGgLR-A/view', '{}', NULL, true),
  ((select id from collections where slug = 'melhores-do-mes'), 'Julho · Antisocial Media', 'image', 'https://drive.google.com/file/d/1F5GM21YzjKJc1hAe4txRgO43nPT1iuTw/view', '{}', NULL, true),
  ((select id from collections where slug = 'melhores-do-mes'), 'Junho · Bontalvão', 'video', 'https://drive.google.com/file/d/1J8b7JCWPun2zMcGCMZCqj9NusenZG0Bn/view', '{}', NULL, true),
  ((select id from collections where slug = 'melhores-do-mes'), 'Junho · "Anti-pitch"', 'video', 'https://drive.google.com/file/d/1AIESvAt1M4_P2sF3i1kIY_9w5Q4QvZGL/view', '{}', NULL, true),
  ((select id from collections where slug = 'melhores-do-mes'), 'Junho · Anúncio estático', 'image', 'https://drive.google.com/file/d/1IwyHQ0u0dyx34t34iXvj8bOdQSbpn8B_/view', '{}', NULL, true),
  ((select id from collections where slug = 'melhores-do-mes'), 'Junho · Lançamento pago — 1', 'image', 'https://drive.google.com/file/d/1Os7swe7C_J4F-UJ2Cnqj8xaK4-ugaL9Y/view', array['infoproduto'], NULL, true),
  ((select id from collections where slug = 'melhores-do-mes'), 'Junho · Lançamento pago — 2', 'image', 'https://drive.google.com/file/d/1CULTPnfg4QiZj_dif0I6yzEs0Tk3AZAc/view', array['infoproduto'], NULL, true),
  ((select id from collections where slug = 'melhores-do-mes'), 'Junho · Mensagem de WhatsApp', 'image', 'https://drive.google.com/file/d/1MIrJjtSpGfuzlNBp0b6O45FkEvLiLh8Y/view', '{}', NULL, true),
  ((select id from collections where slug = 'melhores-do-mes'), 'Junho · Formato notícia de jornal', 'image', 'https://drive.google.com/file/d/1YVOf5UpOqiGOzmGEQtjQNQySdqLPMz88/view', '{}', NULL, true),
  ((select id from collections where slug = 'melhores-do-mes'), 'Junho · Checklist', 'video', 'https://drive.google.com/file/d/1WD4ZKmhuAEhyuAAa7L-0CogOryFf5iS3/view', '{}', NULL, true),
  ((select id from collections where slug = 'melhores-do-mes'), 'Junho · Gabi Melo — prova social', 'video', 'https://drive.google.com/file/d/1y2q3Hg6XgQuNT4bX3aRHVQXZpSSPJ2LP/view', '{}', 'Selecionado como exemplo de prova social.', true),
  ((select id from collections where slug = 'melhores-do-mes'), 'Junho · Millena Nóbrega — objeção de preço', 'video', 'https://drive.google.com/file/d/1RduRn2r3wFeEcs3Ae2bE4Jc_qaGIB0Hb/view', array['infoproduto'], 'Selecionado como exemplo de quebra de objeção de preço.', true),
  ((select id from collections where slug = 'melhores-do-mes'), 'Junho · Curso por dentro — objeção de tempo', 'video', 'https://drive.google.com/file/d/1oTAGZ4k0ZxVn3z1w3xELQ41kIdg_cpbW/view', array['infoproduto'], 'Selecionado como exemplo de quebra de objeção de tempo/duração: mostra o curso por dentro.', true),
  ((select id from collections where slug = 'melhores-do-mes'), 'Junho · Millena Nóbrega — captura dupla 1', 'video', 'https://drive.google.com/file/d/1UhehGh_Yn1r29IIRapYOahmrEB6jkIaH/view', array['infoproduto'], 'Selecionado como exemplo do formato de captura dupla.', true),
  ((select id from collections where slug = 'melhores-do-mes'), 'Junho · Millena Nóbrega — captura dupla 2', 'video', 'https://drive.google.com/file/d/1Tr4nx-h2RD-cAcoF2-AhuQMiHjELP8kt/view', array['infoproduto'], 'Selecionado como exemplo do formato de captura dupla.', true),
  ((select id from collections where slug = 'melhores-do-mes'), 'Junho · Gui Serraglio — storytelling', 'video', 'https://drive.google.com/file/d/1yqH8RM6oefCLWh8iNXLDn4pryyJlwfkL/view', '{}', 'Selecionado como exemplo de storytelling.', true),
  ((select id from collections where slug = 'melhores-do-mes'), 'Junho · Rodrigo Vinhas — storytelling', 'video', 'https://drive.google.com/file/d/1duOi4UhC4nXAwNNluMbJVocShW8MwfUf/view', '{}', 'Selecionado como exemplo de storytelling.', true);

-- Conferir: select count(*) from ads;
