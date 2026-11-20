import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { COLLECTIONS } from '../../lib/catalog'
import { TIPOS, TONS, DESTINOS } from '../../lib/adaptar'
import './AcervoPage.css'

// ══════════════════════════════════════════════════════════════
// Página de vendas do Acervo de Anúncios (low ticket, tráfego frio
// do Instagram). Tudo que muda com a oferta fica aqui em cima.
// ══════════════════════════════════════════════════════════════
const OFERTA = {
  checkoutUrl: 'https://pay.cakto.com.br/kcpowk4',
  precoDe: 'R$ 107',   // valor cheio, aparece riscado acima do preço ('' esconde)
  preco: 'R$ 67',
  precoNota: 'Preço de lançamento', // etiqueta ao lado do preço ('' esconde)
  parcelas: '',        // AJUSTAR: parcelamento do checkout, ex.: 'ou 9x de R$ 11,38' ('' esconde)
  reforco: 'Dá menos de R$ 0,20 por dia. Um anúncio que não vende custa mais que isso.',
  garantiaDias: 7,
  acessoPor: '1 ano',           // AJUSTAR: tempo de acesso prometido
  totalColecoes: 6,
  // Julia sugeriu R$ 97 (confirmar com a Flora antes de publicar): troque preco e precoDe
  // Vídeo do acervo por dentro (gravação de tela do celular). Vazio = mostra o mockup no lugar.
  videoUrl: '',                 // AJUSTAR: link do YouTube/Vimeo ou arquivo .mp4 em public/acervo/
  videoPoster: '/acervo/tela-acervo.webp',
}

// Prints do passo a passo (AJUSTAR: trocar pelos prints reais da área de membros no celular)
const PASSOS_PRINTS = [
  { n: '1', titulo: 'Você entra e escolhe o objetivo', texto: 'Atrair seguidores, captar leads, provar que funciona, vender agora. Cada coleção é um momento do funil, e você entra pela porta que precisa hoje.', src: '/acervo/tela-acervo.webp', alt: 'Tela das coleções na área de membros' },
  { n: '2', titulo: 'Filtra pelo seu nicho', texto: 'Negócio local, prestação de serviço, infoproduto ou e-commerce. Você vê só o que serve pro seu caso.', src: '', alt: 'Print: filtro por nicho dentro de uma coleção' },
  { n: '3', titulo: 'Abre o anúncio, lê a análise e faz a sua versão', texto: 'A análise explica por que ele vende. Do lado, o botão Fazer a minha versão: você preenche nicho e tom de voz e abre direto na sua IA.', src: '', alt: 'Print: anúncio aberto com a análise e o botão Fazer a minha versão' },
]

const NICHOS = ['Negócio local', 'Prestação de serviço', 'Infoproduto', 'E-commerce']

// Quem faz o acervo: fotos da colagem (AJUSTAR: colocar 5 fotos em public/acervo/quem/, 1.jpg a 5.jpg)
const QUEM_FOTOS = [
  { src: '/acervo/quem/1.jpg', alt: 'Flora e Ingrid num mirante' },
  { src: '/acervo/quem/2.jpg', alt: 'Flora e Ingrid no Rio' },
  { src: '/acervo/quem/3.jpg', alt: 'Flora e Ingrid se abraçando' },
  { src: '/acervo/quem/4.jpg', alt: 'Flora e Ingrid trabalhando' },
  // { src: '/acervo/quem/5.jpg', alt: 'Quinta foto' }, // quando chegar, é só descomentar
]

// Depoimentos de quem já comprou (AJUSTAR: colar os reais; nome e nicho). Vazio = seção não aparece.
const DEPOIMENTOS = [
  // { nome: 'Nome', nicho: 'Clínica de estética', texto: '...' },
]

const PRA_QUEM = [
  <><strong>Tem um negócio local, presta serviço, vende infoproduto ou tem e-commerce</strong> e roda (ou quer rodar) os próprios anúncios</>,
  <><strong>Acabou de colocar um produto no mundo</strong> e está sem ideia de anúncio</>,
  <><strong>Cansou de garimpar referência sozinha</strong> e quer entender por que cada uma funciona</>,
  <><strong>Prefere ver o que já funciona</strong> antes de inventar o seu</>,
]

// Coleções mostradas nos cards (as 6 por objetivo + a curadoria mensal)
const COLECOES = [
  ...COLLECTIONS.filter(c => !c.retired && !c.isBonus).sort((a, b) => a.order - b.order).map(c => ({
    slug: c.slug,
    titulo: c.title,
    subtitulo: c.subtitle,
    kicker: c.isBonus ? 'Bônus' : `Coleção ${String(c.order).padStart(2, '0')}`,
    gradient: c.gradient,
  })),
  {
    slug: 'melhores-do-mes',
    titulo: 'Melhores do mês',
    subtitulo: 'Curadoria nova todo mês',
    kicker: 'Todo mês',
    gradient: 'linear-gradient(135deg, #3F7A66 0%, #8A5C3F 55%, #D4B99A 100%)',
  },
]

// Bônus: entram junto com o acervo, sem custo
const BONUS = [
  { titulo: 'Especial Black Friday', texto: 'As páginas e os criativos que venderam na Black Friday, com a análise do que fez cada um funcionar.', capa: '/acervo/capa-black.webp' },
  { titulo: 'Especial Mini VSL', texto: 'Anúncios mais longos, de 1 a 3 minutos, que vendem sozinhos. Pra quem quer entender como se segura atenção até a oferta.', capa: '/acervo/capa-minivsl.webp' },
  { titulo: 'Especial Páginas', texto: 'Páginas de vendas, captura, obrigado e serviço, com a análise do que faz cada uma converter. E a nossa ferramenta monta a sua, bloco por bloco.', capa: '/acervo/capa-paginas.webp' },
]

