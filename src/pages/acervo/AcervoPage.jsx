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
}

const PRA_QUEM = [
  <><strong>Tem um negócio local, presta serviço, vende infoproduto ou tem e-commerce</strong> e roda (ou quer rodar) os próprios anúncios</>,
  <><strong>Posta, posta,</strong> e ninguém compra</>,
  <><strong>Abre o gerenciador,</strong> trava na hora de criar e fecha de novo</>,
  <><strong>Vê o anúncio da concorrente</strong> e pensa: por que eu não pensei nisso?</>,
  <><strong>Não sabe editar vídeo</strong> e acha que, por isso, não pode anunciar</>,
  <><strong>Prefere ver o que já funciona</strong> antes de inventar o seu</>,
  <><strong>Quer colocar um anúncio no ar</strong> ainda essa semana</>,
]

const AFIRMACOES = [
  <>Os anúncios que te fazem parar o dedo não chamam atenção por acaso: <strong>eles têm uma estrutura que funciona.</strong> E essa estrutura pode ser a sua.</>,
  <><strong>Você não precisa criar do zero.</strong> Precisa ver o que já está validado, entender por que funciona e adaptar a lógica pro seu negócio. É assim que você para de torcer <strong>e começa a vender.</strong></>,
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

// O que a IA entrega em cada formato, no "Fazer a minha versão"
const IA_SAIDAS = [
  { formato: 'Vídeo', itens: ['A fala completa, na sua voz, com a mesma duração do original', 'As cenas, uma a uma', '2 ganchos extras pra testar', 'A legenda do post'] },
  { formato: 'Imagem', itens: ['A frase da imagem', 'A descrição do visual pra você montar', 'A legenda do post'] },
  { formato: 'Carrossel', itens: ['De 4 a 7 telas, com o texto de cada uma', '2 opções de capa'] },
  { formato: 'Página', itens: ['Os blocos da página, na ordem', 'O texto de cada botão', '2 títulos de primeira dobra'] },
]

const ENTREGAS = [
  { icone: 'grid', texto: <><strong>Anúncios validados</strong> em vídeo, imagem e carrossel, todos rodando de verdade</> },
  { icone: 'pasta', texto: <><strong>{OFERTA.totalColecoes} coleções por objetivo</strong>, de atrair seguidores até vender agora</> },
  { icone: 'lupa', texto: <><strong>Análise de cada anúncio</strong>: por que funciona, em poucas linhas e sem jargão</> },
  { icone: 'ia', texto: <><strong>Fazer a minha versão</strong>, a nossa ferramenta: em qualquer anúncio, ela escreve a sua versão na sua voz, a partir do que você entendeu</> },
  { icone: 'estrela', texto: <><strong>Melhores do mês</strong>: uma curadoria nova todo mês, garimpada pela Flora</> },
  { icone: 'presente', texto: <><strong>Bônus</strong>: Especial Black Friday, Especial Mini VSL e Especial Páginas, com análise e a sua versão pela nossa ferramenta</> },
  { icone: 'filtro', texto: <><strong>Filtro por nicho e formato</strong>: negócio local, serviço, infoproduto e e-commerce</> },
  { icone: 'celular', texto: <><strong>Área de membros no celular</strong>, com favoritos, busca e marcação do que você já viu</> },
  { icone: 'calendario', texto: <><strong>{OFERTA.acessoPor} de acesso</strong>, com tudo que entrar nesse período</> },
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

// Objeções na fala da cliente, cada uma com resposta curta
const OBJECOES = [
  {
    fala: 'Mas o meu nicho é diferente, isso não vai funcionar pra mim…',
    resposta: <>O acervo é organizado por <strong>objetivo do anúncio</strong>, não por nicho. A estrutura que faz uma loja de roupa vender é a mesma que faz uma nutricionista fechar agenda. E você ainda filtra por negócio local, serviço, infoproduto e e‑commerce.</>,
  },
  {
    fala: 'Mas eu não sei editar vídeo nem tenho designer…',
    resposta: <>Boa parte dos anúncios que mais vendem lá dentro foi <strong>gravada no celular, sem edição</strong>. O que faz a pessoa parar não é o acabamento. É a estrutura, e é isso que a análise te entrega.</>,
  },
  {
    fala: 'Mas eu já comprei curso de anúncio e não saí do lugar…',
    resposta: <>Isso não é curso. É <strong>referência pronta</strong>: você abre, escolhe pelo objetivo, lê por que funciona, adapta e coloca no ar. Dá pra publicar o primeiro ainda hoje.</>,
  },
  {
    fala: 'Mas eu nem sei se vou ter tempo de usar…',
    resposta: <>Cada análise tem <strong>poucas linhas</strong>. Em dez minutos no celular você escolhe um anúncio e sai com a estrutura pronta pra gravar o seu.</>,
  },
]

// Checklist do que está incluído, dentro da oferta
const INCLUSO = [
  <><strong>{OFERTA.totalColecoes} coleções</strong> organizadas por objetivo</>,
  <><strong>Análise de cada anúncio</strong>: por que funciona</>,
  <><strong>Fazer a minha versão</strong>, a nossa ferramenta, em todo anúncio e página</>,
  <><strong>Melhores do mês</strong>: curadoria nova todo mês</>,
  <><strong>Bônus:</strong> Especial Black Friday, Especial Mini VSL e Especial Páginas</>,
  <><strong>Filtro por nicho e formato</strong>, busca e favoritos</>,
  <><strong>{OFERTA.acessoPor} de acesso</strong>, com tudo que entrar nesse período</>,
]

// Fechamento: cenário A (sem o acervo) x cenário B (com o acervo)
const CENARIOS = [
  {
    letra: 'A',
    titulo: 'Sem o acervo',
    itens: [
      'Você continua abrindo o gerenciador sem saber o que colocar no anúncio',
      'Posta, impulsiona, torce. A verba vai e a venda não vem',
      'Daqui a 30 dias: o mesmo feed, o mesmo resultado',
    ],
  },
  {
    letra: 'B',
    titulo: 'Com o acervo',
    itens: [
      'Você abre o celular, escolhe pelo objetivo e lê por que aquele anúncio vende',
      'Adapta a estrutura pro seu negócio, ou usa a nossa ferramenta pra escrever a sua versão, e coloca no ar ainda essa semana',
      'Daqui a 30 dias: anúncios com estrutura, e não com sorte',
    ],
  },
]

const FAQ = [
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
    a: 'Durante esse período você tem tudo: as coleções, as curadorias novas de cada mês e as análises. Perto do fim, a gente te avisa e você decide se quer renovar.',
  },
  {
    q: 'Tenho reembolso?',
    a: `Tem. São ${OFERTA.garantiaDias} dias de garantia. Entra, navega, lê as análises. Se não fizer sentido pra você, pede o reembolso e recebe 100% de volta, sem precisar explicar.`,
  },
]

function Icone({ nome }) {
  const p = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }
  switch (nome) {
    case 'calendario': return <svg {...p}><rect x="3" y="4" width="18" height="18" rx="3"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
    case 'grid': return <svg {...p}><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
    case 'pasta': return <svg {...p}><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
    case 'estrela': return <svg {...p}><path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.3 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z"/></svg>
    case 'lupa': return <svg {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
    case 'filtro': return <svg {...p}><path d="M3 5h18l-7 8v6l-4 2v-8z"/></svg>
    case 'celular': return <svg {...p}><rect x="6" y="2" width="12" height="20" rx="3"/><path d="M11 18h2"/></svg>
    case 'ia': return <svg {...p}><path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/></svg>
    case 'presente': return <svg {...p}><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8M12 8v13M12 8c-2-3-6-3-6 0h6zm0 0c2-3 6-3 6 0h-6z"/></svg>
    default: return null
  }
}

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
      {children}
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
    return () => io.disconnect()
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
        <Seta />
        <h3>{c.titulo}</h3>
        <p>{c.subtitulo}</p>
      </div>
    </Reveal>
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
      <section className="lp-hero" id="topo">
        <span className="lp-estrela lp-estrela--1" aria-hidden="true">✦</span>
        <span className="lp-estrela lp-estrela--2" aria-hidden="true">✦</span>
        <div className="lp-hero__inner">
          <img className="lp-logomarca" src="/acervo/logo.webp" alt="acervo de anúncios" width="1140" height="970" fetchPriority="high" />
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

      {/* ── 2. Pra quem é ── */}
      <section className="lp-section lp-praquem">
        <div className="lp-container">
          <Reveal as="h2" className="lp-titulo lp-titulo--colchete">Pra quem é</Reveal>
          <Reveal as="p" className="lp-praquem__intro" delay={80}>
            O feed virou um loop de criativo igual. Anúncio bonito que não vende, dancinha que não converte, verba indo embora.
            <em>O acervo nasce pra você que:</em>
          </Reveal>
          <ul className="lp-checks">
            {PRA_QUEM.map((item, i) => (
              <Reveal as="li" key={i} delay={i * 50}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>
                <span>{item}</span>
              </Reveal>
            ))}
          </ul>
          <Reveal delay={120}><Cta largo>Ok, me mostra esse acervo</Cta></Reveal>
        </div>
      </section>

      {/* ── 3. Afirmação ── */}
      <section className="lp-section lp-afirma">
        <span className="lp-estrela lp-estrela--3" aria-hidden="true">✦</span>
        <div className="lp-container lp-container--narrow">
          <Reveal as="h2" className="lp-titulo lp-titulo--grande">
            Muita gente diz que o problema é a verba, é o público.<br />
            Mas quase sempre <strong>o problema está no criativo.</strong>
          </Reveal>
          <div className="lp-afirma__caixas">
            {AFIRMACOES.map((a, i) => (
              <Reveal key={i} className={`lp-caixa ${i % 2 ? 'lp-caixa--teal' : 'lp-caixa--terra'}`} delay={100 + i * 100}>
                <Seta />
                <p>{a}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. O que é + coleções ── */}
      <section className="lp-section lp-escuro lp-oque">
        <div className="lp-container lp-oque__grid">
          <Reveal className="lp-oque__texto">
            <p className="lp-oque__frase">
              O acervo é uma <span className="lp-cor-areia">estante de anúncios</span> que estão vendendo agora, organizada pelo que você precisa <span className="lp-cor-areia">hoje</span>, com a análise do porquê cada um funciona, pra te ajudar <em>a ter anúncios mais <span className="lp-cor-terra">simples, honestos e que vendem.</span></em>
            </p>
            <span className="lp-oque__legenda">As 6 coleções por objetivo, mais a curadoria do mês</span>
          </Reveal>
          <ol className="lp-cards">
            {COLECOES.map((c, i) => <CardColecao key={c.slug} c={c} index={i} />)}
          </ol>
        </div>
      </section>

      {/* ── 4b. Fazer a minha versão (IA) ── */}
      <section className="lp-section lp-ia">
        <div className="lp-container lp-ia__grid">
          <Reveal className="lp-ia__texto">
            <span className="lp-pill">Incluso no acervo</span>
            <h2 className="lp-titulo lp-titulo--grande">
              Primeiro você entende.<br /><strong>Depois, a nossa ferramenta escreve a sua versão.</strong>
            </h2>
            <p>
              Em todo anúncio e página do acervo tem o botão <strong>Fazer a minha versão</strong>. Você preenche a sua ficha uma vez (o que vende, pra quem, uma prova real, como a sua cliente fala) e a ferramenta escreve a sua versão daquele anúncio, na sua voz, com a sua prova, sem inventar número.
            </p>
            <p>
              Não é pra copiar o anúncio dos outros. É pra entender por que ele vende e sair com o seu pronto pra gravar, ainda hoje.
            </p>
            <ul className="lp-ia__pontos">
              <li>Funciona no ChatGPT e no Claude, nas versões gratuitas</li>
              <li>A ficha fica salva: preenche uma vez, usa em todos</li>
              <li>Vídeo, imagem, carrossel e página, cada um no seu formato</li>
            </ul>
          </Reveal>
          <Reveal className="lp-ia__painel" delay={120}>
            <PainelIA />
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
            {BONUS.map((b, i) => (
              <Reveal as="li" key={b.titulo} className="lp-bonus__card" delay={i * 80}>
                <img className="lp-bonus__capa" src={b.capa} alt="" loading="lazy" width="720" height="957" />
                <span className="lp-bonus__kicker">Bônus {String(i + 1).padStart(2, '0')}</span>
                <h3>{b.titulo}</h3>
                <p>{b.texto}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ── 5. Entregas ── */}
      <section className="lp-section lp-entregas">
        <div className="lp-container lp-entregas__grid">
          <Reveal as="h2" className="lp-titulo lp-titulo--grande lp-entregas__titulo">
            É aqui que você<br /><strong>para de adivinhar.</strong>
          </Reveal>
          <Reveal className="lp-entregas__phone" delay={100}>
            <div className="lp-pilha" aria-hidden="true">
              <img className="lp-pilha__item lp-pilha__item--1" src="/acervo/capa-black.webp" alt="" loading="lazy" width="720" height="957" />
              <img className="lp-pilha__item lp-pilha__item--2" src="/acervo/card-melhores.webp" alt="" loading="lazy" width="720" height="1158" />
              <img className="lp-pilha__item lp-pilha__item--3" src="/acervo/capa-paginas.webp" alt="" loading="lazy" width="720" height="957" />
            </div>
            <p className="lp-pilha__legenda">Capas de verdade, da área de membros</p>
          </Reveal>
          <ul className="lp-entregas__lista">
            {ENTREGAS.map((e, i) => (
              <Reveal as="li" key={i} delay={i * 50}>
                <Icone nome={e.icone} />
                <span>{e.texto}</span>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ── 6. Espiadinha ── */}
      <section className="lp-section lp-escuro lp-escuro--umber lp-espiada">
        <div className="lp-container lp-container--narrow">
          <Reveal as="h2" className="lp-titulo lp-titulo--grande lp-titulo--centro lp-titulo--claro">
            Pra você dar uma<br /><strong>espiadinha…</strong>
          </Reveal>
          <Reveal as="p" className="lp-espiada__sub" delay={80}>Três análises de verdade, do jeito que estão no acervo. Entender a estratégia vale mais do que copiar o formato. Qual dessas sacadas você testaria primeiro?</Reveal>
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

      {/* ── 7. Objeções ── */}
      <section className="lp-section lp-objecoes">
        <div className="lp-container lp-container--narrow">
          <Reveal as="h2" className="lp-titulo lp-titulo--grande lp-titulo--centro">
            Até quando você vai<br /><strong>torcer pra anúncio dar certo?</strong>
          </Reveal>
          <Reveal as="p" className="lp-objecoes__sub" delay={80}>Se ainda está na dúvida, talvez seja por um desses motivos:</Reveal>
          <div className="lp-objecoes__lista">
            {OBJECOES.map((o, i) => (
              <Reveal as="article" key={i} className="lp-objecao" delay={i * 70}>
                <p className="lp-objecao__fala">“{o.fala}”</p>
                <p className="lp-objecao__resposta">{o.resposta}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. Investimento ── */}
      <section className="lp-section lp-invest" id="oferta">
        <span className="lp-estrela lp-estrela--4" aria-hidden="true">✦</span>
        <span className="lp-estrela lp-estrela--5" aria-hidden="true">✦</span>
        <Reveal className="lp-container lp-container--narrow lp-invest__inner">
          <span className="lp-pill">Investimento</span>
          {OFERTA.precoDe && (
            <p className="lp-invest__de">de <s>{OFERTA.precoDe}</s> por</p>
          )}
          <p className="lp-invest__preco">{OFERTA.preco}</p>
          {OFERTA.precoNota && <span className="lp-invest__nota">{OFERTA.precoNota}</span>}
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
      <section className="lp-section lp-escuro lp-faq">
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

      {/* ── 10. Fechamento: cenário A x cenário B ── */}
      <section className="lp-section lp-cenarios">
        <span className="lp-estrela lp-estrela--6" aria-hidden="true">✦</span>
        <div className="lp-container lp-container--narrow">
          <Reveal as="h2" className="lp-titulo lp-titulo--grande lp-titulo--centro">
            Daqui a 30 dias,<br /><strong>onde você vai estar?</strong>
          </Reveal>
          <div className="lp-cenarios__grid">
            {CENARIOS.map((c, i) => (
              <Reveal as="article" key={c.letra} className={`lp-cenario lp-cenario--${c.letra.toLowerCase()}`} delay={i * 100}>
                <span className="lp-cenario__kicker">Cenário {c.letra}</span>
                <h3>{c.titulo}</h3>
                <ul>
                  {c.itens.map((item, j) => <li key={j}>{item}</li>)}
                </ul>
              </Reveal>
            ))}
          </div>
          <Reveal delay={120}><Cta largo>Quero anúncios que vendem 🤎</Cta></Reveal>
        </div>
      </section>

      {/* ── Rodapé ── */}
      <footer className="lp-escuro lp-fim">
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
