-- ══════════════════════════════════════════════════════
-- ATUALIZAÇÃO: peças avulsas do Kit (10 ganchos, 6 narrativas, 6 ângulos)
--
-- Os exemplos e prompts das peças seguem as mesmas regras dos super prompts:
-- sem travessão, sem clichê de guru ("ninguém te conta", "o detalhe que",
-- "pare de rolar"), sem número inventado (o que é número vira [colchete]
-- pra aluna preencher), e o prompt pede fala corrida na voz dela, com a
-- ficha, nunca tabela.
--
-- O banco pode ter sido editado pelo admin. Por isso este arquivo NÃO roda
-- sozinho: primeiro veja o "antes" (bloco 1), depois rode os updates
-- (bloco 2) só nas linhas que você reconhece. Cada update acha a peça pelo
-- título; se um título foi mudado no admin, aquele update não acha nada e
-- não altera nada.
-- ══════════════════════════════════════════════════════

-- ─── 1. ANTES: o que está no banco hoje ───
-- select type, title, example, prompt, phrases from kit_items order by type, created_at;

-- ─── 2. DEPOIS: os updates ───

-- GANCHOS
update kit_items set
  description = 'Diga em voz alta a pergunta que a sua cliente já faz pra si mesma. Quem se reconhece, para.',
  example = 'Por que o meu anúncio gasta todo dia e não traz nenhuma venda',
  prompt = 'Com a minha ficha, escreva 5 primeiras frases de anúncio em formato de pergunta que a minha cliente já se faz sobre o problema que eu resolvo. Use as palavras dela que estão na ficha. Sem jargão, sem pergunta retórica genérica tipo "você já se perguntou". Cada frase até 12 palavras.'
where type = 'gancho' and title = 'Pergunta que ela já se faz';

update kit_items set
  description = 'Diga o contrário do que todo mundo acredita, e sustente no resto do anúncio.',
  example = 'Postar todo dia pode estar afundando o seu perfil',
  prompt = 'Com a minha ficha, escreva 5 primeiras frases de anúncio que contrariam uma crença comum da minha cliente sobre o problema que eu resolvo. Só frases que eu consigo sustentar com o que está na ficha. Sem "a verdade é que", sem "ninguém te conta". Até 12 palavras cada.'
where type = 'gancho' and title = 'Afirmação contraintuitiva';

update kit_items set
  description = 'Um resultado real, com prazo e contexto. Específico gera credibilidade; número solto gera desconfiança.',
  example = '[Resultado real] em [prazo] com um anúncio só, sem aparecer dançando',
  prompt = 'Com a prova real da minha ficha (quem, o que mudou, em quanto tempo), escreva 5 primeiras frases de anúncio que começam por ela. Varie a ordem: número primeiro, prazo primeiro, a pessoa primeiro. Não arredonde, não acrescente adjetivo, não invente o que não está na ficha.'
where type = 'gancho' and title = 'Resultado específico';

update kit_items set
  description = 'Chame a sua cliente pelo que ela é. Quem se reconhece, para. Quem não é, segue, e isso é bom.',
  example = 'Se você tem um salão e ainda depende de indicação pra encher a agenda',
  prompt = 'Com a minha ficha, escreva 5 primeiras frases de anúncio começando com "Se você", cada uma tocando numa situação diferente do dia a dia da minha cliente com o problema que eu resolvo. Use o detalhe de quem ela é (segmento, cargo, momento) que está na ficha. Até 12 palavras.'
where type = 'gancho' and title = 'Identificação direta';

update kit_items set
  description = 'Comece por um erro ou um medo seu, de verdade, e termine na virada.',
  example = 'Eu quase desisti de anunciar, até entender onde estava errando',
  prompt = 'Com a minha ficha, escreva 3 primeiras frases de anúncio em primeira pessoa, contando uma dificuldade real que eu vivi com o problema que hoje eu resolvo. Me pergunte qual foi a dificuldade antes de escrever, se a ficha não disser. Sem drama, sem "eu entendo você".'
where type = 'gancho' and title = 'Confissão';

