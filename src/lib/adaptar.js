// "Fazer a minha versão": monta, a partir da análise de um anúncio do Acervo,
// um prompt pronto para a IA escrever a versão da aluna. Nada é obrigatório:
// se ela não disser o que vende, a IA pergunta antes de escrever.

import { MEDIA_LABELS } from './catalog'

export const DESTINOS = ['WhatsApp', 'Site', 'Página de vendas', 'Perfil', 'Direct']

const CHAVE = 'avva.ficha'

export function loadFicha() {
  try { return JSON.parse(localStorage.getItem(CHAVE) || '{}') } catch { return {} }
}

export function saveFicha(ficha) {
  try { localStorage.setItem(CHAVE, JSON.stringify(ficha)) } catch { /* sem armazenamento, segue sem salvar */ }
}

const ENTREGA_POR_MIDIA = {
  video: 'o roteiro de 15 a 30 segundos (o que aparece e o que é dito)',
  image: 'o texto da imagem e a descrição da cena',
  carousel: 'o texto de cada tela do carrossel',
  pdf: 'o texto da página, bloco por bloco',
}

export function buildPrompt({ ad, collectionTitle, ficha }) {
  const midia = MEDIA_LABELS[ad.media_type] || ad.media_type || 'vídeo'
  const entrega = ENTREGA_POR_MIDIA[ad.media_type] || ENTREGA_POR_MIDIA.video
  const negocio = (ficha.negocio || '').trim()
  const destino = (ficha.destino || '').trim()

  const sobreMim = negocio
    ? `Meu negócio: ${negocio}${destino ? `\nO anúncio leva para: ${destino}` : ''}`
    : `Antes de escrever, me pergunte o que eu vendo, pra quem, e pra onde o anúncio leva. Espere a resposta.`

  return `Quero fazer a minha versão deste anúncio.

Anúncio de referência: "${ad.title}" (${midia.toLowerCase()}${collectionTitle ? `, coleção ${collectionTitle}` : ''}).

Por que ele funciona:
${(ad.analysis || '').trim()}

${sobreMim}

Use a mesma ideia que a análise explica, mas com o meu produto, a minha cliente e as minhas palavras. Não copie frases do anúncio original. Não invente prova, número, desconto ou prazo. Escreva como gente fala.

Me entregue:
1. Três opções de gancho.
2. Com o melhor gancho, ${entrega}.
3. A legenda, curta, com a chamada no fim.`
}

export function linkChatGPT(prompt) {
  return `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`
}