// A ferramenta, passo a passo, do jeito que acontece lá dentro
const FERRAMENTA_PASSOS = [
  {
    n: '1',
    titulo: 'Você abre um anúncio. O botão está do lado.',
    texto: 'Em todo anúncio e página do acervo, logo abaixo da análise, tem o botão Fazer a minha versão. Não é uma aba separada nem um prompt solto pra copiar: é ali, ao lado do anúncio que você acabou de entender.',
  },
  {
    n: '2',
    titulo: 'Preenche a sua ficha uma vez.',
    texto: 'O que você vende, pra quem, o que muda pra ela, uma prova real, o "mas" que você mais ouve. Nada é obrigatório, e fica salvo no seu celular. Na próxima vez, está tudo lá.',
  },
  {
    n: '3',
    titulo: 'Escolhe como você escreve.',
    texto: 'Direta, leve, acolhedora, elegante, provocadora, técnica. Cada tom vira uma regra concreta pra IA, não um adjetivo. E se você colar um texto seu, uma legenda ou um áudio transcrito, ela imita o seu ritmo e as suas palavras.',
  },
  {
    n: '4',
    titulo: 'Diz pra onde o anúncio leva.',
    texto: 'WhatsApp, site, página de vendas, perfil, direct. E o que a pessoa ganha ao clicar. A ferramenta já sugere o destino mais comum pra aquele tipo de anúncio.',
  },
  {
    n: '5',
    titulo: 'Abre no ChatGPT ou no Claude. Pronto.',
    texto: 'Um toque e a sua IA abre com tudo montado: a sequência do anúncio original, a análise, a sua ficha e as regras. Ela escreve a sua versão com a mesma duração, na sua voz, com a sua prova. Se faltar alguma informação, ela pergunta antes de escrever, em vez de inventar.',
  },
]

// O que a ferramenta garante (vem das regras que o prompt carrega)
const FERRAMENTA_REGRAS = [
  { titulo: 'Não copia o original', texto: 'Ela repete a sequência (gancho, desenvolvimento, prova, fechamento), nunca as frases. O anúncio é seu.' },
  { titulo: 'Não inventa número', texto: 'Prova, preço, prazo e garantia só entram se você deu. Sem prova, ela não cria uma.' },
  { titulo: 'Pergunta antes de chutar', texto: 'Se faltar material pra algum passo, ela para e pergunta, no máximo três coisas, numa mensagem só.' },
  { titulo: 'Sem cara de IA', texto: 'A lista do que ela não pode escrever vai junto: validação pronta, pergunta retórica, frase de efeito, jargão, emoji, exclamação.' },
  { titulo: 'Funciona na versão gratuita', texto: 'ChatGPT ou Claude, sem plano pago. Prefere outra IA? É só copiar o prompt.' },
  { titulo: 'Vídeo, imagem, carrossel e página', texto: 'Cada formato tem a sua entrega: a fala e as cenas no vídeo, as telas no carrossel, os blocos e os botões na página.' },
]

// O que a IA entrega em cada formato, no "Fazer a minha versão"
const IA_SAIDAS = [
  { formato: 'Vídeo', itens: ['A fala completa, na sua voz, com a mesma duração do original', 'As cenas, uma a uma', '2 ganchos extras pra testar', 'A legenda do post'] },
  { formato: 'Imagem', itens: ['A frase da imagem', 'A descrição do visual pra você montar', 'A legenda do post'] },
  { formato: 'Carrossel', itens: ['De 4 a 7 telas, com o texto de cada uma', '2 opções de capa'] },
  { formato: 'Página', itens: ['Os blocos da página, na ordem', 'O texto de cada botão', '2 títulos de primeira dobra'] },
]

// Análises reais do acervo, do jeito que estão lá dentro
const ESPIADINHA = [
  {
    marca: '01',
    titulo: 'Diandra: "pega de surpresa"',
    tipo: 'Vídeo · Serviço e infoproduto',
    texto: 'A sacada começa no formato: o roteiro é estruturado, mas a gravação faz parecer que a especialista foi pega de surpresa e está simplesmente respondendo uma pergunta. Enquanto ela elimina uma alternativa depois da outra (postar todo dia, carrossel, impulsionar, social media), a curiosidade aumenta: se nenhuma dessas é a resposta, qual é?',
  },
  {
    marca: '02',
    titulo: 'Letícia Vaz Store',
    tipo: 'Vídeo · E-commerce',
    texto: 'Ela te prende num desafio, te ensina a vender e te converte em um minuto e meio. Dá vários exemplos mostrando a calça e falando as qualidades enquanto você fica curiosa pra ver todas as formas de vendê-la. Deu uma aula de marketing enquanto fazia uma venda.',
  },
  {
    marca: '03',
    titulo: 'Pedro Sobral: "Como sei que funciona pra mim?"',
    tipo: 'Imagem estática · Infoproduto',
    texto: 'Quebra de objeção com prova: a pergunta que a pessoa faz é respondida com um número (validado por 4.855 gestores atuantes).',
  },
]

// Checklist do que está incluído, dentro da oferta
const INCLUSO = [
  <><strong>Acervo vivo</strong>: anúncios novos toda semana, com a curadoria que a Flora faz pros clientes da agência</>,
  <><strong>Análise em cada anúncio</strong>: por que funciona e o que importa nele</>,
  <><strong>Fazer a minha versão</strong>, a nossa ferramenta, ao lado de todo anúncio e página</>,
  <><strong>{OFERTA.totalColecoes} coleções por objetivo</strong> e filtro por nicho: negócio local, serviço, infoproduto e e-commerce</>,
  <><strong>Melhores do mês</strong> e os três especiais: Black Friday, Mini VSL e Páginas</>,
  <><strong>{OFERTA.acessoPor} de acesso</strong>, com tudo que entrar nesse período</>,
]

