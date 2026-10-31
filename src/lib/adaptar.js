// "Fazer a minha versão": monta, a partir da análise de um anúncio do Acervo,
// um prompt pronto para a IA escrever a versão da aluna. Nada é obrigatório:
// se ela não disser o que vende, a IA pergunta antes de escrever.

import { OBJECTIVE_LABELS, MEDIA_LABELS } from './catalog'

export const DESTINOS = ['WhatsApp', 'Site', 'Página de vendas', 'Perfil', 'Direct']

const CHAVE = 'avva.ficha'

export function loadFicha() {
  try { return JSON.parse(localStorage.getItem(CHAVE) || '{}') } catch { return {} }
}

export function saveFicha(ficha) {
  try { localStorage.setItem(CHAVE, JSON.stringify(ficha)) } catch { /* sem armazenamento, segue sem salvar */ }
}

// O que cada coleção por objetivo quer que a pessoa faça no fim
const OBJETIVO_NOTA = {
  'ser-descoberta': 'chamar a atenção de quem nunca viu a marca; no fim ela segue ou salva, não compra',
  'mostrar-que-voce-entende': 'mostrar que a dona do negócio entende do problema e construir confiança',
  'provar-que-funciona': 'tirar a dúvida "será que funciona?" com prova real e contexto',
  'quebrar-o-mas': 'responder ao motivo que trava a compra e virar com argumento concreto',
  'vender-agora': 'pedir a compra com clareza: o que é, pra quem, por que agora, como comprar',
}

const ENTREGA_POR_MIDIA = {
  video: 'o roteiro de 15 a 30 segundos (tempo, o que aparece, o que é dito)',
  image: 'o texto da imagem (até 12 palavras) e a descrição da cena',
  carousel: 'o texto de cada tela de um carrossel de 4 a 6 telas',
  pdf: 'a estrutura da página em blocos, com o texto de cada bloco',
}

export function buildPrompt({ ad, collectionTitle, ficha }) {
  const objetivos = (ad.objectives || []).map(o => `${OBJECTIVE_LABELS[o] || o}: ${OBJETIVO_NOTA[o] || ''}`)
  const midia = MEDIA_LABELS[ad.media_type] || ad.media_type || 'vídeo'
  const entrega = ENTREGA_POR_MIDIA[ad.media_type] || ENTREGA_POR_MIDIA.video
  const negocio = (ficha.negocio || '').trim()
  const destino = (ficha.destino || '').trim()

  const sobreMim = negocio
    ? `O MEU NEGÓCIO\n${negocio}${destino ? `\nO anúncio leva para: ${destino}` : ''}`
    : `O MEU NEGÓCIO\nAntes de escrever, me pergunte em uma mensagem só: o que eu vendo e pra quem, e pra onde o anúncio leva (WhatsApp, site, perfil…). Espere a resposta.`

  return `Me ajude a fazer a MINHA versão de um anúncio do Acervo de Anúncios do Método AVVA. Você escreve como gente fala, sem jargão de marketing, e não inventa prova, número, desconto ou prazo.

O ANÚNCIO DE REFERÊNCIA
Título: ${ad.title}
Tipo: ${midia}${collectionTitle ? `\nColeção: ${collectionTitle}` : ''}${objetivos.length ? `\nObjetivo: ${objetivos.join(' | ')}` : ''}
Por que funciona (análise do Acervo):
"""
${(ad.analysis || '').trim()}
"""

${sobreMim}

O QUE EU QUERO
Reaproveite o que a análise destaca (o que o anúncio faz e por que isso muda a decisão de quem vê), mas com o meu produto, a minha cliente e as minhas palavras. Não copie frases do anúncio de referência. Se eu não tiver prova real, não use prova.

Me entregue pronto para usar:
1. Três opções de gancho, de até 12 palavras.
2. Com o melhor gancho, ${entrega}.
3. A legenda, curta, terminando com a chamada para onde o anúncio leva.

No fim, em uma frase: o que na minha versão faz o mesmo papel do que a análise destacou.`
}

export function linkChatGPT(prompt) {
  return `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`
}