update kit_items set
  description = 'Aponte o erro que ela provavelmente está cometendo agora, pelo nome.',
  example = 'O erro mais comum de quem anuncia no Instagram e não vende',
  prompt = 'Com a minha ficha, liste os 5 erros mais comuns que a minha cliente comete na área do meu produto e transforme cada um numa primeira frase de anúncio de até 12 palavras. Nomeie o erro, sem suavizar e sem ofender. Sem "pare de", sem "você está fazendo tudo errado".'
where type = 'gancho' and title = 'Erro comum';

update kit_items set
  description = 'Contraste entre a situação antiga e a nova. A transformação é o produto.',
  example = 'Mês passado: agenda vazia. Hoje: lista de espera',
  prompt = 'Com a transformação da minha ficha (o que muda pra ela) e a prova real, escreva 5 primeiras frases de anúncio em duas partes, antes e depois, separadas por ponto. Só com o que está na ficha. Se não houver prova real, use a situação da cliente antes e o que muda, sem número.'
where type = 'gancho' and title = 'Antes e depois';

update kit_items set
  description = 'Abra uma pergunta que só fecha se ela continuar assistindo. A promessa precisa ser cumprida no corpo.',
  example = 'Tem um motivo pro seu anúncio aparecer pra quem nunca vai comprar',
  prompt = 'Com a minha ficha, escreva 5 primeiras frases de anúncio que abrem uma curiosidade sobre o problema que eu resolvo, e que o resto do anúncio consegue responder com o que está na ficha. Sem "o segredo", sem "ninguém te conta", sem "você não vai acreditar".'
where type = 'gancho' and title = 'Curiosidade aberta';

update kit_items set
  description = 'Comece pelo resultado de uma cliente real. História de outra pessoa convence quem ainda não confia em você.',
  example = 'Foi esse anúncio que encheu a agenda da [nome da cliente] em [prazo]',
  prompt = 'Com o caso real da minha ficha (quem, o que mudou, em quanto tempo), escreva 3 primeiras frases de anúncio que começam por esse resultado, com o contexto de quem é a cliente. Sem adjetivo, sem exagero, sem número que não esteja na ficha.'
where type = 'gancho' and title = 'Prova social imediata';

update kit_items set
  description = 'Uma frase direta, dizendo pra quem é. Funciona em vídeo com o texto na tela.',
  example = 'Isso é pra você que vende serviço e cobra barato demais',
  prompt = 'Com a minha ficha, escreva 5 primeiras frases de anúncio que dizem pra quem é, de forma direta, usando o detalhe de quem é a minha cliente. Sem "para de rolar", sem "presta atenção", sem comando gritado. Até 12 palavras.'
where type = 'gancho' and title = 'Comando de interrupção';

-- NARRATIVAS
update kit_items set
  description = 'Nomeie o problema exato, mostre o custo de continuar assim e apresente a solução como o caminho natural. A mais versátil: vídeo, carrossel e legenda.',
  example = 'Problema: você posta, posta, e ninguém compra. O custo: enquanto isso, quem anuncia certo fecha com metade do seu talento. A solução: no [produto] você vê o que rodar e adapta pro seu. Clica e vem ver.',
  prompt = 'Com a minha ficha, escreva a fala de um anúncio de até 40 segundos na sequência problema, custo de continuar assim, solução. Fala corrida, como eu falaria num áudio pra uma cliente, nas palavras dela. Só depois me dê o gancho e corte em cenas. Sem travessão, sem exclamação, sem prova que não está na ficha.'
where type = 'narrativa' and title like 'PAS%';

update kit_items set
  description = 'Atenção com o gancho, interesse com um fato ou história, desejo com a transformação, ação com uma chamada só. Boa pra VSL curta e carrossel.',
  example = 'Atenção: [resultado real] com três anúncios. Interesse: nenhum deles tem produção cara. Desejo: acordar com a venda feita. Ação: toca no link e começa hoje.',
  prompt = 'Com a minha ficha, escreva um carrossel de 6 telas na sequência atenção, interesse, desejo, ação pra vender o meu produto pra minha cliente. Primeiro escreva o raciocínio corrido, como eu falaria; depois divida em telas, uma ideia por tela, até 12 palavras por tela, a chamada na última. Sem prova que não está na ficha.'
where type = 'narrativa' and title like 'AIDA%';

