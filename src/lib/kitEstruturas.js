// Kit de Execução: as 6 estruturas de anúncio (uma por coleção por objetivo
// do Acervo), cada uma com o super prompt. Conteúdo fixo, editado aqui.
//
// Os super prompts seguem a mesma ordem de trabalho do "Fazer a minha
// versão": checar o material da ficha, escrever a fala corrida na voz da
// aluna, escrever o gancho por último e só então cortar em cenas. A lista de
// vícios proibidos (VICIOS) é a mesma em todos os prompts do produto.

import { VICIOS, FICHA_TEXTO } from './adaptar'

export const COMO_USAR = [
  'Preencha a Ficha do seu negócio uma vez só e guarde num bloco de notas. É a mesma ficha do "Fazer a minha versão" do Acervo.',
  'Escolha a estrutura pelo que você quer que a pessoa faça depois de ver o anúncio.',
  'Abra a IA (Claude, ChatGPT ou a que você usa), cole a ficha, cole o super prompt e responda ao que ele perguntar. Se ele perguntar antes de escrever, é de propósito.',
  'A IA entrega a fala, as cenas, mais dois ganchos e a legenda. Você escolhe, grava e ajusta no seu jeito.',
  'Antes de publicar, passe pela lista de checagem da estrutura.',
]

export const QUAL_USAR = [
  { quer: 'pare o dedo, te conheça e te siga', slug: 'ser-descoberta', momento: 'Nunca ouviu falar de você' },
  { quer: 'deixe o contato pra uma aula, um evento ou uma lista', slug: 'captar-leads', momento: 'Te conhece de vista, ainda não deu o contato' },
  { quer: 'pense "essa pessoa entende do meu problema"', slug: 'mostrar-que-voce-entende', momento: 'Já te viu, ainda não confia' },
  { quer: 'acredite que funciona de verdade', slug: 'provar-que-funciona', momento: 'Confia em você, duvida do resultado' },
  { quer: 'solte a desculpa que está travando a compra', slug: 'quebrar-o-mas', momento: 'Quer, mas trava' },
  { quer: 'compre, chame, se inscreva agora', slug: 'vender-agora', momento: 'Já conhece, falta o empurrão' },
]

export const FICHA = FICHA_TEXTO

export const PROMPT_CLASSIFICAR = `Vou te mandar um anúncio (roteiro, transcrição, texto ou descrição das telas). Me diga em qual coleção do Acervo ele cai, o que ele faz bem e o que falta. Trabalhe só com o que está no anúncio: não invente nada sobre a marca, o público ou o mercado.

AS SEIS COLEÇÕES POR OBJETIVO (uma por etapa da jornada)
1. Atrair seguidores: fala com quem nunca viu a marca; ganha pela atenção; o produto aparece pouco e tarde; sem oferta. No fim, a pessoa segue ou salva.
2. Captar leads: pede o contato, não a compra: aula gratuita, evento, lista de espera, material. No fim, a pessoa se cadastra.
3. Mostrar que você entende: constrói autoridade ensinando, diagnosticando ou mostrando critério; entrega algo útil; a dona se posiciona; sem oferta. No fim, a pessoa pensa que ela entende do problema.
4. Provar que funciona: a prova é o centro (depoimento, antes e depois, número com contexto, caso), com quem, qual problema e o que mudou. No fim, a pessoa acredita no resultado.
5. Quebrar o "mas...": nomeia uma objeção com as palavras da cliente e vira com argumento concreto. No fim, a pessoa solta a desculpa.
6. Vender agora: oferta clara, o que ganha, motivo real pra agora, chamada com verbo e destino. No fim, a pessoa compra ou chama.

Além da coleção, dois casos especiais: um vídeo longo que faz o caminho inteiro (atenção, autoridade, prova, objeção e oferta) é uma Mini VSL; um anúncio de Black Friday é da Especial Black. Se for um dos dois, diga.

O QUE ME ENTREGAR
1. Coleção principal e, se houver, uma de apoio. Uma frase: o que esse anúncio quer que a pessoa faça no fim.
2. O que ele faz bem, em até duas frases, apontando o elemento concreto.
3. O que falta pra cumprir a função, em lista curta e específica. Se ele tenta cumprir três ou mais, diga isso e proponha qual manter.
4. O gancho reescrito, só se o atual não para o dedo de quem está na etapa certa. Sem copiar a estrutura do gancho atual.
5. A chamada final reescrita, só se estiver genérica ("saiba mais", "acesse o link") ou não combinar com a função.
6. Se alguma afirmação parece prova sem prova (resultado, número, "todo mundo"), aponte e diga como falar sem inventar.

Sem elogio, sem jargão, sem travessão, sem pergunta retórica. Português do Brasil, direto.

=== ANÚNCIO ===
[cole aqui]
=== FIM ===`

