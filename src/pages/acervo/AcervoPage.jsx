import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { COLLECTIONS } from '../../lib/catalog'
import './AcervoPage.css'

// ══════════════════════════════════════════════════════════════
// Página de vendas do Acervo de Anúncios (low ticket, tráfego frio
// do Instagram). Tudo que muda com a oferta fica aqui em cima.
// ══════════════════════════════════════════════════════════════
const OFERTA = {
  // AJUSTAR: link de checkout da Hotmart do Acervo
  checkoutUrl: 'https://pay.hotmart.com/SEU_CODIGO_AQUI',
  precoDe: 'R$ 147',   // valor cheio, aparece riscado acima do preço ('' esconde)
  preco: 'R$ 87',
  parcelas: '',        // AJUSTAR: parcelamento da Hotmart, ex.: 'ou 9x de R$ 11,38' ('' esconde)
  reforco: 'Dá menos de R$ 0,25 por dia. Um anúncio que não vende custa mais que isso.',
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
  <><strong>Você não precisa criar do zero.</strong> Precisa ter acesso ao que já está validado e adaptar pro seu negócio. É assim que você para de torcer <strong>e começa a vender.</strong></>,
]

// Coleções mostradas nos cards (as 6 por objetivo + a curadoria mensal)
const COLECOES = [
  ...COLLECTIONS.filter(c => c.order <= 6).sort((a, b) => a.order - b.order).map(c => ({
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

const ENTREGAS = [
  { icone: 'calendario', texto: <><strong>{OFERTA.acessoPor} de acesso</strong>, com tudo que entrar nesse período</> },
  { icone: 'grid', texto: <><strong>Anúncios validados</strong> em vídeo, estático, carrossel e página de venda em PDF, todos rodando de verdade</> },
  { icone: 'pasta', texto: <><strong>{OFERTA.totalColecoes} coleções por objetivo</strong>, do primeiro contato até a venda</> },
  { icone: 'estrela', texto: <><strong>Melhores do mês</strong>: uma curadoria nova todo mês, garimpada pela Flora</> },
  { icone: 'lupa', texto: <><strong>Análise de cada anúncio</strong>: por que funciona, em poucas linhas e sem jargão</> },
  { icone: 'filtro', texto: <><strong>Filtro por nicho</strong>: negócio local, serviço, infoproduto e e-commerce</> },
  { icone: 'celular', texto: <><strong>Área de membros no celular</strong>, com favoritos, busca e "continue de onde parou"</> },
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
  <><strong>Melhores do mês</strong>: curadoria nova todo mês</>,
  <><strong>Análise de cada anúncio</strong>: por que funciona</>,
  <><strong>Filtro por nicho</strong>, busca e favoritos</>,
  <><strong>Área de membros no celular</strong></>,
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
      'Adapta a estrutura pro seu negócio e coloca no ar ainda essa semana',
      'Daqui a 30 dias: anúncios com estrutura, e não com sorte',
    ],
  },
]

const FAQ = [
  {
    q: 'O acesso é imediato?',
    a: 'Sim. Assim que o pagamento é aprovado, a Hotmart te manda um e-mail e você entra na área de membros com o mesmo e-mail da compra. No Pix e no cartão, leva minutos. No boleto, até 2 dias úteis.',
  },
  {
    q: 'Funciona pro meu nicho?',
    a: 'O acervo é organizado por objetivo do anúncio (ser descoberta, gerar autoridade, provar que funciona, quebrar objeção, vender agora), e não por nicho. A estrutura que faz uma loja de roupa vender é a mesma que faz uma nutricionista fechar agenda. E dá pra filtrar por negócio local, serviço, infoproduto e e-commerce.',
  },
  {
    q: 'É só pra Instagram e Facebook ou serve pra outras plataformas?',
    a: 'Os anúncios do acervo rodam no Instagram e no Facebook (Meta). A estrutura que a análise te mostra (gancho, prova, oferta) vale pra qualquer canal, mas as referências são de Meta.',
  },
  {
    q: 'Preciso saber editar vídeo ou ter designer?',
    a: 'Não. Boa parte dos anúncios que mais vendem do acervo foi gravada no celular, sem edição elaborada. O que faz diferença é a estrutura, e é isso que a análise te mostra.',
  },
  {
    q: 'Posso copiar os anúncios?',
    a: 'Você usa como referência de estrutura: gancho, sequência, prova, fechamento. O produto, a fala e o visual são seus. Copiar anúncio de outra marca palavra por palavra não funciona e não é o que a gente faz.',
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
    a: `Tem. São ${OFERTA.garantiaDias} dias de garantia. Entra, navega, lê as análises. Se não fizer sentido pra você, pede o reembolso direto na Hotmart e recebe 100% de volta, sem precisar explicar.`,
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

// Miniatura da área de membros: as coleções trocam sozinhas e por toque
function Celular() {
  const [ativa, setAtiva] = useState(0)
  const pausado = useRef(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = setInterval(() => { if (!pausado.current) setAtiva(i => (i + 1) % 6) }, 3200)
    return () => clearInterval(t)
  }, [])

  function escolher(i) {
    setAtiva(i)
    pausado.current = true
    setTimeout(() => { pausado.current = false }, 7000)
  }

  return (
    <div className="lp-phone" aria-hidden="true">
      <div className="lp-phone__frame">
        <span className="lp-phone__notch" />
        <div className="lp-phone__screen">
          <div className="lp-phone__topbar">
            <span>Olá, Ana ✦</span>
            <span className="lp-phone__avatar">A</span>
          </div>
          <div className="lp-phone__hero">
            {COLECOES.map((c, i) => (
              <div key={c.slug} className={`lp-phone__slide ${i === ativa ? 'is-on' : ''}`} style={{ background: c.gradient }}>
                <span className="lp-phone__kicker">{c.kicker}</span>
                <strong>{c.titulo}</strong>
                <small>{c.subtitulo}</small>
                <i className="lp-phone__play" />
              </div>
            ))}
          </div>
          <div className="lp-phone__row">
            <span className="lp-phone__rowtitle">Coleções por objetivo</span>
            <div className="lp-phone__cards">
              {COLECOES.slice(0, 6).map((c, i) => (
                <button type="button" key={c.slug} className={`lp-phone__card ${i === ativa ? 'is-on' : ''}`} style={{ background: c.gradient }} onClick={() => escolher(i)} tabIndex={-1}>
                  <span>{String(i + 1).padStart(2, '0')}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="lp-phone__row">
            <span className="lp-phone__rowtitle">Melhores do mês</span>
            <div className="lp-phone__cards lp-phone__cards--sm">
              {[0, 1, 2, 3].map(i => <i key={i} className="lp-phone__card lp-phone__card--ghost" style={{ background: COLECOES[6].gradient, opacity: 0.9 - i * 0.15 }} />)}
            </div>
          </div>
          <div className="lp-phone__nav">
            {['Início', 'Coleções', 'Busca', 'Favoritos'].map((t, i) => <span key={t} className={i === 1 ? 'is-on' : ''}>{t}</span>)}
          </div>
        </div>
      </div>
      <div className="lp-phone__glow" />
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
    document.title = 'Acervo de Anúncios — Método AVVA'
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
          <Logo className="lp-logo--hero" />
          <h1 className="lp-hero__frase">
            A biblioteca de anúncios das empreendedoras que <em>cansaram de adivinhar criativo</em> e querem copiar a estrutura do que já vende.
          </h1>
          <p className="lp-hero__sub">
            Você escolhe pelo objetivo, lê por que funciona, adapta pro seu nicho e coloca no ar. Tudo pelo celular, com acesso imediato.
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
              O acervo é uma <span className="lp-cor-areia">estante de anúncios</span> que estão vendendo agora, organizada pelo que você precisa <span className="lp-cor-areia">hoje</span>, com a análise do porquê funciona, pra te ajudar <em>a ter anúncios mais <span className="lp-cor-terra">simples, honestos e que vendem.</span></em>
            </p>
            <span className="lp-oque__legenda">As coleções, por objetivo</span>
          </Reveal>
          <ol className="lp-cards">
            {COLECOES.map((c, i) => <CardColecao key={c.slug} c={c} index={i} />)}
          </ol>
        </div>
      </section>

      {/* ── 5. Entregas ── */}
      <section className="lp-section lp-entregas">
        <div className="lp-container lp-entregas__grid">
          <Reveal as="h2" className="lp-titulo lp-titulo--grande lp-entregas__titulo">
            É aqui que você<br /><strong>para de adivinhar.</strong>
          </Reveal>
          <Reveal className="lp-entregas__phone" delay={100}>
            <Celular />
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
          <Reveal as="p" className="lp-espiada__sub" delay={80}>Três análises de verdade, do jeito que estão lá dentro. O resto você descobre lá dentro, né?</Reveal>
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
            <li>Pix, cartão ou boleto</li>
            <li>Pagamento seguro pela Hotmart</li>
          </ul>
          <div className="lp-garantia">
            <span className="lp-garantia__selo" aria-hidden="true">
              <strong>{OFERTA.garantiaDias}</strong>
              <small>dias</small>
            </span>
            <div className="lp-garantia__texto">
              <h3>Garantia de {OFERTA.garantiaDias} dias, sem perguntas</h3>
              <p>Entra, navega, lê as análises. Se não fizer sentido pra você, pede o reembolso direto na Hotmart e recebe 100% de volta. Sem precisar explicar.</p>
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
            <span>© {new Date().getFullYear()} Método AVVA</span>
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
