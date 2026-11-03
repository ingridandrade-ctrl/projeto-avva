// "Fazer a minha versão": monta, a partir da análise de um anúncio (ou página)
// do Acervo e da ficha da aluna, o prompt que a IA usa pra escrever a versão
// dela. A ordem do trabalho é fixa: entender a sequência da referência,
// checar o material, escrever a fala corrida na voz da aluna, escrever o
// gancho por último e só então cortar em cenas. A voz vem de exemplo (texto
// dela, frase da cliente, palavras proibidas), não de adjetivo.

import { OBJECTIVE_LABELS, NICHE_LABELS, PAGE_TYPE_LABELS, isPage } from './catalog'

export const DESTINOS = ['WhatsApp', 'Site', 'Página de vendas', 'Página de captura', 'Perfil', 'Direct']

export const TIPOS = ['Infoproduto', 'E-commerce', 'Negócio local', 'Serviço']

// ── A ficha (única: vale aqui e no Kit) ──
// `longo` vira caixa de texto maior. `grupo` organiza a tela.
export const CAMPOS = [
  { key: 'vendo', grupo: 'negocio', label: 'O que você vende', ajuda: 'Produto ou serviço, em poucas palavras.', placeholder: 'Ex.: consultoria de imagem' },
  { key: 'cliente', grupo: 'negocio', label: 'Pra quem, com detalhe', ajuda: 'Segmento, cargo ou momento de vida. Quanto mais específico, menos genérica sai a fala.', placeholder: 'Ex.: dona de clínica de estética com 2 a 5 funcionárias' },
  { key: 'muda', grupo: 'negocio', label: 'O que muda pra ela', ajuda: 'O resultado que ela leva, não o produto.', placeholder: 'Ex.: agenda cheia sem depender de indicação' },
  { key: 'frase_cliente', grupo: 'voz', label: 'Como a sua cliente fala do problema', ajuda: 'Uma frase dela, com as palavras dela. Vira o material do gancho e da objeção.', placeholder: 'Ex.: "eu posto todo dia e não vem ninguém"' },
  { key: 'prova', grupo: 'negocio', label: 'Uma prova real, com contexto', ajuda: 'De quem, o que mudou, em quanto tempo. Número solto não vale. Vazio, a IA não inventa.', placeholder: 'Ex.: a Carla, salão em Campinas, saiu de 6 pra 20 agendamentos por semana em 2 meses' },
  { key: 'objecao', grupo: 'negocio', label: 'O "mas" que você mais ouve', ajuda: 'A desculpa de quando a cliente quer mas não fecha.', placeholder: 'Ex.: "é caro" · "não tenho tempo"' },
  { key: 'preco', grupo: 'negocio', label: 'Preço ou condição', ajuda: 'Valor, parcelamento, prazo. Só se for real. Entra só onde a referência fala de preço.', placeholder: 'Ex.: R$ 497 em 12x · só até domingo' },
  { key: 'ganha', grupo: 'destino', label: 'O que a pessoa ganha ao clicar', ajuda: 'O que acontece no destino: uma análise, uma aula, um orçamento, uma conversa.', placeholder: 'Ex.: uma análise gratuita do que ela já fez de anúncio' },
  { key: 'amostra', grupo: 'voz', longo: true, label: 'Um texto seu', ajuda: 'Uma legenda que você escreveu ou a transcrição de um áudio seu. A IA imita o ritmo, o tamanho das frases e as palavras. É o que mais tira a cara de IA.', placeholder: 'Cole aqui um texto seu, do jeito que você fala' },
  { key: 'proibidas', grupo: 'voz', label: 'Eu nunca diria', ajuda: 'Palavras ou jeitos que você não usa.', placeholder: 'Ex.: "amiga", "gatilho", "escala", emoji' },
]

