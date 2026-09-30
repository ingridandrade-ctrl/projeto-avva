-- ══════════════════════════════════════════════════════
-- SEED: Kit de Execução — Método AVVA
-- Rodar no SQL Editor do Supabase (uma vez só)
-- 10 ganchos + 6 estruturas narrativas + 6 ângulos c/ prompts
-- ══════════════════════════════════════════════════════

-- ─── GANCHOS (primeiros 3 segundos) ───

insert into kit_items (type, title, description, example, prompt) values
('gancho', 'Pergunta que ela já se faz',
 'Verbalize a pergunta que sua cliente faz pra si mesma. Reconhecimento imediato para o scroll.',
 'Por que seu anúncio gasta todo dia e não traz nenhuma venda?',
 'Escreva 5 ganchos de anúncio em formato de pergunta que [minha cliente ideal] já se faz sobre [problema que meu produto resolve]. Use a linguagem falada dela, sem jargão técnico.'),

('gancho', 'Afirmação contraintuitiva',
 'Diga o contrário do que todo mundo acredita. Gera tensão e curiosidade instantânea.',
 'Postar todo dia pode estar afundando o seu perfil.',
 'Escreva 5 ganchos contraintuitivos sobre [meu nicho]: frases que contrariam uma crença comum de [minha cliente ideal] e que eu consiga sustentar no restante do anúncio.'),

('gancho', 'Resultado específico',
 'Número + prazo + contexto. Especificidade gera credibilidade; número redondo gera desconfiança.',
 'R$ 12.847 em 30 dias com um único criativo — sem aparecer dançando.',
 'Escreva 5 ganchos usando este resultado real: [descreva o resultado com números]. Varie o formato: número primeiro, prazo primeiro, contexto primeiro.'),

('gancho', 'Identificação direta',
 'Chame sua cliente pelo "cargo" dela. Quem se reconhece, para. Quem não é, segue — e isso é bom.',
 'Se você tem um negócio local e ainda depende de indicação pra vender…',
 'Escreva 5 ganchos começando com "Se você..." para [minha cliente ideal], cada um tocando numa situação diferente do dia a dia dela com [problema].'),

('gancho', 'Confissão',
 'Vulnerabilidade real cria conexão. Comece pelo erro ou medo, termine na virada.',
 'Eu quase desisti dos anúncios. Até entender esse detalhe que ninguém explica.',
 'Escreva 3 ganchos em formato de confissão em primeira pessoa sobre [uma dificuldade real que eu ou minha cliente vivemos] relacionada a [tema do anúncio].'),

('gancho', 'Erro comum',
 'Apontar o erro que ela provavelmente está cometendo agora. Medo de estar errando prende atenção.',
 'O erro nº 1 de quem anuncia no Instagram e não vende (você provavelmente está cometendo).',
 'Liste os 5 erros mais comuns que [minha cliente ideal] comete em [área do meu produto] e transforme cada um em um gancho de anúncio de até 12 palavras.'),

('gancho', 'Antes e depois',
 'Contraste visual ou verbal entre a situação antiga e a nova. A transformação é o produto.',
 'Semana passada: agenda vazia. Hoje: lista de espera. O que mudou? Um anúncio.',
 'Escreva 5 ganchos de contraste antes/depois para [transformação que meu produto gera], em frases curtas de duas partes separadas por ponto.'),

('gancho', 'Curiosidade aberta',
 'Abra um loop que só fecha se ela continuar assistindo. Nunca entregue tudo no gancho.',
 'Ninguém te conta isso sobre os anúncios que mais vendem no Brasil.',
 'Escreva 5 ganchos de curiosidade aberta sobre [tema], sem clickbait vazio: a promessa precisa ser cumprida no corpo do anúncio.'),

('gancho', 'Prova social imediata',
 'Comece pelo resultado de uma cliente real. História de terceiro converte quem não confia em você ainda.',
 'Foi esse anúncio aqui que lotou a agenda da minha cliente em 9 dias.',
 'Tenho este caso real: [descreva o caso da cliente]. Escreva 3 ganchos que começam por esse resultado sem parecer propaganda exagerada.'),

('gancho', 'Comando de interrupção',
 'Ordem direta + qualificação de quem deve parar. Funciona muito em vídeo com texto na tela.',
 'Para de rolar. Isso é pra você que vende serviço e cobra barato demais.',
 'Escreva 5 ganchos de comando direto ("Para de rolar", "Salva isso", "Presta atenção") seguidos de uma qualificação específica de [minha cliente ideal].');

