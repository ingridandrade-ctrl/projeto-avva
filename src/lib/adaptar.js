// "Fazer a minha versão": monta, a partir da análise de um anúncio do Acervo,
// um prompt que destrincha a análise pela lente da coleção (objetivo) e guia a
// adaptação para o negócio da aluna. Nada aqui é regra: as lentes orientam a
// leitura, a IA decide com o que a aluna responder.

import { OBJECTIVE_LABELS, MEDIA_LABELS, NICHE_LABELS } from './catalog'

export const DESTINOS = ['WhatsApp', 'Site', 'Página de vendas', 'Perfil', 'Direct']

export const CAMPOS = [
  { key: 'negocio', label: 'Seu negócio', placeholder: 'O que você vende e pra quem. Ex.: consultoria de imagem pra mulheres acima de 40', salvo: true },
  { key: 'prova', label: 'Uma prova real (opcional)', placeholder: 'Ex.: 120 clientes atendidas, depoimento da Carla, antes e depois…', salvo: true },
  { key: 'objecao', label: 'O "mas" que você mais ouve (opcional)', placeholder: 'Ex.: "é caro", "não tenho tempo", "já tentei e não deu certo"', salvo: true },
]

const CHAVE = 'avva.ficha'

export function loadFicha() {
  try { return JSON.parse(localStorage.getItem(CHAVE) || '{}') } catch { return {} }
}

export function saveFicha(ficha) {
  try { localStorage.setItem(CHAVE, JSON.stringify(ficha)) } catch { /* sem armazenamento, segue sem salvar */ }
}

// Para onde esse tipo de anúncio costuma levar. Orientação, não regra.
export const DESTINO_SUGESTAO = {
  'ser-descoberta': 'Anúncio de descoberta costuma levar pro perfil ou pro direct, pra pessoa te conhecer. Mas não é regra: se a oferta encaixa, pode levar pra venda.',
  'mostrar-que-voce-entende': 'Anúncio de autoridade costuma levar pro perfil, pro direct ou pra uma página com mais conteúdo. Se a pessoa já conhece você, pode levar direto pra oferta.',
  'provar-que-funciona': 'Anúncio de prova costuma levar pro WhatsApp ou pra página de vendas, porque quem viu a prova já quer perguntar. Não é regra.',
  'quebrar-o-mas': 'Anúncio de objeção costuma levar pro WhatsApp ou pra página de vendas, onde a dúvida termina de ser respondida. Não é regra.',
  'vender-agora': 'Anúncio de venda costuma levar pra página de vendas, site ou WhatsApp, o lugar onde a compra acontece.',
}

// Lentes: como destrinchar a análise conforme a coleção do anúncio
const LENTES = {
  'ser-descoberta': [
    'O que, nos primeiros segundos ou na primeira frase, faz quem nunca viu essa marca parar? É cena, curiosidade, humor, afirmação, formato, contraste?',
    'Com quem a peça está falando: que situação, momento ou sentimento da pessoa ela reconhece logo de cara?',
    'O que a peça entrega antes de pedir qualquer coisa: uma piada, uma informação, uma história, uma identificação?',
    'Em que momento e de que jeito o produto ou a marca aparece? Cedo, tarde, de leve, de frente?',
    'Que formato ou linguagem ela pega emprestado (meme, notícia, conversa, tendência, bastidor) e por que isso baixa a defesa de quem vê?',
    'O que a peça faz a pessoa querer no fim: conhecer, seguir, salvar, comentar, clicar, comprar? (pode ser mais de um)',
    'O que dessa peça depende do anunciante ser famoso ou ter um contexto específico, e o que funciona pra qualquer marca?',
  ],
  'mostrar-que-voce-entende': [
    'Que conhecimento, critério ou visão a peça mostra, e como ela mostra em vez de só afirmar?',
    'Tem algum detalhe que só quem vive esse problema conhece? Qual?',
    'Que erro, dúvida ou crença do público a peça nomeia, e nas palavras de quem?',
    'O que a pessoa leva de útil mesmo que não compre nada?',
    'Como a autoridade vira confiança sem a peça virar aula? Onde entra a posição de quem anuncia ("eu faço assim", "eu não faço isso")?',
    'O produto aparece como consequência do critério ou como foco? Que diferença isso faz?',
    'Que sinal de experiência a peça dá sem dizer "sou especialista" (bastidor, caso, número, processo)?',
  ],
  'provar-que-funciona': [
    'Qual é a prova: depoimento, print, antes e depois, número, caso, reação? Em que formato ela aparece?',
    'Qual é o contexto dela: quem era a cliente, qual era o problema, o que foi feito, o que mudou?',
    'Em que ponto a prova entra em relação ao argumento, e por que essa ordem?',
    'O que faz essa prova parecer verdadeira (detalhe, imperfeição, nome, situação específica)?',
    'Que dúvida essa prova derruba na cabeça de quem vê? E qual ela deixa aberta?',
    'A prova fala sozinha ou alguém interpreta a prova? Quem conduz?',
    'Tirando a prova, a peça fica de pé? O que isso diz sobre o papel dela?',
  ],
  'quebrar-o-mas': [
    'Qual objeção a peça responde e como ela nomeia essa objeção (nas palavras da cliente, por cena, por comparação)?',
    'Em que momento da peça a objeção aparece: no gancho, no meio, no fim?',
    'A peça valida a objeção antes de rebater? Como, e em que tom (conversa, provocação, humor)?',
    'Qual é o argumento concreto que vira a objeção: custo de não resolver, facilidade, diferença, caso parecido, condição, garantia?',
    'Que prova ou exemplo sustenta a virada, se houver?',
    'Como a peça termina depois de responder: pede algo, deixa a pessoa decidir, abre conversa?',
    'A objeção respondida é a mesma que a minha cliente tem, ou é parecida em outra forma?',
  ],
  'vender-agora': [
    'Qual é a oferta e como ela aparece: o que é, pra quem, o que ganha, o que vem junto?',
    'Em que momento a oferta aparece e o que vem antes dela?',
    'Qual é o motivo pra agir agora, e ele é real na peça (prazo, condição, vagas, custo de adiar)?',
    'Como a peça trata o preço ou a condição: mostra, compara, justifica, esconde?',
    'Como é a chamada: que verbo, pra que destino, o que acontece depois do clique?',
    'A peça fala com quem já conhece a marca (remarketing) ou com quem nunca viu? Como dá pra perceber?',
    'Que prova ou argumento aparece como apoio da oferta, mesmo que rápido?',
  ],
}