// Tom: um só por vez, e cada um vira uma descrição concreta de como escrever,
// não um adjetivo pra IA atuar.
export const TONS = [
  { nome: 'Direta', regra: 'Frases curtas. Começa pelo assunto, sem rodeio na abertura. Sem pergunta retórica, sem tranquilizar a pessoa, sem explicar por que está dizendo. Diz e segue.' },
  { nome: 'Leve e divertida', regra: 'Humor vem de situação concreta do dia a dia da cliente, nunca de piada pronta ou trocadilho. Uma observação engraçada por vez. O resto é fala normal.' },
  { nome: 'Acolhedora', regra: 'Primeira pessoa contando algo que ela viveu ou viu numa cliente. Reconhece a situação da cliente com um fato, nunca com "eu entendo" ou "faz sentido". Nada de "a gente junto", "tá tudo bem", "respira".' },
  { nome: 'Elegante', regra: 'Vocabulário preciso, sem gíria e sem diminutivo. Frases completas, ritmo calmo. Afirma sem exclamação. Não usa superlativo nem "incrível", "maravilhoso".' },
  { nome: 'Provocadora', regra: 'Nomeia o que a cliente faz errado, pelo nome, sem suavizar e sem ofender. Afirmação, não pergunta. Sem "verdade dura", "ninguém te conta", "pare de".' },
  { nome: 'Técnica e precisa', regra: 'Usa o termo certo do ofício e explica em meia frase quando a cliente não usaria. Dá o critério e o porquê. Sem promessa, sem adjetivo, sem metáfora.' },
]

// Vícios de estrutura que marcam texto de IA. Lista única, usada em todos os prompts.
export const VICIOS = [
  'Nenhuma frase do original nem da análise, nem a mesma estrutura de abertura. Copie o movimento, nunca a frase.',
  'Validação pronta: "faz todo sentido", "eu entendo", "tá tudo bem", "a gente junto", "respira".',
  'Frase curta de efeito fechando parágrafo, pergunta retórica, lista de três coisas, "a verdade é que", "imagina", "o segredo", "não é X, é Y".',
  'Jargão de marketing, promessa genérica, emoji, exclamação, travessão.',
  'Número, prova, preço, prazo, garantia ou condição que eu não tenha dado. Prova só com contexto: de quem e o que mudou.',
  'Preço fora do ponto em que o original fala de preço. Se o original não fala de preço, a minha versão também não.',
]

const CHAVE = 'avva.ficha'

export function loadFicha() {
  try { return JSON.parse(localStorage.getItem(CHAVE) || '{}') } catch { return {} }
}

export function saveFicha(ficha) {
  try { localStorage.setItem(CHAVE, JSON.stringify(ficha)) } catch { /* sem armazenamento, segue sem salvar */ }
}

// Para onde esse tipo de anúncio costuma levar. Orientação, não regra.
export const DESTINO_AJUDA = 'Pra onde a pessoa vai quando toca no anúncio, e o que ela ganha lá.'
export const DESTINO_SUGESTAO = {
  'ser-descoberta': 'Anúncio de descoberta costuma levar pro perfil ou pro direct, pra pessoa te conhecer. Se a oferta encaixa, pode levar pra venda.',
  'captar-leads': 'Anúncio de captação costuma levar pra página de captura ou pro WhatsApp, onde a pessoa deixa o contato.',
  'mostrar-que-voce-entende': 'Anúncio de autoridade costuma levar pro perfil, pro direct ou pra uma página com mais conteúdo.',
  'provar-que-funciona': 'Anúncio de prova costuma levar pro WhatsApp ou pra página de vendas, porque quem viu a prova já quer perguntar.',
  'quebrar-o-mas': 'Anúncio de objeção costuma levar pro WhatsApp ou pra página de vendas, onde a dúvida termina de ser respondida.',
  'vender-agora': 'Anúncio de venda costuma levar pra página de vendas, site ou WhatsApp, o lugar onde a compra acontece.',
}

// ── Duração ──
// A versão da aluna tem a duração da referência. Sem o campo preenchido: 30 a
// 60 segundos, ou 60 a 180 quando o anúncio está na Especial Mini VSL.
export const MINI_VSL_SLUG = 'especial-mini-vsl'