const FAQ = [
  {
    q: 'Mas o meu nicho é diferente, isso não vai funcionar pra mim…',
    a: 'O acervo é organizado por objetivo do anúncio, não por nicho, e você ainda filtra por negócio local, serviço, infoproduto e e-commerce. A estrutura que faz uma loja de roupa vender é a mesma que faz uma nutricionista fechar agenda.',
  },
  {
    q: 'Mas eu já comprei curso de anúncio e não saí do lugar…',
    a: 'Isso não é curso. É referência pronta, com a análise do lado: você abre, escolhe pelo objetivo, lê por que funciona, faz a sua versão e coloca no ar. Dá pra publicar o primeiro ainda hoje.',
  },
  {
    q: 'Mas eu nem sei se vou ter tempo de usar…',
    a: 'Cada análise tem poucas linhas. Em dez minutos no celular você escolhe um anúncio, lê por que ele vende e sai com a sua versão pronta pra gravar.',
  },
  {
    q: 'O acesso é imediato?',
    a: 'Sim. Assim que o pagamento é aprovado, você recebe um e-mail e entra na área de membros com o mesmo e-mail da compra. No Pix e no cartão, leva minutos.',
  },
  {
    q: 'Funciona pro meu nicho?',
    a: 'O acervo é organizado por objetivo do anúncio (atrair seguidores, captar leads, mostrar que você entende, provar que funciona, quebrar o "mas...", vender agora), e não por nicho. A estrutura que faz uma loja de roupa vender é a mesma que faz uma nutricionista fechar agenda. E dá pra filtrar por negócio local, serviço, infoproduto e e-commerce.',
  },
  {
    q: 'A ferramenta vai fazer o anúncio por mim?',
    a: 'Ela escreve a sua versão, mas a partir do que você entendeu. Primeiro você lê a análise e vê por que aquele anúncio funciona. Depois preenche a sua ficha (o que vende, pra quem, uma prova real, como a sua cliente fala) e a ferramenta escreve na sua voz, com a sua prova, sem inventar número. O objetivo é você ganhar autonomia, e a ferramenta encurtar o caminho.',
  },
  {
    q: 'Preciso pagar ChatGPT ou Claude pra usar o gerador?',
    a: 'Não. A nossa ferramenta monta tudo pronto e abre na IA que você preferir, ChatGPT ou Claude, e funciona nas versões gratuitas. Se quiser usar outra, é só copiar.',
  },
  {
    q: 'O que são os bônus?',
    a: 'Três blocos que entram junto com o acervo, sem custo: o Especial Black Friday, com páginas e criativos que venderam na Black; o Especial Mini VSL, com anúncios de 1 a 3 minutos que vendem sozinhos; e o Especial Páginas, de vendas, captura, obrigado e serviço, com análise e a sua versão pela nossa ferramenta.',
  },
  {
    q: 'É só pra Instagram e Facebook ou serve pra outras plataformas?',
    a: 'Os anúncios do acervo rodam no Instagram e no Facebook. Em breve, também no TikTok. E a estrutura que a análise te mostra (gancho, prova, oferta) vale pra qualquer canal.',
  },
  {
    q: 'Preciso saber editar vídeo ou ter designer?',
    a: 'Não. Boa parte dos anúncios que mais vendem do acervo foi gravada no celular, sem edição elaborada. O que faz diferença é a estrutura, e é isso que a análise te mostra.',
  },
  {
    q: 'Posso copiar os anúncios?',
    a: 'A melhor referência não é a que você copia. É a que te faz entender por que funciona e adaptar a lógica pra sua comunicação. Gancho, sequência, prova e fechamento são a referência. O produto, a fala e o visual são seus.',
  },
  {
    q: 'Nunca rodei um anúncio. É pra mim?',
    a: 'É, se você quer começar pelo caminho mais curto: ver o que já dá certo antes de criar o seu. Aqui você não aprende a configurar campanha. Aprende o que colocar dentro dela.',
  },
  {
    q: 'Preciso de verba mínima pra usar o acervo?',
    a: 'Não. O acervo não é sobre quanto investir, e sim sobre o que colocar dentro do anúncio. Com verba pequena ou grande, criativo com estrutura rende mais.',
  },
  {
    q: 'Eu só impulsiono pelo Instagram. Serve pra mim?',
    a: 'Serve. Impulsionar também é anúncio, e o que decide se vende é o que está no post. Você escolhe a estrutura no acervo, adapta e impulsiona.',
  },
  {
    q: `Depois de ${OFERTA.acessoPor} de acesso, o que acontece?`,
    a: 'Durante esse período você tem tudo: as coleções, os anúncios novos que entram toda semana, as análises e a ferramenta. Perto do fim, a gente te avisa e você decide se quer renovar.',
  },
  {
    q: 'Tenho reembolso?',
    a: `Tem. São ${OFERTA.garantiaDias} dias de garantia. Entra, navega, lê as análises. Se não fizer sentido pra você, pede o reembolso e recebe 100% de volta, sem precisar explicar.`,
  },
]

function Seta() {
  return (
    <span className="lp-seta" aria-hidden="true">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="m6 13 6 6 6-6"/></svg>
    </span>
  )
}

function Cta({ children, variante = 'terracotta', largo = false }) {
  return (
    <a className={`lp-cta lp-cta--${variante} ${largo ? 'lp-cta--largo' : ''}`} href={OFERTA.checkoutUrl} rel="noopener">
      <i aria-hidden="true">✦</i>
      <span>{children}</span>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></svg>
    </a>
  )
}