-- ─── ESTRUTURAS NARRATIVAS ───

insert into kit_items (type, title, description, example, prompt) values
('narrativa', 'PAS — Problema, Agitação, Solução',
 '1) Nomeie o problema exato. 2) Agite: mostre o custo de continuar assim. 3) Apresente a solução como o caminho natural. A mais versátil de todas — funciona em vídeo, carrossel e legenda.',
 'Problema: "Você posta, posta, e ninguém compra." → Agitação: "Enquanto isso, quem entende de anúncio fatura com metade do seu talento." → Solução: "O [produto] te mostra exatamente o que rodar. Clica e vem ver."',
 'Escreva um anúncio de até 40 segundos na estrutura PAS para [meu produto], falando com [minha cliente ideal] que sofre com [dor principal]. Tom conversacional, como um áudio de amiga.'),

('narrativa', 'AIDA — Atenção, Interesse, Desejo, Ação',
 '1) Gancho forte. 2) Interesse: desenvolva com fato ou história. 3) Desejo: pinte a transformação. 4) Ação: CTA único e específico. Ideal para VSL curta e carrossel.',
 'Atenção: "3 anúncios pagaram meu aluguel esse mês." → Interesse: "Nenhum deles tem produção cara." → Desejo: "Imagina acordar com venda feita." → Ação: "Toca no link e começa hoje."',
 'Escreva um carrossel de 6 slides na estrutura AIDA para vender [meu produto] para [minha cliente ideal]. Um slide por etapa, frases de no máximo 12 palavras por slide, CTA no último.'),

('narrativa', 'Jornada da cliente (storytelling de prova)',
 'Conte a história de uma cliente real: onde ela estava → o que tentou → o que mudou → onde está hoje. Prova social narrada converte público frio que não confia em promessa.',
 '"A Carol atendia 4 clientes por semana e tinha vergonha de cobrar. Tentou sorteio, tentou reels dancinha. Aí estruturou UM anúncio certo. Hoje: agenda fechada e sinal antecipado. O caminho que ela usou está no [produto]."',
 'Transforme este caso real em um roteiro de vídeo de 45 segundos: [descreva o caso]. Estrutura: situação inicial → tentativas frustradas → virada → resultado atual → CTA. Sem exagerar nada.'),

('narrativa', 'Confissão com virada',
 'Comece pelo erro/vergonha em primeira pessoa, mostre o ponto de virada e o aprendizado. Humaniza a marca e derruba a objeção "ela não sabe o que é estar no meu lugar".',
 '"Eu gastei R$ 800 em anúncio pra vender R$ 97. Quase aceitei que tráfego não era pra mim. O problema nunca foi a verba — era o criativo. Quando troquei o formato, o mesmo orçamento virou 23 vendas."',
 'Escreva um roteiro de vídeo em primeira pessoa na estrutura confissão → virada → aprendizado → CTA sobre [erro real que já cometi], conectando com [meu produto]. Tom vulnerável mas seguro.'),

('narrativa', 'Lista de valor',
 '"3 coisas que…" / "5 sinais de que…". Entrega valor real e posiciona autoridade. Roda como orgânico E como anúncio (dark post) — o formato nativo que mais segura retenção.',
 '"3 sinais de que o problema é o seu criativo (e não o algoritmo): 1. CTR abaixo de 1%. 2. As pessoas clicam e não compram. 3. Só vende quando você faz promoção. Se marcou 2, assiste até o final."',
 'Crie 5 ideias de anúncio em formato lista ("X coisas que...", "X sinais de que...") sobre [tema do meu produto] para [minha cliente ideal]. Para cada ideia, escreva o título e os itens da lista.'),

('narrativa', 'Demonstração na prática',
 'Mostre o produto/método funcionando em tempo real, sem enrolação. Para quem já te conhece, ver é acreditar. Excelente para remarketing.',
 '"Deixa eu te mostrar por dentro: isso aqui é uma coleção do acervo. Eu abro, escolho o anúncio pelo objetivo, leio a análise do porquê funciona e adapto pro meu nicho. Levou 4 minutos. Link na bio."',
 'Escreva um roteiro de vídeo de demonstração de [meu produto] em 30-45 segundos: o que mostrar na tela, o que narrar por cima e como fechar com CTA. Estilo "deixa eu te mostrar por dentro".');

-- ─── ÂNGULOS DE COPY + PROMPTS (por momento do funil) ───