export function ehMiniVsl(ad, collectionSlug) {
  return collectionSlug === MINI_VSL_SLUG || (ad?.extras || []).includes(MINI_VSL_SLUG) || ad?.collections?.slug === MINI_VSL_SLUG
}

export function duracaoDe(ad, collectionSlug) {
  const s = Number(ad?.duration_seconds)
  if (s > 0) return `a mesma do original: cerca de ${s} segundos`
  if (ehMiniVsl(ad, collectionSlug)) return 'o original é uma mini VSL: de 60 a 180 segundos'
  return 'a mesma do original; sem essa informação, de 30 a 60 segundos'
}

// ── Links ──
// O prompt vai inteiro na URL. Acima disso, o botão copia em vez de abrir.
export const LIMITE_LINK = 8000

export function cabeNoLink(prompt) {
  return encodeURIComponent(prompt).length <= LIMITE_LINK
}

export function linkChatGPT(prompt) {
  return `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`
}

export function linkClaude(prompt) {
  return `https://claude.ai/new?q=${encodeURIComponent(prompt)}`
}

// ── Montagem ──
const v = (ficha, k) => (ficha?.[k] || '').toString().trim()

function blocoMeuNegocio(ficha, { comDestino = true } = {}) {
  const tom = TONS.find(t => t.nome === v(ficha, 'tom'))
  const linhas = [
    `O que eu vendo: ${v(ficha, 'vendo') || '(não informei)'}`,
    v(ficha, 'tipo') ? `Tipo de negócio: ${v(ficha, 'tipo')}` : null,
    `Pra quem, com detalhe: ${v(ficha, 'cliente') || '(não informei)'}`,
    v(ficha, 'muda') ? `O que muda pra ela: ${v(ficha, 'muda')}` : null,
    v(ficha, 'frase_cliente') ? `Como a minha cliente fala do problema, com as palavras dela: ${v(ficha, 'frase_cliente')}` : null,
    `Prova real, com contexto: ${v(ficha, 'prova') || 'nenhuma. Não invente.'}`,
    v(ficha, 'objecao') ? `O "mas" que eu mais ouço: ${v(ficha, 'objecao')}` : null,
    v(ficha, 'preco') ? `Preço ou condição real: ${v(ficha, 'preco')}` : 'Preço ou condição: não informei. Não cite preço.',
    comDestino ? `Pra onde o anúncio leva: ${v(ficha, 'destino') || '(não informei)'}${v(ficha, 'ganha') ? `. O que a pessoa ganha ao clicar: ${v(ficha, 'ganha')}` : ''}` : null,
    v(ficha, 'amostra') ? `Um texto meu, pra você pegar o meu jeito de falar:\n"""\n${v(ficha, 'amostra')}\n"""` : null,
    tom ? `Como eu escrevo: ${tom.regra}` : null,
    v(ficha, 'tomOutro') ? `Mais sobre o meu jeito: ${v(ficha, 'tomOutro')}` : null,
    v(ficha, 'proibidas') ? `Eu nunca diria: ${v(ficha, 'proibidas')}` : null,
  ].filter(Boolean)
  return linhas.join('\n')
}

function blocoNaoEscreva(extras = []) {
  return [...VICIOS, ...extras].map(l => `- ${l}`).join('\n')
}

