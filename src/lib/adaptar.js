// "Fazer a minha versão": monta, a partir da análise de um anúncio do Acervo,
// um prompt que destrincha a análise pela lente da coleção (objetivo) e guia a
// adaptação para o negócio da aluna. Nada aqui é regra: as lentes orientam a
// leitura, a IA decide com o que a aluna responder.

import { OBJECTIVE_LABELS, MEDIA_LABELS, NICHE_LABELS } from './catalog'

export const DESTINOS = ['WhatsApp', 'Site', 'Página de vendas', 'Perfil', 'Direct']

export const CAMPOS = [
  { key: 'vendo', label: 'O que você vende', ajuda: 'Produto ou serviço, em poucas palavras.', placeholder: 'Ex.: consultoria de imagem' },
  { key: 'cliente', label: 'Pra quem', ajuda: 'Quem é a cliente que você quer atrair.', placeholder: 'Ex.: mulheres acima de 40 que voltaram a trabalhar' },
  { key: 'muda', label: 'O que muda pra ela', ajuda: 'O resultado que ela leva, não o produto.', placeholder: 'Ex.: se veste em 5 minutos, sem dúvida' },
  { key: 'preco', label: 'Preço ou condição', ajuda: 'Valor, parcelamento, prazo. Só se for real.', placeholder: 'Ex.: R$ 497 em 12x · só até domingo' },
  { key: 'prova', label: 'Uma prova real', ajuda: 'Número, depoimento, antes e depois. Vazio, a IA não inventa.', placeholder: 'Ex.: 120 clientes atendidas · depoimento da Carla' },
  { key: 'objecao', label: 'O "mas" que você mais ouve', ajuda: 'A desculpa de quando a cliente quer mas não fecha.', placeholder: 'Ex.: "é caro" · "não tenho tempo"' },
]

export const TONS = ['Direta', 'Leve e divertida', 'Acolhedora', 'Elegante', 'Provocadora', 'Técnica e precisa']

// Quais campos extras aparecem conforme a coleção do anúncio (os básicos aparecem sempre).
// Anúncio sem objetivo mostra todos.
export const CAMPOS_POR_OBJETIVO = {
  preco: ['vender-agora', 'quebrar-o-mas'],
  prova: ['provar-que-funciona', 'vender-agora', 'mostrar-que-voce-entende'],
  objecao: ['quebrar-o-mas', 'vender-agora'],
}

// Objetivo que vale para as perguntas: a coleção em que a aluna abriu o anúncio
// (se for uma coleção por objetivo) ou, fora dela, as tags do próprio anúncio.
export function objetivosDoContexto(ad, collectionSlug) {
  if (collectionSlug && LENTES[collectionSlug]) return [collectionSlug]
  return ad.objectives || []
}

export function camposPara(ad, collectionSlug) {
  const objs = objetivosDoContexto(ad, collectionSlug)
  return CAMPOS.filter(c => {
    const regra = CAMPOS_POR_OBJETIVO[c.key]
    return !regra || objs.length === 0 || regra.some(o => objs.includes(o))
  })
}

export const TIPOS = ['Infoproduto', 'E-commerce', 'Negócio local', 'Serviço']

export const DESTINO_AJUDA = 'Pra onde a pessoa vai quando toca no anúncio.'

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

// O que a IA entrega como peça, conforme o tipo do anúncio de referência
const ENTREGA_POR_MIDIA = {
  video: { titulo: 'Roteiro do vídeo', texto: 'cena por cena, de 15 a 30 segundos. Em cada cena: o que aparece na tela, o que eu falo (ou o texto na tela) e quando entra o corte' },
  image: { titulo: 'A imagem', texto: 'o texto que vai na imagem (até 12 palavras) e como é a foto ou a cena' },
  carousel: { titulo: 'O carrossel', texto: 'de 4 a 6 telas, uma ideia por tela: o texto de cada tela e o que aparece nela' },
  pdf: { titulo: 'A página', texto: 'os blocos na ordem (título, promessa, prova, oferta, chamada), com o texto de cada um' },
}