// Monta o super prompt de uma estrutura. O que muda entre elas é a
// sequência, o que não pode entrar e o que conferir em silêncio.
function montarPrompt(e) {
  const seq = e.video.map((p, i) => `${i + 1}. ${p.titulo}: ${p.texto}`).join('\n')
  const nunca = [...VICIOS, ...e.nunca].map(l => `- ${l}`).join('\n')
  const confere = e.checklist.map(l => `- ${l}`).join('\n')
  return `Vou gravar um anúncio do tipo ${e.title.toUpperCase()} pro meu negócio. Quero a fala pronta, na minha voz, seguindo a sequência abaixo.

=== FICHA DO MEU NEGÓCIO ===
[cole aqui a sua ficha preenchida]
=== FIM DA FICHA ===

O QUE ESSE ANÚNCIO FAZ
${e.funcao} No fim, a pessoa ${e.faz}
${e.contexto}

A SEQUÊNCIA (é ela que a minha versão segue)
${seq}
Duração: ${e.duracao}.
Formatos que cabem aqui: ${e.formatos}
Por tipo de negócio: ${e.adaptacao}

COMO FAZER
1. Leia a ficha. Pra cada passo da sequência, veja se eu te dei material de verdade. Se faltar algo que o passo precisa (${e.faltas}), pare e me pergunte antes de escrever. No máximo 3 perguntas, numa mensagem só. Nunca preencha o buraco com frase genérica.
2. Escreva a fala corrida, como eu falaria num áudio pra uma cliente, com a duração acima. Use as palavras da minha cliente e o ritmo do texto meu que está na ficha. Ainda sem cortar em cenas.
3. Só depois escreva o gancho: a primeira frase, abrindo o que o vídeo entrega. Ele nasce da fala, não antes dela.
4. Divida a fala em cenas. Texto na tela só onde ajuda, e nunca repetindo a fala palavra por palavra.
5. Escreva a versão estática: a frase da imagem (até 12 palavras), a descrição da imagem e a legenda.

NÃO ESCREVA
${nunca}

Antes de entregar, confira em silêncio e corrija sem me contar:
${confere}
E leia a fala como se fosse eu falando com uma cliente olhando no olho. Corte toda frase que eu não diria.

ME ENTREGUE
A fala completa, em parágrafos curtos, já com o gancho na primeira frase.
As cenas: o que aparece na tela e o trecho da fala em cada uma.
Mais 2 opções de gancho.
Legenda: até 3 linhas, terminando no que a pessoa faz depois de ver.
Versão estática: a frase da imagem e a descrição da imagem.`
}

