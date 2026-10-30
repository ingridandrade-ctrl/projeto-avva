// "Adaptar pra mim": monta, a partir da análise de um anúncio do Acervo e de
// uma ficha curta da aluna, um prompt pronto para a IA escrever a versão dela.

import { OBJECTIVE_LABELS, MEDIA_LABELS, NICHE_LABELS } from './catalog'

export const FICHA_CAMPOS = [
  { key: 'vendo', label: 'O que você vende', placeholder: 'Ex.: consultoria de imagem pra mulheres acima de 40' },
  { key: 'cliente', label: 'Pra quem', placeholder: 'Ex.: mulheres que voltaram a trabalhar e não sabem o que vestir' },
  { key: 'muda', label: 'O que muda pra ela', placeholder: 'Ex.: abre o guarda-roupa e se veste em 5 minutos, sem dúvida' },
  { key: 'destino', label: 'Pra onde o anúncio leva', placeholder: 'Ex.: WhatsApp, site, página de vendas, perfil' },
  { key: 'prova', label: 'Uma prova real (opcional)', placeholder: 'Ex.: 120 clientes atendidas, depoimento da Carla…' },
]

const CHAVE = 'avva.ficha'

export function loadFicha() {
  try { return JSON.parse(localStorage.getItem(CHAVE) || '{}') } catch { return {} }
}

export function saveFicha(ficha) {
  try { localStorage.setItem(CHAVE, JSON.stringify(ficha)) } catch { /* sem armazenamento, segue sem salvar */ }
}

export function fichaCompleta(ficha) {
  return ['vendo', 'cliente', 'muda', 'destino'].every(k => (ficha[k] || '').trim())
}

// O que cada coleção por objetivo quer que a pessoa faça no fim
const OBJETIVO_NOTA = {
  'ser-descoberta': 'fazer quem nunca viu a marca parar o dedo e querer conhecer; no fim ela segue ou salva, não compra',
  'mostrar-que-voce-entende': 'mostrar que a dona do negócio entende do problema e construir confiança antes de pedir a venda',
  'provar-que-funciona': 'tirar a dúvida "será que funciona?" com prova real e contexto de quem, qual problema e o que mudou',
  'quebrar-o-mas': 'responder, com as palavras da cliente, ao motivo que trava a compra, e virar com argumento concreto',
  'vender-agora': 'pedir a compra com clareza: o que é, pra quem, o que ganha, por que agora e como comprar',
}

const ENTREGA_POR_MIDIA = {
  video: 'Roteiro de 15 a 30 segundos em tabela com três colunas: tempo, o que aparece na tela, o que é dito.',
  image: 'O texto da imagem (até 12 palavras) e a descrição da cena ou da foto, em duas linhas.',
  carousel: 'O texto de cada tela de um carrossel de 4 a 6 telas, uma ideia por tela, a última com a chamada.',
  pdf: 'A estrutura da página em blocos (título, promessa, prova, oferta, chamada), com o texto de cada bloco.',
}

export function buildPrompt({ ad, collectionTitle, ficha }) {
  const objetivos = (ad.objectives || []).map(o => `${OBJECTIVE_LABELS[o] || o} (${OBJETIVO_NOTA[o] || ''})`)
  const nichos = (ad.niches || []).map(n => NICHE_LABELS[n] || n).join(', ')
  const midia = MEDIA_LABELS[ad.media_type] || ad.media_type || 'vídeo'
  const entrega = ENTREGA_POR_MIDIA[ad.media_type] || ENTREGA_POR_MIDIA.video
  const prova = (ficha.prova || '').trim() || 'nenhuma por enquanto (não invente nenhuma)'
  const destino = (ficha.destino || '').trim() || 'o lugar que eu disser'

  return `Você é uma estrategista de comunicação de pequenos negócios no Brasil. Me ajude a fazer a MINHA versão de um anúncio que está no Acervo de Anúncios do Método AVVA.

O ANÚNCIO DE REFERÊNCIA
Título: ${ad.title}
Tipo: ${midia}${nichos ? `\nNicho do anunciante: ${nichos}` : ''}${collectionTitle ? `\nColeção: ${collectionTitle}` : ''}${objetivos.length ? `\nObjetivo do anúncio: ${objetivos.join('; ')}` : ''}
Por que funciona (análise do Acervo):
"""
${(ad.analysis || '').trim()}
"""

O MEU NEGÓCIO
O que eu vendo: ${(ficha.vendo || '').trim()}
Para quem: ${(ficha.cliente || '').trim()}
O que muda para a minha cliente: ${(ficha.muda || '').trim()}
Para onde o anúncio leva: ${destino}
Prova real que eu posso usar: ${prova}

O QUE EU QUERO
Reaproveite o mecanismo que a análise destaca (o que o anúncio faz e por que isso muda a decisão de quem vê), mas com o meu produto, a minha cliente e as minhas palavras. Não copie frases do anúncio de referência. Não invente prova, número, desconto, prazo ou história. Linguagem falada, sem jargão de marketing. Sem travessão no texto.

Entregue, nesta ordem:
1. Em uma frase, o mecanismo do anúncio de referência que vamos reaproveitar.
2. Três ganchos de até 12 palavras, de tipos diferentes.
3. ${entrega}
4. Uma legenda curta, em até três parágrafos, terminando com a chamada para ${destino}.
5. Uma checagem: o que, na minha versão, faz o mesmo papel do elemento que a análise destacou? Se nada faz, diga e corrija.

Se faltar alguma informação sobre o meu negócio, pergunte antes de escrever.`
}

export function linkChatGPT(prompt) {
  return `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`
}

export function linkClaude(prompt) {
  return `https://claude.ai/new?q=${encodeURIComponent(prompt)}`
}