// Aparece com um leve deslize quando entra na tela
function Reveal({ as: Tag = 'div', className = '', delay = 0, children, ...rest }) {
  const ref = useRef(null)
  const [vis, setVis] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || !('IntersectionObserver' in window)) { setVis(true); return }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); io.disconnect() } }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 })
    io.observe(el)
    // Garantia: se o observador não disparar (alguns webviews), aparece mesmo assim
    const t = setTimeout(() => setVis(true), 1800)
    return () => { io.disconnect(); clearTimeout(t) }
  }, [])
  return <Tag ref={ref} className={`lp-reveal ${vis ? 'is-in' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }} {...rest}>{children}</Tag>
}

// Miniatura do "Fazer a minha versão": os mesmos passos e opções do painel
// real, pra pessoa ver o que vai encontrar lá dentro
function PainelIA() {
  const [tipo, setTipo] = useState('Negócio local')
  const [tom, setTom] = useState('Direta')
  const [destino, setDestino] = useState('WhatsApp')
  const [formato, setFormato] = useState(0)
  const regra = TONS.find(t => t.nome === tom)?.regra

  return (
    <div className="lp-painel" aria-label="Como funciona o Fazer a minha versão">
      <div className="lp-painel__topo">
        <span className="lp-painel__ia">✦ Fazer a minha versão <small>com IA</small></span>
      </div>

      <div className="lp-painel__passo">
        <span className="lp-painel__num">1</span>
        <div>
          <strong>Seu negócio</strong>
          <div className="lp-painel__chips">
            {TIPOS.map(t => <button type="button" key={t} className={tipo === t ? 'is-on' : ''} onClick={() => setTipo(t)}>{t}</button>)}
          </div>
          <div className="lp-painel__campos">
            <span>O que você vende</span>
            <span>Pra quem, com detalhe</span>
            <span>O que muda pra ela</span>
            <span>Uma prova real, com contexto</span>
          </div>
        </div>
      </div>

      <div className="lp-painel__passo">
        <span className="lp-painel__num">2</span>
        <div>
          <strong>A sua voz</strong>
          <div className="lp-painel__campos">
            <span>Como a sua cliente fala do problema</span>
            <span>Um texto seu, do jeito que você fala</span>
          </div>
          <em className="lp-painel__rotulo">Como você escreve</em>
          <div className="lp-painel__chips">
            {TONS.map(t => <button type="button" key={t.nome} className={tom === t.nome ? 'is-on' : ''} onClick={() => setTom(t.nome)}>{t.nome}</button>)}
          </div>
          {regra && <p className="lp-painel__regra">{regra}</p>}
        </div>
      </div>

      <div className="lp-painel__passo">
        <span className="lp-painel__num">3</span>
        <div>
          <strong>Pra onde o anúncio leva</strong>
          <div className="lp-painel__chips">
            {DESTINOS.map(d => <button type="button" key={d} className={destino === d ? 'is-on' : ''} onClick={() => setDestino(d)}>{d}</button>)}
          </div>
        </div>
      </div>

      <div className="lp-painel__passo lp-painel__passo--final">
        <span className="lp-painel__num">4</span>
        <div>
          <strong>Agora é só abrir na IA</strong>
          <div className="lp-painel__ias">
            <span className="lp-painel__btn">Abrir no ChatGPT</span>
            <span className="lp-painel__btn lp-painel__btn--claude">Abrir no Claude</span>
          </div>
          <em className="lp-painel__rotulo">O que sai, por formato</em>
          <div className="lp-painel__formatos" role="tablist" aria-label="Formato">
            {IA_SAIDAS.map((f, i) => <button type="button" role="tab" aria-selected={formato === i} key={f.formato} className={formato === i ? 'is-on' : ''} onClick={() => setFormato(i)}>{f.formato}</button>)}
          </div>
          <ul className="lp-painel__saida">
            {IA_SAIDAS[formato].itens.map(it => <li key={it}>{it}</li>)}
          </ul>
        </div>
      </div>
    </div>
  )
}

// Card que inclina de leve seguindo o mouse (só em telas com cursor)
function CardColecao({ c, index }) {
  const ref = useRef(null)
  function move(e) {
    const el = ref.current
    if (!el || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    el.style.setProperty('--rx', `${(-y * 8).toFixed(2)}deg`)
    el.style.setProperty('--ry', `${(x * 10).toFixed(2)}deg`)
  }
  function leave() {
    const el = ref.current
    if (!el) return
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
  }
  return (
    <Reveal as="li" className={`lp-card ${index % 2 ? 'lp-card--areia' : 'lp-card--terra'}`} delay={index * 60}>
      <div ref={ref} className="lp-card__tilt" onMouseMove={move} onMouseLeave={leave}>
        <span className="lp-sticker lp-sticker--card">{c.kicker}</span>
        <Seta />
        <h3>{c.titulo}</h3>
        <p>{c.subtitulo}</p>
      </div>
    </Reveal>
  )
}

function CardBonus({ b, index }) {
  const ref = useRef(null)
  function move(e) {
    const el = ref.current
    if (!el || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    el.style.setProperty('--rx', `${(-y * 6).toFixed(2)}deg`)
    el.style.setProperty('--ry', `${(x * 8).toFixed(2)}deg`)
  }
  function leave() {
    const el = ref.current
    if (!el) return
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
  }
  return (
    <Reveal as="li" className="lp-bonus__card" delay={index * 80}>
      <div ref={ref} className="lp-bonus__tilt" onMouseMove={move} onMouseLeave={leave}>
        <img className="lp-bonus__capa" src={b.capa} alt="" loading="lazy" width="720" height="957" />
        <span className="lp-bonus__kicker">Bônus {String(index + 1).padStart(2, '0')}</span>
        <h3>{b.titulo}</h3>
        <p>{b.texto}</p>
      </div>
    </Reveal>
  )
}

// Selo redondo com texto girando em volta (adesivo)
function Selo({ id, texto, className = '' }) {
  return (
    <span className={`lp-selo ${className}`} aria-hidden="true">
      <svg viewBox="0 0 120 120" className="lp-selo__anel">
        <defs><path id={id} d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" /></defs>
        <text><textPath href={`#${id}`}>{texto}</textPath></text>
      </svg>
      <i>✦</i>
    </span>
  )
}