update kit_items set
  description = 'Conte a história de uma cliente real: onde ela estava, o que tentou, o que mudou, onde está hoje. Prova narrada convence quem não confia em promessa.',
  example = 'A [nome] atendia [número] clientes por semana e tinha vergonha de cobrar. Tentou sorteio, tentou dancinha. Aí montou um anúncio certo. Hoje tem agenda fechada e sinal antecipado. O caminho que ela usou está no [produto].',
  prompt = 'Com o caso real da minha ficha, escreva a fala de um vídeo de 45 segundos na sequência: onde ela estava, o que tentou, a virada, onde está hoje, chamada. Se faltar alguma parte do caso, me pergunte antes de escrever. Fala corrida, na minha voz, sem exagerar nada e sem número que não esteja na ficha.'
where type = 'narrativa' and title like 'Jornada da cliente%';

update kit_items set
  description = 'Comece pelo erro em primeira pessoa, mostre a virada e o que aprendeu. Humaniza e derruba o "ela não sabe o que é estar no meu lugar".',
  example = 'Eu gastei [valor] em anúncio pra vender [valor]. Quase aceitei que tráfego não era pra mim. O problema nunca foi a verba, era o criativo. Quando troquei o formato, o mesmo orçamento virou [resultado].',
  prompt = 'Me pergunte qual erro real eu cometi com o problema que hoje eu resolvo, e espere a resposta. Depois escreva a fala de um vídeo em primeira pessoa na sequência: o erro, a virada, o que eu aprendi, a chamada pro meu produto. Fala corrida, na minha voz. Sem drama, sem "eu entendo", sem número que eu não tenha dado.'
where type = 'narrativa' and title like 'Confissão com virada%';

update kit_items set
  description = '"3 coisas que", "5 sinais de que". Entrega valor de verdade e posiciona. Roda como orgânico e como anúncio.',
  example = '3 sinais de que o problema é o seu criativo, não o algoritmo. Um: a taxa de clique está baixa. Dois: as pessoas clicam e não compram. Três: só vende quando você faz promoção. Se marcou dois, assiste até o fim.',
  prompt = 'Com a minha ficha, crie 5 ideias de anúncio em formato de lista ("X coisas que", "X sinais de que") sobre o problema que eu resolvo. Pra cada ideia: a primeira frase e os itens, com algo que a minha cliente consiga aplicar mesmo sem comprar. Sem dica genérica que qualquer perfil publicaria.'
where type = 'narrativa' and title like 'Lista de valor%';

update kit_items set
  description = 'Mostre o produto ou o método funcionando, sem enrolação. Pra quem já te conhece, ver é acreditar. Boa pra remarketing.',
  example = 'Deixa eu te mostrar por dentro: isso aqui é uma coleção do acervo. Eu abro, escolho o anúncio pelo objetivo, leio por que funciona e adapto pro meu nicho. Levou quatro minutos. Link na bio.',
  prompt = 'Com a minha ficha, escreva a fala de um vídeo de demonstração do meu produto, de 30 a 45 segundos: o que eu mostro na tela e o que eu digo por cima, no estilo "deixa eu te mostrar por dentro". Me pergunte antes o que exatamente dá pra mostrar na tela. Fecha com uma chamada só.'
where type = 'narrativa' and title like 'Demonstração na prática%';

-- ÂNGULOS
update kit_items set
  description = 'Pra quem nunca te viu: fale da vida dela, não do seu produto. A dor do dia a dia, com as palavras que ela usa.',
  phrases = array[
    'Você não precisa de mais seguidores. Precisa de quem compra.',
    'Trabalhar o dia inteiro e terminar o mês no vermelho não é falta de esforço.',
    'O problema não é o seu preço. É quem está vendo a sua oferta.'
  ],
  prompt = 'Com a minha ficha, liste as 10 dores mais específicas da minha cliente em relação ao problema que eu resolvo, com as palavras dela. Pra cada dor, uma frase de anúncio curta que nomeia a dor sem oferecer nada ainda. Sem jargão, sem pergunta retórica.'
where type = 'angulo' and title = 'Identificação e dor';