// O que muda por formato: como escrever (passo 3) e o que entregar
const FORMATOS = {
  video: {
    nome: 'vídeo',
    passo3: 'Escreva a fala corrida, como eu falaria num áudio pra uma cliente, com a duração do original. Use as palavras da minha cliente e o ritmo do meu texto. Ainda sem cortar em cenas.',
    passo4: 'Só depois escreva o gancho: a primeira frase, abrindo o que o vídeo entrega. Ele nasce da fala, não antes dela.',
    passo5: 'Divida a fala em cenas. Texto na tela só onde ajuda, e nunca repetindo a fala palavra por palavra.',
    entrega: [
      'O que eu repito do original: uma linha.',
      'A fala completa, em parágrafos curtos, já com o gancho na primeira frase.',
      'As cenas: o que aparece na tela e o trecho da fala em cada uma.',
      'Mais 2 opções de gancho.',
      'Legenda: até 3 linhas, terminando no que a pessoa faz no destino.',
    ],
  },
  image: {
    nome: 'imagem',
    passo3: 'Escreva o que a imagem diz: o texto que vai nela (até 12 palavras) e a legenda inteira, como eu falaria num áudio pra uma cliente. Use as palavras da minha cliente e o ritmo do meu texto.',
    passo4: 'Só depois escolha a frase da imagem: ela abre o que a legenda entrega, e não o contrário.',
    passo5: 'Descreva a imagem: o que aparece, como é a foto ou a cena, onde entra o texto.',
    entrega: [
      'O que eu repito do original: uma linha.',
      'A frase da imagem (até 12 palavras) e a descrição da imagem.',
      'A legenda, em parágrafos curtos, terminando no que a pessoa faz no destino.',
      'Mais 2 opções de frase pra imagem.',
    ],
  },
  carousel: {
    nome: 'carrossel',
    passo3: 'Escreva o raciocínio corrido, como eu falaria num áudio pra uma cliente, do começo ao fim, sem dividir em telas. Use as palavras da minha cliente e o ritmo do meu texto.',
    passo4: 'Só depois escreva a capa: a primeira tela abre o que o carrossel entrega. Ela nasce do raciocínio, não antes dele.',
    passo5: 'Divida em telas, de 4 a 7, uma ideia por tela, com o texto de cada uma. A última tela pede a ação.',
    entrega: [
      'O que eu repito do original: uma linha.',
      'As telas, numeradas, com o texto de cada uma.',
      'Mais 2 opções de capa.',
      'Legenda: até 3 linhas, terminando no que a pessoa faz no destino.',
    ],
  },
}

function entregaDe(fmt) {
  return fmt.entrega.join('\n')
}

export function buildPrompt({ ad, collectionTitle, collectionSlug, ficha = {} }) {
  if (isPage(ad)) return buildPromptPagina({ ad, ficha })

  const fmt = FORMATOS[ad.media_type] || FORMATOS.video
  const objetivos = (ad.objectives || []).map(o => OBJECTIVE_LABELS[o] || o.replace(/-/g, ' '))
  const nichos = (ad.niches || []).map(n => NICHE_LABELS[n] || n).join(', ')
  const duracao = fmt === FORMATOS.video ? `\nDuração da minha versão: ${duracaoDe(ad, collectionSlug)}` : ''
  const destinoVazio = !v(ficha, 'destino')

  return `Vou ${fmt === FORMATOS.video ? 'gravar' : 'montar'} um anúncio meu inspirado num anúncio que funcionou. Quero ${fmt === FORMATOS.video ? 'a fala pronta' : 'o texto pronto'}, na minha voz, seguindo a mesma sequência do original.

O ANÚNCIO ORIGINAL
Formato: ${fmt.nome}${duracao}
${collectionTitle ? `Coleção: ${collectionTitle}\n` : ''}${objetivos.length ? `Objetivo: ${objetivos.join(' e ')}\n` : ''}${nichos ? `Nicho de quem anunciou: ${nichos}\n` : ''}O que ele faz, segundo o Acervo:
"""
${(ad.analysis || '').trim()}
"""

O MEU NEGÓCIO
${blocoMeuNegocio(ficha)}

COMO FAZER
1. Sem me mostrar, escreva a sequência do anúncio original em 3 a 6 passos curtos, na ordem em que acontecem. É essa sequência que a minha versão repete. As frases e as palavras do original e da análise, não.
2. Para cada passo, veja se eu te dei material de verdade. Se faltar algo que o passo precisa (um caso com contexto, o que a pessoa ganha ao clicar, um detalhe de como eu trabalho${destinoVazio ? ', pra onde o anúncio leva' : ''}), pare e me pergunte antes de escrever. No máximo 3 perguntas, numa mensagem só. Nunca preencha o buraco com frase genérica.${v(ficha, 'destino') && v(ficha, 'ganha') === '' ? ' Se o destino da minha versão for diferente do original, me pergunte o que a pessoa ganha ao clicar e ajuste o fim.' : ''}
3. ${fmt.passo3}
4. ${fmt.passo4}
5. ${fmt.passo5}

NÃO ESCREVA
${blocoNaoEscreva()}

Antes de entregar, leia o texto como se fosse eu falando com uma cliente olhando no olho. Corte toda frase que eu não diria.

ME ENTREGUE
${entregaDe(fmt)}`
}