// Letreiro correndo com as coleções
function Letreiro() {
  const itens = [...COLECOES.map(c => c.titulo), 'com análise', 'com a nossa ferramenta']
  const fila = [...itens, ...itens]
  return (
    <div className="lp-letreiro" aria-hidden="true">
      <div className="lp-letreiro__faixa">
        {fila.map((t, i) => <span key={i}>{t}<em>✦</em></span>)}
      </div>
    </div>
  )
}

function Logo({ className = '' }) {
  return (
    <span className={`lp-logo ${className}`}>
      <span className="lp-logo__a">acervo</span>
      <span className="lp-logo__b">de anúncios</span>
    </span>
  )
}

export default function AcervoPage() {
  const [stickyVisible, setStickyVisible] = useState(false)
  const [aberta, setAberta] = useState(-1)

  useEffect(() => {
    document.title = 'Acervo de Anúncios — AVVA Hub'
    const onScroll = () => setStickyVisible(window.scrollY > 640)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="lp">
      {/* ── 1. Hero ── */}
      <div className="lp-moldura">
      <section className="lp-hero lp-palco lp-palco--claro" id="topo">
        <span className="lp-estrela lp-estrela--1" aria-hidden="true">✦</span>
        <span className="lp-estrela lp-estrela--2" aria-hidden="true">✦</span>
        <div className="lp-hero__inner">
          <div className="lp-palco-logo">
            <div className="lp-orbita" aria-hidden="true"><span className="lp-orbita__anel"><i>✦</i></span></div>
            <img className="lp-logomarca" src="/acervo/logo.webp" alt="acervo de anúncios" width="1140" height="970" fetchPriority="high" />
            <span className="lp-hero__sombra" aria-hidden="true" />
          </div>
          <h1 className="lp-hero__frase">
            A biblioteca de anúncios das empreendedoras que <em>cansaram de começar do zero.</em>
          </h1>
          <p className="lp-hero__destaque">
            Entenda a lógica de quem vende e transforme as suas referências favoritas em anúncios, <strong>com a nossa ferramenta.</strong>
          </p>
          <p className="lp-hero__sub">
            Tudo pelo celular, com acesso imediato.
          </p>
          <Cta>Quero o acervo 🤎</Cta>
          <p className="lp-hero__nota">{OFERTA.preco} · pagamento único · {OFERTA.garantiaDias} dias de garantia</p>
        </div>

      </section>
      </div>

      <Letreiro />

      {/* ── 2. Veja por dentro (vídeo ou mockup) ── */}
      <section className="lp-section lp-video" id="por-dentro">
        <div className="lp-container lp-container--narrow">
          <Reveal className="lp-video__head">
            <span className="lp-pill">Veja por dentro</span>
            <h2 className="lp-titulo lp-titulo--grande">
              {OFERTA.videoUrl ? <>Clique no vídeo e <strong>veja o acervo funcionando.</strong></> : <>É assim que o acervo é <strong>por dentro.</strong></>}
            </h2>
            <p>Você abre as coleções, escolhe um anúncio, lê por que ele vende e faz a sua versão com a nossa ferramenta. Tudo pelo celular.</p>
          </Reveal>
          <Reveal delay={100}>
            {OFERTA.videoUrl ? (
              <div className="lp-video__frame">
                {/^https?:\/\/(www\.)?(youtube\.com|youtu\.be|vimeo\.com)/.test(OFERTA.videoUrl) ? (
                  <iframe src={OFERTA.videoUrl} title="O acervo por dentro" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen loading="lazy" />
                ) : (
                  <video src={OFERTA.videoUrl} poster={OFERTA.videoPoster} controls playsInline preload="metadata" />
                )}
              </div>
            ) : (
        <div className="lp-mock" aria-hidden="true">
          <div className="lp-laptop">
            <div className="lp-laptop__screen">
              <img src="/acervo/tela-acervo.webp" alt="" width="1400" height="742" loading="lazy" />
            </div>
            <div className="lp-laptop__base" />
          </div>
          <div className="lp-mockphone">
            <span className="lp-mockphone__notch" />
            <div className="lp-mockphone__screen">
              <div className="lp-mockphone__bar"><b>A</b><span>AVVA Hub</span></div>
              <img src="/acervo/card-melhores.webp" alt="" width="720" height="1158" loading="lazy" />
            </div>
          </div>
          <span className="lp-sticker lp-sticker--1">anúncios novos toda semana</span>
          <span className="lp-sticker lp-sticker--2">ferramenta inclusa</span>
          <Selo id="selo-hero" texto={`acesso imediato ✦ ${OFERTA.garantiaDias} dias de garantia ✦ `} className="lp-selo--hero" />
        </div>
            )}
          </Reveal>
        </div>
      </section>

      {/* ── 3. Como funciona, em 3 prints ── */}
      <section className="lp-section lp-passos lp-palco lp-palco--claro">
        <div className="lp-container">
          <Reveal className="lp-passos__head">
            <span className="lp-pill">Como funciona</span>
            <h2 className="lp-titulo lp-titulo--grande">Três toques e o seu anúncio <strong>sai pronto pra gravar.</strong></h2>
          </Reveal>
          <ol className="lp-passos__lista">
            {PASSOS_PRINTS.map((p, i) => (
              <Reveal as="li" key={p.n} className="lp-passo" delay={i * 90}>
                <div className="lp-passo__print">
                  {p.src ? (
                    <img src={p.src} alt={p.alt} loading="lazy" />
                  ) : (
                    <span className="lp-passo__vazio">{p.alt}</span>
                  )}
                </div>
                <span className="lp-sticker lp-sticker--passo">Passo {p.n}</span>
                <h3>{p.titulo}</h3>
                <p>{p.texto}</p>
              </Reveal>
            ))}
          </ol>
          <Reveal className="lp-center" delay={120}><Cta>Quero o acervo 🤎</Cta></Reveal>
        </div>
      </section>

      {/* ── 4. O que é + coleções ── */}
      <section className="lp-section lp-escuro lp-palco lp-oque">
        <span className="lp-gigante" aria-hidden="true">acervo</span>
        <div className="lp-container lp-oque__grid">
          <Reveal className="lp-oque__texto">
            <p className="lp-oque__frase">
              O acervo é uma <span className="lp-cor-areia">estante de anúncios</span> que estão vendendo agora, organizada pelo que você precisa <span className="lp-cor-areia">hoje</span>, com a análise do porquê cada um funciona, pra te ajudar <em>a ter anúncios mais <span className="lp-cor-terra">simples, honestos e que vendem.</span></em>
            </p>
            <span className="lp-oque__legenda">As 6 coleções por objetivo, mais a curadoria do mês</span>
            <p className="lp-oque__nota">Não é um pacote fixo de anúncios. É um acervo vivo: toda semana entra anúncio novo, com a curadoria que a Flora faz pros clientes da agência dela.</p>
          </Reveal>
          <ol className="lp-cards">
            {COLECOES.map((c, i) => <CardColecao key={c.slug} c={c} index={i} />)}
          </ol>
        </div>
      </section>

      {/* ── 5. Toda semana + nichos ── */}
      <section className="lp-section lp-semana">
        <div className="lp-container lp-semana__grid">
          <Reveal className="lp-semana__card lp-semana__card--terra">
            <span className="lp-sticker lp-sticker--semana">toda semana</span>
            <h2>Anúncios novos toda semana. Você não precisa mais fazer a curadoria sozinha.</h2>
            <p>A Flora garimpa e analisa anúncios o tempo todo pros clientes da agência dela, porque eles precisam vender. O que entra no acervo é essa mesma curadoria. Não é um pacote fechado que você compra e pronto: é um acervo que cresce, pega sazonalidade e acompanha o que está rodando agora.</p>
          </Reveal>
          <Reveal className="lp-semana__card lp-semana__card--teal" delay={100}>
            <span className="lp-sticker lp-sticker--semana">pro seu nicho</span>
            <h2>Separado por nicho. Você vê só o que serve pro seu negócio.</h2>
            <p>Dentro de cada coleção, você filtra pelo seu tipo de negócio. A estrutura é a mesma, mas o exemplo é do seu mundo.</p>
            <ul className="lp-nichos">
              {NICHOS.map(n => <li key={n}>{n}</li>)}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* ── 6. Espiadinha ── */}
      <section className="lp-section lp-escuro lp-escuro--umber lp-palco lp-espiada">
        <i className="lp-ondas lp-ondas--espiada" aria-hidden="true" />
        <div className="lp-container lp-container--narrow">
          <Reveal as="h2" className="lp-titulo lp-titulo--grande lp-titulo--centro lp-titulo--claro">
            Cada anúncio vem<br /><strong>com a análise do porquê.</strong>
          </Reveal>
          <Reveal as="p" className="lp-espiada__sub" delay={80}>Três análises de verdade, do jeito que estão lá dentro: o que fez cada anúncio funcionar e o que importa nele. É isso que você lê antes de fazer a sua versão.</Reveal>
          <div className="lp-espiada__cards">
            {ESPIADINHA.map((a, i) => (
              <Reveal as="article" key={a.marca} className={`lp-espiada__card ${i % 2 ? 'lp-espiada__card--areia' : 'lp-espiada__card--terra'}`} delay={i * 90}>
                <span className="lp-espiada__marca" aria-hidden="true">{a.marca}</span>
                <div>
                  <span className="lp-espiada__tipo">{a.tipo}</span>
                  <h3>{a.titulo}</h3>
                  <p>{a.texto}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={120}><Cta variante="gradiente" largo>Quero começar 🤎</Cta></Reveal>
        </div>
      </section>

      {/* ── 4b. Fazer a minha versão (a ferramenta) ── */}
      <section className="lp-section lp-ia" id="ferramenta">
        <div className="lp-container">
          <Reveal className="lp-ia__head">
            <span className="lp-pill">A nossa ferramenta</span>
            <h2 className="lp-titulo lp-titulo--grande">
              Primeiro você entende.<br /><strong>Depois, a ferramenta escreve a sua versão.</strong>
            </h2>
            <p>
              É o que nenhum outro acervo tem: o prompt não fica solto num documento. Ele está <strong>ao lado de cada anúncio</strong>, já montado com a análise daquele anúncio e com o seu negócio. Você preenche, toca e a sua IA abre com a sua versão quase pronta.
            </p>
          </Reveal>
        </div>

        <div className="lp-container lp-ia__grid">
          <ol className="lp-ia__passos">
            {FERRAMENTA_PASSOS.map((p, i) => (
              <Reveal as="li" key={p.n} className="lp-ia__passo" delay={i * 70}>
                <span className="lp-ia__num">{p.n}</span>
                <div>
                  <h3>{p.titulo}</h3>
                  <p>{p.texto}</p>
                </div>
              </Reveal>
            ))}
          </ol>
          <Reveal className="lp-ia__painel" delay={120}>
            <div className="lp-celular">
              <span className="lp-sticker lp-sticker--celular">na sua voz</span>
              <span className="lp-celular__notch" />
              <PainelIA />
            </div>
            <p className="lp-ia__legenda">O painel de verdade, do jeito que abre dentro de cada anúncio. Pode mexer.</p>
          </Reveal>
        </div>

        <div className="lp-container">
          <Reveal className="lp-ia__exemplo" delay={80}>
            <span className="lp-sticker lp-sticker--exemplo">exemplo real</span>
            <p className="lp-ia__exemplo-titulo">O que a sua IA recebe quando você toca em "Abrir"</p>
            <pre className="lp-ia__prompt">{`Vou gravar um anúncio meu inspirado num anúncio que funcionou.
Quero a fala pronta, na minha voz, seguindo a mesma sequência do original.

O ANÚNCIO ORIGINAL
Formato: vídeo · Coleção: Provar que funciona
O que ele faz, segundo o Acervo: [a análise do anúncio, inteira]

O MEU NEGÓCIO
O que eu vendo: consultoria de imagem
Pra quem, com detalhe: dona de clínica de estética com 2 a 5 funcionárias
Prova real, com contexto: a Carla, salão em Campinas, saiu de 6 pra 20 agendamentos por semana em 2 meses
Como eu escrevo: Direta. Frases curtas. Começa pelo assunto, sem rodeio...
Pra onde o anúncio leva: WhatsApp. O que a pessoa ganha ao clicar: uma análise gratuita

COMO FAZER
1. Escreva a sequência do original em 3 a 6 passos. É ela que a minha versão repete. As frases, não.
2. Se faltar material pra algum passo, me pergunte antes de escrever. Nunca preencha com frase genérica.
3. Escreva a fala corrida, como eu falaria num áudio pra uma cliente...

NÃO ESCREVA
- Número, prova, preço ou garantia que eu não tenha dado.
- Validação pronta, pergunta retórica, jargão, emoji, exclamação...`}</pre>
            <p className="lp-ia__exemplo-nota">Trecho resumido. O prompt completo vai com a análise inteira, a sua ficha e todas as regras.</p>
          </Reveal>

          <ul className="lp-ia__regras">
            {FERRAMENTA_REGRAS.map((r, i) => (
              <Reveal as="li" key={r.titulo} className="lp-ia__regra" delay={i * 50}>
                <strong>{r.titulo}</strong>
                <span>{r.texto}</span>
              </Reveal>
            ))}
          </ul>

          <Reveal className="lp-center" delay={100}>
            <Cta>Quero a ferramenta junto com o acervo</Cta>
          </Reveal>
        </div>
      </section>

      {/* ── 4c. Bônus ── */}
      <section className="lp-section lp-bonus">
        <div className="lp-container">
          <Reveal className="lp-bonus__head">
            <span className="lp-pill lp-pill--terra">Bônus</span>
            <h2 className="lp-titulo lp-titulo--grande">
              E ainda entra junto,<br /><strong>sem custo:</strong>
            </h2>
          </Reveal>
          <ul className="lp-bonus__grid">
            {BONUS.map((b, i) => <CardBonus key={b.titulo} b={b} index={i} />)}
          </ul>
        </div>
      </section>

      {/* ── 2. Pra quem é ── */}
      <section className="lp-section lp-praquem">
        <i className="lp-ondas lp-ondas--praquem" aria-hidden="true" />
        <div className="lp-container">
          <Reveal as="h2" className="lp-titulo lp-titulo--colchete">Pra quem é</Reveal>
          <Reveal as="p" className="lp-praquem__intro" delay={80}>
            <em>O acervo é pra você que:</em>
          </Reveal>
          <ul className="lp-checks">
            {PRA_QUEM.map((item, i) => (
              <Reveal as="li" key={i} className={`lp-adesivo lp-adesivo--${i % 3}`} delay={i * 50} style={{ '--giro': `${[-1.5, 1.2, -0.8, 1.6, -1.2, 0.9, -1.4][i % 7]}deg` }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>
                <span>{item}</span>
              </Reveal>
            ))}
          </ul>
          <Reveal delay={120}><Cta largo>Quero o acervo 🤎</Cta></Reveal>
        </div>
      </section>

      {/* ── 10. Depoimentos ── */}
      {DEPOIMENTOS.length > 0 && (
        <section className="lp-section lp-depo">
          <div className="lp-container">
            <Reveal className="lp-depo__head">
              <span className="lp-pill">Quem já entrou</span>
              <h2 className="lp-titulo lp-titulo--grande">O que elas estão <strong>falando do acervo.</strong></h2>
            </Reveal>
            <ul className="lp-depo__grid">
              {DEPOIMENTOS.map((d, i) => (
                <Reveal as="li" key={i} className="lp-depo__card" delay={i * 70}>
                  <p>“{d.texto}”</p>
                  <footer><strong>{d.nome}</strong>{d.nicho && <span> · {d.nicho}</span>}</footer>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ── Quem faz o acervo ── */}
      <section className="lp-section lp-quem lp-palco lp-palco--claro" id="quem">
        <div className="lp-container lp-quem__grid">
          <Reveal className="lp-quem__colagem" aria-hidden="true">
            {QUEM_FOTOS.map((f, i) => (
              <figure key={f.src} className={`lp-quem__foto lp-quem__foto--${i + 1}`}>
                <img src={f.src} alt={f.alt} loading="lazy" onError={e => { e.currentTarget.parentElement.classList.add('is-vazia') }} />
                <figcaption>{f.alt}</figcaption>
              </figure>
            ))}
            <span className="lp-sticker lp-sticker--quem-1">amigas</span>
            <span className="lp-sticker lp-sticker--quem-2">sócias</span>
          </Reveal>
          <Reveal className="lp-quem__texto" delay={100}>
            <span className="lp-pill">Quem faz o acervo</span>
            <h2 className="lp-titulo lp-titulo--grande">Flora Tavares <em>&amp;</em> <strong>Ingrid Andrade</strong></h2>
            <p>
              A gente se conheceu trabalhando, e virou amizade antes de virar parceria. A Flora é quem está todo dia no gerenciador, rodando anúncio pros clientes da agência dela e garimpando o que está vendendo de verdade. A Ingrid é quem transforma isso em produto: foi ela que construiu a área de membros e a ferramenta que escreve a sua versão.
            </p>
            <p>
              O acervo nasceu de uma rotina que já existia: toda semana a Flora separa os melhores anúncios pros clientes, analisa por que funcionam e manda pra equipe. A gente só abriu essa porta pra você.
            </p>
            <p>
              Somos duas mulheres fazendo isso pra outras mulheres que empreendem. Por isso a página fala com você desse jeito, e por isso o acervo tem exemplo de clínica, de loja, de consultoria, e não só de guru vendendo curso.
            </p>
            {/* AJUSTAR: completar com fatos reais (tempo de parceria, cidade, números) e revisar o texto com a Flora */}
          </Reveal>
        </div>
      </section>

      {/* ── 8. Investimento ── */}
      <section className="lp-section lp-invest lp-palco lp-palco--claro" id="oferta">
        <span className="lp-estrela lp-estrela--4" aria-hidden="true">✦</span>
        <span className="lp-estrela lp-estrela--5" aria-hidden="true">✦</span>
        <Reveal className="lp-container lp-container--narrow lp-invest__inner">
          <span className="lp-pill">Investimento</span>
          {OFERTA.precoDe && (
            <p className="lp-invest__de">de <s>{OFERTA.precoDe}</s> por</p>
          )}
          <div className="lp-carimbo">
            <Selo id="selo-preco" texto={`${(OFERTA.precoNota || 'oferta').toLowerCase()} ✦ pagamento único ✦ `} className="lp-selo--preco" />
            <p className="lp-invest__preco">{OFERTA.preco}</p>
          </div>
          <p className="lp-invest__detalhe">
            {OFERTA.parcelas && <><strong>{OFERTA.parcelas}</strong><br /></>}
            (pagamento único, sem mensalidade)
          </p>
          {OFERTA.reforco && <p className="lp-invest__reforco">{OFERTA.reforco}</p>}
          <ul className="lp-incluso" aria-label="O que está incluído">
            {INCLUSO.map((item, i) => (
              <li key={i}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <Cta variante="teal" largo>Quero ver os anúncios que vendem</Cta>
          <ul className="lp-selos" aria-label="Garantias">
            <li>Acesso imediato</li>
            <li>{OFERTA.garantiaDias} dias de garantia</li>
            <li>Pix ou cartão</li>
            <li>Pagamento seguro</li>
          </ul>
          <div className="lp-garantia">
            <span className="lp-garantia__selo" aria-hidden="true">
              <strong>{OFERTA.garantiaDias}</strong>
              <small>dias</small>
            </span>
            <div className="lp-garantia__texto">
              <h3>Garantia de {OFERTA.garantiaDias} dias, sem perguntas</h3>
              <p>Entra, navega, lê as análises. Se não fizer sentido pra você, pede o reembolso e recebe 100% de volta. Sem precisar explicar.</p>
              <a className="lp-garantia__link" href={OFERTA.checkoutUrl} rel="noopener">Quero entrar sem risco <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></svg></a>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── 9. FAQ ── */}
      <section className="lp-section lp-escuro lp-palco lp-faq">
        <div className="lp-container lp-container--narrow">
          <Reveal className="lp-faq__lista">
            {FAQ.map((item, i) => {
              const open = aberta === i
              return (
                <div key={item.q} className={`lp-faq__item ${open ? 'is-open' : ''}`}>
                  <button
                    type="button"
                    className="lp-faq__q"
                    aria-expanded={open}
                    aria-controls={`faq-${i}`}
                    onClick={() => setAberta(open ? -1 : i)}
                  >
                    <span>{item.q}</span>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
                  </button>
                  <div id={`faq-${i}`} className="lp-faq__a" aria-hidden={!open}>
                    <div><p>{item.a}</p></div>
                  </div>
                </div>
              )
            })}
          </Reveal>
        </div>
      </section>

      {/* ── Rodapé ── */}
      <footer className="lp-escuro lp-palco lp-fim">
        <div className="lp-container lp-container--narrow lp-fim__inner">
          <Logo className="lp-logo--rodape" />
          <div className="lp-rodape">
            <span>© {new Date().getFullYear()} AVVA Hub</span>
            <Link to="/login">Já sou aluna</Link>
          </div>
        </div>
      </footer>

      {/* ── Barra fixa (mobile) ── */}
      <div className={`lp-sticky ${stickyVisible ? 'is-visible' : ''}`} aria-hidden={!stickyVisible}>
        <span className="lp-sticky__preco">{OFERTA.preco}</span>
        <Cta>Quero o acervo 🤎</Cta>
      </div>
    </div>
  )
}