update kit_items set
  description = 'Pra quem já te conhece: mostre que existe um método por trás do resultado. Quem ensina bem de graça vende o avançado.',
  phrases = array[
    'Anúncio bom não é sorte. É gancho, prova e oferta, nessa ordem.',
    'Eu não crio anúncio do zero. Eu adapto o que já está validado.',
    'Existe um motivo pros mesmos anúncios aparecerem pra você há meses: eles pagam a conta.'
  ],
  prompt = 'Com a minha ficha, escreva 5 frases de anúncio que mostram um princípio do meu jeito de trabalhar, cada uma revelando um critério real sem entregar o passo a passo inteiro. Me pergunte antes como eu faço, se a ficha não disser. Sem "somos referência", sem "especialista".'
where type = 'angulo' and title = 'Autoridade e método';

update kit_items set
  description = 'Pra quem está considerando: resultados de clientes parecidas com ela, com contexto. Específico convence; "mudou minha vida" gera desconfiança.',
  phrases = array[
    'A [nome], [segmento], aplicou a estrutura num anúncio de [valor] por dia e fechou [número] clientes.',
    'De agenda vazia a lista de espera em [prazo]. Mesmo nicho que o seu.',
    'Não fui eu que disse. Foram as [número] alunas que aplicaram.'
  ],
  prompt = 'Com os depoimentos e provas da minha ficha, transforme cada um numa frase de anúncio curta mantendo o número, o resultado e o contexto de quem deu o depoimento. Não arredonde, não acrescente adjetivo, não invente contexto que não está lá.'
where type = 'angulo' and title = 'Prova social';

update kit_items set
  description = 'Pra quem está quase comprando: nomeie a objeção exata e responda com fato e prova. Uma objeção por anúncio.',
  phrases = array[
    '"Não sei editar vídeo." Os anúncios que mais vendem do acervo foram feitos no celular.',
    '"Não tenho tempo de criar anúncio." Por isso você não vai criar. Vai adaptar um pronto.',
    '"Já tentei tráfego e perdi dinheiro." Você não perdeu por anunciar. Perdeu por anunciar o criativo errado.'
  ],
  prompt = 'Com a minha ficha, liste as objeções que a minha cliente tem antes de comprar o meu produto (as da ficha primeiro). Pra cada uma, duas frases: a primeira repete a objeção com as palavras dela, a segunda responde com um fato ou uma prova da ficha. Sem "faz sentido pensar assim", sem "eu entendo".'
where type = 'angulo' and title = 'Quebra de objeção';

update kit_items set
  description = 'Pra quem só precisa do empurrão: o que é, pra quem, quanto custa, o que ela recebe hoje. Urgência só se for real.',
  phrases = array[
    'Acervo com anúncios validados, organizados por objetivo, por menos que um almoço. Acesso imediato.',
    'Você pode continuar adivinhando criativo. Ou pode abrir o acervo e seguir a estrutura do que já vende.',
    'Entra hoje, escolhe uma coleção, adapta um anúncio e coloca no ar ainda essa semana.'
  ],
  prompt = 'Com a oferta, o preço e o que está incluído na minha ficha, escreva 5 versões de copy de oferta direta, até 3 frases cada: o que é, o que ela ganha, a chamada com verbo e destino. Sem urgência que não esteja na ficha, sem "transforme sua vida", sem exclamação.'
where type = 'angulo' and title = 'Oferta direta';

update kit_items set
  description = 'Pra quem visitou e não comprou: lembre com leveza, responda a hesitação e reabra a porta. Conversa, nunca cobrança.',
  phrases = array[
    'Aquela aba que você deixou aberta era essa aqui.',
    'Você viu, pensou em deixar pra depois, e o anúncio da sua concorrente foi pro ar primeiro.',
    'Ainda dá tempo de entrar com o valor de hoje.'
  ],
  prompt = 'Com a minha ficha, escreva 5 anúncios curtos de remarketing pra quem visitou a página do meu produto e não comprou. Tom de quem retoma uma conversa, sem culpa e sem pressão, cada um com uma chamada diferente. Condição ou prazo só se estiver na ficha.'
where type = 'angulo' and title = 'Remarketing';

-- ─── 3. CONFERIR: o que ficou ───
-- select type, title, example, prompt, phrases from kit_items order by type, created_at;