const BASE = [
  {
    slug: 'ser-descoberta',
    title: 'Atrair seguidores',
    subtitle: 'Atrair seguidores e chamar a atenção de quem não te conhece',
    funcao: 'Fazer alguém que nunca te viu parar o dedo e querer conhecer. Aqui o anúncio ganha pela atenção, não pelo argumento.',
    faz: 'segue, salva, comenta, compartilha ou clica no perfil. Não compra, e tudo bem.',
    contexto: 'Fala do universo da cliente, não do produto. O produto aparece pouco, tarde e de leve.',
    quando: 'Quando você precisa de gente nova. Quando os anúncios de venda estão caros porque todo mundo que te conhece já comprou ou já decidiu que não.',
    duracao: 'de 15 a 30 segundos',
    video: [
      { titulo: 'Cena do universo dela', texto: 'Uma situação, frase ou cena que a cliente reconhece antes de saber o que você vende.' },
      { titulo: 'Entrega', texto: 'O que a cena prometeu: a observação, a história, a curiosidade. Uma ideia por vez.' },
      { titulo: 'Encosta no que você faz', texto: 'De leve: uma frase, o produto em uso, um detalhe.' },
      { titulo: 'Assinatura', texto: 'Quem você é, em uma frase, e um convite pequeno pra seguir ou salvar. Sem oferta, sem preço.' },
    ],
    estatico: ['Capa: uma frase ou imagem que destoa do feed e fala do universo dela, não do produto.', 'Miolo (carrossel): 3 a 5 telas que entregam a curiosidade, uma ideia por tela.', 'Última tela: assinatura leve e convite para seguir ou salvar.', 'Legenda: primeira linha repete ou completa o gancho. Dois ou três parágrafos curtos. Termina com convite para seguir.'],
    formatos: 'cena do dia a dia, afirmação contraintuitiva sustentada no resto, humor com a situação dela, tendência adaptada, bastidor que vira história, estático que destoa do feed.',
    adaptacao: 'negócio local mostra o lugar, a rotina e o bairro; prestação de serviço mostra o processo e o cuidado; infoproduto mostra a dúvida ou o erro que a aula resolve; e-commerce mostra o produto em uso na vida real, nunca em fundo branco.',
    faltas: 'uma cena real do dia a day da cliente, o que a minha rotina tem de reconhecível',
    nunca: ['Oferta, preço, desconto, prazo, urgência ou promessa de resultado.', 'O produto antes da metade da fala.', '"Saiba mais", "acesse o link", "não perca". O convite final é seguir, salvar ou comentar.'],
    checklist: ['O gancho faz sentido para quem nunca ouviu falar de você?', 'Dá para assistir até o fim sem sentir que é anúncio?', 'O produto aparece pouco e tarde?', 'Não tem preço, oferta nem "link na bio" como foco?', 'Se tirar o seu nome, o anúncio ainda é só seu? Se serve para qualquer concorrente, está genérico.'],
  },
  {
    slug: 'captar-leads',
    title: 'Captar leads',
    subtitle: 'Gerar cadastros para seu evento, lançamento, produto, serviço',
    funcao: 'Fazer a pessoa deixar o contato em troca de algo que vale a pena: uma aula, um evento, um material, uma lista de espera, um diagnóstico.',
    faz: 'se cadastra. Não compra ainda, e esse anúncio não pede.',
    contexto: 'Pede pouco agora e deixa a venda pra depois. O que ganha ao se cadastrar é concreto e fácil de aceitar.',
    quando: 'Quando você tem uma aula, um evento ou um material pra entregar antes de vender. Em lançamento, abertura de lista de espera, agenda que precisa de contato antes do orçamento.',
    duracao: 'de 20 a 45 segundos',
    video: [
      { titulo: 'O resultado que a pessoa imagina', texto: 'O que ela vai saber, resolver ou ganhar com o que você está oferecendo. Concreto, não "conteúdo exclusivo".' },
      { titulo: 'O que é e como funciona', texto: 'Aula, evento, material, lista. Quando, quanto tempo, o que precisa pra participar.' },
      { titulo: 'Por que vale a pena agora', texto: 'Data, vaga, o que ela perde deixando pra depois. Só se for real.' },
      { titulo: 'O pedido', texto: 'O que ela faz pra entrar e o que recebe na hora. "Só nome e e-mail", "o link chega no WhatsApp".' },
    ],
    estatico: ['Capa: o resultado que a pessoa imagina, em uma frase.', 'Miolo (carrossel): o que é, o que ela aprende ou ganha em 3 tópicos, quando e como.', 'Última tela: o pedido, com o que ela recebe na hora.', 'Legenda: o que é, pra quem, quando e o pedido.'],
    formatos: 'convite direto, bastidor do que está sendo preparado, pergunta que a aula responde, lista do que a pessoa vai aprender, depoimento de quem fez a edição anterior.',
    adaptacao: 'negócio local pede contato pra agendar ou avisar quando abrir; prestação de serviço oferece diagnóstico ou orçamento; infoproduto oferece aula, evento ou lista de espera; e-commerce oferece aviso de lançamento, cupom ou lista de espera do produto.',
    faltas: 'o que exatamente a pessoa ganha ao se cadastrar, quando acontece, quantos campos o cadastro pede, o que ela recebe na hora',
    nunca: ['Preço do produto principal, a não ser que a ficha diga que ele aparece.', '"Conteúdo exclusivo", "vagas limitadas" sem número real, "garanta já".', 'Pedir a compra. O pedido é o cadastro.'],
    checklist: ['Dá pra entender em uma frase o que a pessoa ganha ao se cadastrar?', 'O pedido é fácil de aceitar (poucos campos, recompensa na hora)?', 'O motivo pra agora é real?', 'Alguém que não conhece a marca saberia por que confiar?', 'Nenhuma oferta de compra escondida?'],
  },
  {
    slug: 'mostrar-que-voce-entende',
    title: 'Mostrar que você entende',
    subtitle: 'Gerar autoridade e construir confiança',
    funcao: 'Convencer que a pessoa por trás da marca sabe do que está falando. Constrói confiança antes de pedir qualquer coisa.',
    faz: 'pensa que você entende do problema dela e passa a prestar atenção em você. Salva, compartilha, começa a acompanhar.',
    contexto: 'Ensina, explica ou mostra critério de verdade: quem não comprar nada ainda sai com algo útil. A autoridade se mostra, não se declara.',
    quando: 'Quando a pessoa já te viu mas ainda não confia. Quando você vende algo que exige critério. Quando quer sair da guerra de preço.',
    duracao: 'de 20 a 45 segundos',
    video: [
      { titulo: 'O erro ou a dúvida', texto: 'Nomeie o problema melhor do que ela mesma nomearia, com as palavras dela.' },
      { titulo: 'Por que acontece', texto: 'Mostre que você reconhece o problema de dentro, com um detalhe que só quem vive sabe.' },
      { titulo: 'O caminho', texto: 'A dica, o passo, o critério. Entregue de verdade: se a pessoa pausar e anotar, ela anota o quê?' },
      { titulo: 'A sua posição', texto: 'Como você faz com as suas clientes, em uma frase, e um convite leve: salvar, seguir, mandar dúvida.' },
    ],
    estatico: ['Capa: a dúvida ou o erro, em frase direta.', 'Miolo: 3 a 6 telas com o raciocínio, um passo por tela. A última tela do miolo é a mais útil.', 'Última tela: sua posição e o convite.'],
    formatos: 'passo a passo, erro comum, jeito antigo e jeito certo, bastidor com o critério por trás de uma escolha, resposta a uma pergunta que você recebe sempre, comparação honesta.',
    adaptacao: 'negócio local mostra o critério no atendimento ou no espaço; prestação de serviço mostra o processo e as decisões do trabalho; infoproduto mostra o erro que a cliente comete e o conceito que resolve; e-commerce mostra como escolher, usar ou cuidar do produto.',
    faltas: 'como eu faço de verdade (o processo, o critério, a técnica), um detalhe que só quem vive o problema conhece',
    nunca: ['Oferta, preço ou urgência. O produto só como consequência do critério, nunca como foco.', '"Somos referência", "os melhores", "especialista em". Autoridade se mostra, não se declara.', 'Dica genérica que qualquer perfil publicaria.', 'Prometer resultado. Pode dizer o que o critério evita, com "costuma".'],
    checklist: ['Alguém que não comprar nada sai com algo útil?', 'Tem um detalhe que só quem vive o problema conhece?', 'Você se posiciona (diz como faz, o que defende), em vez de só listar dicas?', 'O produto aparece como consequência do critério, não como foco?'],
  },
  {
    slug: 'provar-que-funciona',
    title: 'Provar que funciona',
    subtitle: 'Prova social e resultados reais',
    funcao: 'Tirar a dúvida "será que funciona mesmo?" com evidência. É a coleção da prova.',
    faz: 'acredita no resultado e se imagina tendo o mesmo. Muitas vezes manda mensagem perguntando se com ela também dá.',
    contexto: 'A prova é o centro, não um detalhe no fim. O que faz a prova valer é o contexto: quem era a cliente, qual era o problema, o que foi feito, o que mudou.',
    quando: 'Quando a pessoa já confia em você mas duvida do resultado. Quando o produto tem um antes e depois visível. Quando você recebe muito "vou pensar".',
    duracao: 'de 15 a 40 segundos',
    video: [
      { titulo: 'A prova na cara', texto: 'Comece pelo resultado ou pelo depoimento, sem introdução.' },
      { titulo: 'Contexto', texto: 'Quem era essa cliente, qual era o problema, por que era difícil. Sem contexto, é só um número.' },
      { titulo: 'O caminho', texto: 'O que foi feito, em poucas palavras. O resultado tem um método por trás, não sorte.' },
      { titulo: 'Ponte', texto: 'Se o caso dela parece com o seu, me chama. Sem oferta pesada. A prova já fez o trabalho.' },
    ],
    estatico: ['Capa: o resultado ou a frase do depoimento, grande.', 'Miolo: o antes, o processo, o depois, um por tela. Ou vários depoimentos curtos, um por tela.', 'Última tela: a ponte.'],
    formatos: 'depoimento gravado no celular, print de conversa com permissão, antes e depois, número com contexto, reação da cliente ao receber, caso contado em primeira pessoa.',
    adaptacao: 'negócio local mostra a cliente real no espaço, avaliação, fila, retorno; prestação de serviço mostra antes e depois do trabalho e o que a cliente disse; infoproduto mostra o resultado da aluna com o contexto de onde ela partiu; e-commerce mostra o produto na vida da cliente, reação ao receber, avaliação com foto.',
    faltas: 'o contexto da prova: quem era, qual era o problema, o que foi feito, o que mudou e em quanto tempo. Se a ficha não tem prova nenhuma, diga que esse anúncio ainda não dá pra fazer e sugira a estrutura que cabe agora',
    nunca: ['Prova que não está na ficha, do jeito que está. Não arredonde número, não acrescente adjetivo ao depoimento, não crie cliente.', '"Todo mundo consegue", "resultado garantido", "funciona pra qualquer uma".', '"Resultado incrível", "transformação surreal". Deixe a prova falar.'],
    checklist: ['A prova é real, existe e você tem permissão para usar?', 'Tem contexto: quem, qual era o problema, por que era difícil?', 'A prova é específica (nome, situação, número) e não "muitas clientes amam"?', 'Tirando a prova, o anúncio cai? Se fica de pé sem ela, é de outra coleção.', 'Lembrou de pedir permissão pra usar nome, imagem ou print?'],
  },
  {
    slug: 'quebrar-o-mas',
    title: 'Quebrar o "mas..."',
    subtitle: 'Quebra de objeção e dos motivos pra adiar',
    funcao: 'Responder ao motivo pelo qual a pessoa ainda não comprou. É o anúncio que conversa com quem já quer, mas trava.',
    faz: 'solta a desculpa: "é caro", "não tenho tempo", "não vai dar certo pra mim", "já tentei", "depois eu vejo".',
    contexto: 'Uma objeção por anúncio. A virada se sustenta em algo concreto: o custo de não resolver, a facilidade real, o que é diferente dessa vez, um caso parecido, uma condição que resolve.',
    quando: 'Quando você ouve a mesma objeção toda semana. Quando tem gente que pergunta e some. Quando o retorno do anúncio de venda é "vou pensar".',
    duracao: 'de 15 a 40 segundos',
    video: [
      { titulo: 'A objeção, com as palavras dela', texto: 'Quem pensa isso para na hora.' },
      { titulo: 'Um fato, não uma validação', texto: 'Em vez de dizer que faz sentido pensar assim, mostre com um fato de onde essa ideia vem.' },
      { titulo: 'A virada', texto: 'O argumento concreto: o custo de não resolver, a facilidade real, o que é diferente, o caso parecido, a condição.' },
      { titulo: 'Convite', texto: 'Se era isso que estava te segurando, me chama. Direto, sem pressão.' },
    ],
    estatico: ['Capa: a objeção, como ela fala.', 'Miolo: o fato em uma tela, a virada em duas ou três.', 'Última tela: o convite.'],
    formatos: 'resposta a comentário real, comparação de custo, cena que mostra a facilidade, conversa franca olhando para a câmera, perguntas e respostas.',
    adaptacao: 'negócio local costuma ouvir "é longe", "não tenho tempo", "é caro"; prestação de serviço ouve "vou fazer eu mesma", "preciso de orçamento", "e se não ficar bom"; infoproduto ouve "não vou conseguir aplicar", "já fiz curso e não funcionou"; e-commerce ouve "e se não servir", "frete caro", "não conheço a marca". Use o que a ficha trouxer.',
    faltas: 'a objeção com as palavras da cliente, o argumento concreto que vira (de onde ele vem na ficha), a condição ou o caso parecido se houver',
    nunca: ['"Faz sentido pensar assim", "eu entendo", "você não está errada". A objeção se responde com fato.', '"Confia em mim" como argumento. Condição, garantia ou caso que não está na ficha.', 'Mais de uma objeção no mesmo anúncio.', 'Urgência inventada.'],
    checklist: ['A objeção está escrita do jeito que a cliente fala?', 'A virada tem argumento concreto (custo, facilidade, diferença, caso, condição) e não só confiança?', 'Não prometeu o que o produto não entrega?', 'Uma objeção por anúncio?'],
  },
  {
    slug: 'vender-agora',
    title: 'Vender agora',
    subtitle: 'Oferta direta e remarketing',
    funcao: 'Pedir a compra. Fala com quem já conhece, já confia e só precisa do empurrão.',
    faz: 'clica para comprar, chama no WhatsApp, se inscreve, garante a vaga.',
    contexto: 'Curto e direto. A oferta aparece cedo. O motivo pra agir agora é real ou é o custo de adiar. A chamada final tem verbo, destino e o que acontece depois. Um destino só.',
    quando: 'Quando existe uma oferta, uma condição ou um motivo real para agir agora. Para quem já viu, visitou, perguntou e não fechou. Em lançamento, abertura de turma, data comercial.',
    duracao: 'de 10 a 30 segundos',
    video: [
      { titulo: 'A oferta', texto: 'O que é, para quem, em uma frase. Quem está aqui já sabe quem você é.' },
      { titulo: 'O que ganha', texto: 'O resultado em uma frase, e o que vem junto (entrega, bônus, condição). Específico.' },
      { titulo: 'Motivo para agora', texto: 'Prazo, vagas, condição, data. Só se for real. Se não tem motivo real, o custo de adiar.' },
      { titulo: 'Chamada', texto: 'Verbo, destino e o que acontece depois: "clica, escolhe o tamanho e chega em 3 dias".' },
    ],
    estatico: ['Capa: oferta e para quem, em uma frase.', 'Miolo (se carrossel): o que ganha, a condição, a prova em uma tela.', 'Última tela: chamada com destino.'],
    formatos: 'oferta direta, remarketing ("ainda está pensando?", "deixou no carrinho"), lembrete de prazo real, abertura de turma, chamada para o WhatsApp, bastidor do estoque acabando (se for verdade).',
    adaptacao: 'negócio local chama para agendar, reservar ou visitar, com dia e horário; prestação de serviço chama para orçamento ou vaga do mês; infoproduto chama para a inscrição, com o que a turma inclui e quando começa; e-commerce chama para o site, com frete, prazo de entrega e como escolher.',
    faltas: 'o que está incluído, o destino e o que acontece depois do clique, a condição atual se existir',
    nunca: ['Desconto, prazo, vaga, bônus, garantia ou escassez que não está na ficha.', '"Transforme sua vida", "solução completa", "saiba mais", "acesse o link", "não perca".', 'Mais de um destino.', 'Culpa no remarketing. Retome a conversa, não cobre.'],
    checklist: ['A oferta está clara nos primeiros segundos?', 'O motivo para agora é real?', 'A chamada tem verbo, destino e o que acontece depois?', 'Tem no máximo um destino?', 'Alguma condição, prazo ou prova que não está na ficha?'],
  },
]

export const ESTRUTURAS = BASE.map(e => ({
  ...e,
  // A página mostra a sequência numerada; o campo "tempo" continua existindo
  // pra não quebrar o layout, mas agora é a ordem, não um tempo cravado.
  video: e.video.map((p, i) => ({ ...p, tempo: `${i + 1}º` })),
  prompt: montarPrompt(e),
}))