export function buildPrompt({ ad, collectionTitle, collectionSlug, ficha }) {
  // Só a lente da coleção em que a aluna abriu o anúncio (fora de coleção, as tags dele)
  const objetivos = objetivosDoContexto(ad, collectionSlug).filter(o => LENTES[o])
  const nomes = objetivos.map(o => OBJECTIVE_LABELS[o]).join(' e ')
  const nichos = (ad.niches || []).map(n => NICHE_LABELS[n] || n).join(', ')
  const midia = (MEDIA_LABELS[ad.media_type] || ad.media_type || 'vídeo').toLowerCase()
  const peca = ENTREGA_POR_MIDIA[ad.media_type] || ENTREGA_POR_MIDIA.video

  // As lentes ficam só no raciocínio da IA; a aluna recebe a versão pronta
  const lentes = [...new Set([...objetivos.flatMap(o => LENTES[o]), ...LENTE_GERAL.slice(3)])]
  // Campo que não aparece nesse anúncio não entra no prompt, mesmo que a aluna
  // tenha preenchido em outro anúncio (a ficha fica salva no aparelho)
  const visiveis = new Set(camposPara(ad, collectionSlug).map(c => c.key))
  const v = k => (CAMPOS.some(c => c.key === k) && !visiveis.has(k) ? '' : (ficha[k] || '').trim())
  const linhas = [
    v('vendo') ? `O que eu vendo: ${v('vendo')}` : null,
    v('tipo') ? `Tipo de negócio: ${v('tipo')}` : null,
    v('cliente') ? `Pra quem: ${v('cliente')}` : null,
    v('muda') ? `O que muda pra ela: ${v('muda')}` : null,
    v('preco') ? `Preço ou condição real: ${v('preco')}` : null,
    v('destino') ? `Pra onde o anúncio leva: ${v('destino')}` : null,
    v('prova') ? `Prova real que eu posso usar: ${v('prova')}` : visiveis.has('prova') ? 'Prova real que eu posso usar: nenhuma informada (não invente)' : null,
    v('objecao') ? `O "mas" que eu mais ouço das clientes: ${v('objecao')}` : null,
    (v('tons') || v('tomOutro')) ? `Como eu falo: ${[v('tons'), v('tomOutro')].filter(Boolean).join(', ')}` : null,
  ].filter(Boolean)
  const meu = linhas.length ? linhas.join('\n') : '(ainda não informei nada)'

  const faltando = [
    !v('vendo') ? 'o que eu vendo' : null,
    !v('cliente') ? 'pra quem' : null,
  ].filter(Boolean)

  const sugestaoDestino = objetivos.map(o => DESTINO_SUGESTAO[o]).filter(Boolean)[0]
  const destino = v('destino')

  return `Quero fazer a minha versão de um anúncio do Acervo de Anúncios do AVVA Hub. Me entregue a versão pronta pra eu gravar ou montar. Não me explique a análise.

ANÚNCIO DE REFERÊNCIA
Título: ${ad.title}
Tipo: ${midia}${nichos ? `\nNicho de quem anunciou: ${nichos}` : ''}${collectionTitle ? `\nColeção: ${collectionTitle}` : ''}${nomes ? `\nObjetivo: ${nomes}` : ''}

Por que funciona, segundo o Acervo:
"""
${(ad.analysis || '').trim()}
"""

MEU NEGÓCIO
${meu}

COMO TRABALHAR (isso é pra você, não precisa me mostrar)
- A minha versão tem que repetir o que faz esse anúncio funcionar, segundo a análise: a mesma lógica, na mesma ordem, com o meu produto, a minha cliente e o meu jeito de falar. Volte na análise a cada parte da entrega.
- Pra entender o que faz ele funcionar, pense em:
${lentes.map(l => `  · ${l}`).join('\n')}
- Não copie frases do anúncio de referência. Não invente prova, número, desconto, prazo ou história: use só o que está aqui.
- Escreva como gente fala, sem jargão de marketing e sem travessão.
- Se tiver uma dúvida que muda a versão, pode me perguntar, mas de forma direta e curta.${faltando.length ? `\n- Se faltar ${faltando.join(' ou ')}, me pergunte isso primeiro, numa mensagem só, e espere a resposta.` : ''}

O QUE ME ENTREGAR
Direto, nessa ordem, sem introdução e sem resumo no fim:

Por que funciona: até 2 frases. Por que o anúncio de referência funciona e o que eu vou repetir dele na minha versão.

3 ganchos: de até 12 palavras, cada um de um jeito. Marque o melhor.

${peca.titulo}: ${peca.texto}. Use o melhor gancho.

Legenda: curta, terminando com a chamada ${destino ? `pro ${destino}` : 'pro destino'}.${!destino ? `\n\nDestino: escolha um (WhatsApp, site, página de vendas, perfil ou direct) e diga por quê em uma linha.${sugestaoDestino ? ` Referência: ${sugestaoDestino}` : ''}` : ''}

Pra confirmar: só se faltar algo que mude a versão (uma prova real, uma condição), me faça até 2 perguntas curtas. Se não faltar nada, pule essa parte.`
}

export function linkChatGPT(prompt) {
  return `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`
}

export function linkClaude(prompt) {
  return `https://claude.ai/new?q=${encodeURIComponent(prompt)}`
}