// Páginas: o mesmo esqueleto, trocando o passo 3 e a entrega. A própria
// página é o destino, então não tem "pra onde leva".
export function buildPromptPagina({ ad, ficha = {} }) {
  const tipo = (PAGE_TYPE_LABELS[ad.page_type] || 'Página').toLowerCase()
  const nichos = (ad.niches || []).map(n => NICHE_LABELS[n] || n).join(', ')

  return `Vou montar uma página minha inspirada numa página que funcionou. Quero o texto de cada bloco pronto, na minha voz, seguindo a mesma sequência da original.

A PÁGINA ORIGINAL
Tipo: ${tipo}${nichos ? `\nNicho de quem usou: ${nichos}` : ''}
O que ela faz, segundo o Acervo:
"""
${(ad.analysis || '').trim()}
"""

O MEU NEGÓCIO
${blocoMeuNegocio(ficha, { comDestino: false })}

COMO FAZER
1. Sem me mostrar, escreva a sequência da página original em 4 a 8 blocos, na ordem em que a pessoa rola. É essa sequência que a minha página repete. As frases e as palavras da original e da análise, não.
2. Para cada bloco, veja se eu te dei material de verdade. Se faltar algo que o bloco precisa (uma prova com contexto, uma garantia real, o que acontece depois do botão, o que está incluído), pare e me pergunte antes de escrever. No máximo 3 perguntas, numa mensagem só. Nunca preencha o buraco com frase genérica.
3. Escreva o texto da página corrido, de cima pra baixo, como eu explicaria pra uma cliente que me pediu pra contar o que é. Use as palavras da minha cliente e o ritmo do meu texto. Texto de página é curto: frases que cabem numa linha de celular.
4. Só depois escreva o título da primeira dobra: ele abre o que a página entrega. Nasce do texto, não antes dele.
5. Divida o texto nos blocos, com o título de cada bloco e o texto dos botões.

NÃO ESCREVA
${blocoNaoEscreva(['Bloco que a original não tem só pra parecer completo. Se a original pula uma etapa, a minha também pula.'])}

Antes de entregar, leia a página como se fosse eu explicando pra uma cliente olhando no olho. Corte toda frase que eu não diria.

ME ENTREGUE
O que eu repito da original: uma linha.
Os blocos, na ordem: título do bloco, texto e, quando tiver, o texto do botão.
Mais 2 opções de título pra primeira dobra.`
}

// ── Ficha em texto (pro Kit) ──
// A mesma ficha do "Fazer a minha versão", em texto pra copiar e preencher.
export const FICHA_TEXTO = `FICHA DO MEU NEGÓCIO (preencha uma vez e guarde)

O que eu vendo:
Tipo de negócio (negócio local, prestação de serviço, infoproduto ou e-commerce):
Pra quem, com detalhe (segmento, cargo, momento de vida):
O que muda pra ela (o resultado, não o produto):
Como a minha cliente fala do problema, com as palavras dela:
Uma prova real, com contexto (de quem, o que mudou, em quanto tempo):
O "mas" que eu mais ouço:
Preço ou condição real (se não tiver, deixe em branco):
Pra onde o anúncio leva e o que a pessoa ganha ao clicar:
Um texto meu, pra IA pegar o meu jeito de falar (uma legenda ou a transcrição de um áudio):
Eu nunca diria:`