insert into kit_items (type, title, description, moment, phrases, prompt) values
('angulo', 'Identificação e dor',
 'Para quem nunca te viu: o anúncio precisa falar da VIDA dela, não do seu produto. Toque na dor cotidiana com a linguagem exata que ela usa.',
 'topo',
 array[
   'Você não precisa de mais seguidores. Precisa de quem compra.',
   'Trabalhar o dia inteiro e terminar o mês no vermelho não é falta de esforço.',
   'O problema não é o seu preço. É quem está vendo a sua oferta.'
 ],
 'Liste as 10 dores mais específicas de [minha cliente ideal] em relação a [tema]. Para cada dor, escreva uma frase de anúncio curta que nomeie a dor sem oferecer nada ainda — só reconhecimento.'),

('angulo', 'Autoridade e método',
 'Para quem já te conhece: mostre que existe um MÉTODO por trás do resultado. Ensine algo pequeno e completo — quem ensina bem de graça, vende o avançado.',
 'meio',
 array[
   'Anúncio bom não é sorte. É estrutura: gancho, prova e oferta — nessa ordem.',
   'Eu não crio anúncio do zero. Eu adapto o que já está validado.',
   'Existe um motivo pros mesmos anúncios aparecerem pra você há meses: eles pagam a conta.'
 ],
 'Escreva 5 frases de anúncio que posicionem [minha marca] como autoridade em [tema], cada uma revelando um princípio do meu método sem entregar o passo a passo completo.'),

('angulo', 'Prova social',
 'Para quem está considerando: resultados de clientes parecidas com ela. Específico converte; genérico ("mudou minha vida") gera desconfiança.',
 'meio',
 array[
   '"Apliquei a estrutura da coleção 5 num anúncio de R$ 20/dia. Fechei 11 clientes." — aluna do Método AVVA',
   'De agenda vazia a lista de espera em 3 semanas. Mesmo nicho que o seu.',
   'Não fui eu que disse. Foram as 214 alunas que aplicaram.'
 ],
 'Tenho estes depoimentos: [cole os depoimentos]. Transforme cada um em uma frase de anúncio curta mantendo o número/resultado específico e o contexto de quem deu o depoimento.'),

('angulo', 'Quebra de objeção',
 'Para quem está quase comprando: nomeie a objeção exata e desmonte com lógica + prova. Uma objeção por anúncio.',
 'fundo',
 array[
   '"Mas eu não sei editar vídeo." Os anúncios que mais vendem do acervo foram feitos no celular.',
   '"Não tenho tempo de criar anúncio." Por isso você não vai criar — vai adaptar um pronto.',
   '"Já tentei tráfego e perdi dinheiro." Você não perdeu por anunciar. Perdeu por anunciar o criativo errado.'
 ],
 'Liste as 7 objeções mais fortes de [minha cliente ideal] antes de comprar [meu produto]. Para cada uma, escreva uma resposta de 2 frases: a primeira repete a objeção com empatia, a segunda desmonta com lógica ou prova.'),

('angulo', 'Oferta direta',
 'Para quem só precisa do empurrão: clareza total — o que é, pra quem é, quanto custa, o que ela recebe hoje. Urgência apenas se for real.',
 'fundo',
 array[
   'Acervo com anúncios validados, organizados por objetivo, por menos que um almoço. Acesso imediato.',
   'Você pode continuar adivinhando criativo. Ou pode abrir o acervo e copiar a estrutura do que já vende.',
   'Entra hoje, escolhe uma coleção, adapta um anúncio e coloca no ar ainda essa semana.'
 ],
 'Escreva 5 versões de copy de oferta direta para [meu produto: descreva o que é, preço e entregáveis]. Máximo 3 frases cada: o que é → o que ela ganha → CTA. Sem urgência falsa.'),

('angulo', 'Remarketing',
 'Para quem visitou e não comprou: lembre com leveza, responda a hesitação silenciosa e reabra a porta. Tom de conversa, nunca de cobrança.',
 'fundo',
 array[
   'Aquela aba que você deixou aberta? Era essa aqui.',
   'Você viu, pensou "depois eu vejo"… e o anúncio da sua concorrente foi pro ar primeiro.',
   'Ainda dá tempo de entrar com o valor de hoje.'
 ],
 'Escreva 5 anúncios curtos de remarketing para quem visitou a página de [meu produto] e não comprou. Tom leve e bem-humorado, sem pressão agressiva, cada um com um CTA diferente.');