const LENTE_GERAL = [
  'Qual é a escolha de comunicação que sustenta a peça, e o que ela muda na decisão de quem vê?',
  'Que tensão a peça resolve: uma dúvida, um adiamento, um medo, uma resistência, um conflito entre o que a pessoa quer e o que a peça pede?',
  'Como o formato (vídeo, imagem, carrossel, página) ajuda a ideia? Em outro formato, ela funcionaria?',
  'O que é ideia (dá pra reaproveitar) e o que é só execução daquele anunciante (não dá)?',
  'Que erro seria fácil cometer ao copiar essa peça sem entender o porquê?',
]

const ENTREGA_POR_MIDIA = {
  video: 'o roteiro de 15 a 30 segundos, em tabela: tempo, o que aparece na tela, o que é dito',
  image: 'o texto da imagem (até 12 palavras) e a descrição da cena ou da foto',
  carousel: 'o texto de cada tela de um carrossel de 4 a 6 telas, uma ideia por tela',
  pdf: 'a estrutura da página em blocos (título, promessa, prova, oferta, chamada), com o texto de cada bloco',
}

export function buildPrompt({ ad, collectionTitle, ficha }) {
  const objetivos = (ad.objectives || []).filter(o => LENTES[o])
  const nomes = objetivos.map(o => OBJECTIVE_LABELS[o]).join(' e ')
  const nichos = (ad.niches || []).map(n => NICHE_LABELS[n] || n).join(', ')
  const midia = (MEDIA_LABELS[ad.media_type] || ad.media_type || 'vídeo').toLowerCase()
  const entrega = ENTREGA_POR_MIDIA[ad.media_type] || ENTREGA_POR_MIDIA.video

  const lentes = [...new Set([...objetivos.flatMap(o => LENTES[o]), ...LENTE_GERAL])]
  const negocio = (ficha.negocio || '').trim()
  const destino = (ficha.destino || '').trim()
  const prova = (ficha.prova || '').trim()
  const objecao = (ficha.objecao || '').trim()

  const meu = [
    negocio ? `O que eu vendo e pra quem: ${negocio}` : null,
    destino ? `Pra onde o anúncio leva: ${destino}` : null,
    prova ? `Prova real que eu posso usar: ${prova}` : 'Prova real que eu posso usar: nenhuma informada (não invente)',
    objecao ? `O "mas" que eu mais ouço das clientes: ${objecao}` : null,
  ].filter(Boolean).join('\n')

  const faltando = [
    !negocio ? 'o que eu vendo e pra quem' : null,
    !destino ? 'pra onde o anúncio leva (WhatsApp, site, página, perfil, direct)' : null,
  ].filter(Boolean)

  const sugestaoDestino = objetivos.map(o => DESTINO_SUGESTAO[o]).filter(Boolean)[0]

  return `Quero fazer a minha versão de um anúncio que está no Acervo de Anúncios do Método AVVA. Trabalhe em duas partes: primeiro destrinche a análise, depois adapte pra mim.

ANÚNCIO DE REFERÊNCIA
Título: ${ad.title}
Tipo: ${midia}${nichos ? `\nNicho de quem anunciou: ${nichos}` : ''}${collectionTitle ? `\nColeção: ${collectionTitle}` : ''}${nomes ? `\nObjetivo do anúncio (coleção): ${nomes}` : ''}

Por que funciona, segundo o Acervo:
"""
${(ad.analysis || '').trim()}
"""

PARTE 1. DESTRINCHE A ANÁLISE
Responda em frases curtas, a partir da análise e do que ela descreve da peça (não invente o que não está lá):
${lentes.map((l, i) => `${i + 1}. ${l}`).join('\n')}
Feche a parte 1 com uma frase: a ideia dessa peça que vale reaproveitar, em palavras simples.

MEU NEGÓCIO
${meu}${faltando.length ? `\nAntes de escrever a parte 2, me pergunte, numa mensagem só: ${faltando.join('; ')}. Espere a resposta.` : ''}
${sugestaoDestino ? `\nSobre o destino: ${sugestaoDestino} Decida comigo o que faz mais sentido para a minha versão e diga por quê em uma linha.` : ''}

PARTE 2. ADAPTE PRA MIM
Use a ideia que você destrinchou, com o meu produto, a minha cliente e as minhas palavras. Não copie frases do anúncio de referência. Não invente prova, número, desconto, prazo ou história: use só o que eu informei. Escreva como gente fala, sem jargão de marketing e sem travessão.
Me entregue:
1. Três opções de gancho, de até 12 palavras, de tipos diferentes.
2. Com o melhor gancho, ${entrega}.
3. A legenda, curta, terminando com a chamada para o destino.
4. Checagem: o que, na minha versão, faz o mesmo papel do que a análise destacou? Se algo da ideia ficou de fora, diga o quê e corrija.`
}

export function linkChatGPT(prompt) {
  return `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`
}
