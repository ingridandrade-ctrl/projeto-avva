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
  // AJUSTAR: preço real da oferta
  preco: 'R$ 47',
  parcelas: 'ou 5x de R$ 9,40', // deixe '' para esconder
  garantiaDias: 7,
  acessoPor: '1 ano',           // AJUSTAR: tempo de acesso prometido
}

// Coleções mostradas no celular do topo e na fileira de cards
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
    destaque: true,
  },
]

const PRA_QUEM = [
  <>Tem um <strong>negócio local</strong>, presta <strong>serviço</strong>, vende <strong>infoproduto</strong> ou tem <strong>e-commerce</strong> e roda (ou quer rodar) os próprios anúncios.</>,
  <>Posta, posta, <strong>e ninguém compra.</strong></>,
  <>Abre o gerenciador, <strong>trava na hora de criar</strong> e fecha de novo.</>,
  <>Vê o anúncio da concorrente e pensa: <strong>por que eu não pensei nisso?</strong></>,
  <>Não sabe editar vídeo e acha que, por isso, <strong>não pode anunciar.</strong></>,
  <>Prefere <strong>ver o que já funciona</strong> antes de inventar o seu.</>,
]

const PASSOS = [
  { n: '1', titulo: 'Escolhe pelo objetivo', texto: 'Precisa ser descoberta? Provar que funciona? Vender agora? Cada coleção é um momento do funil. Você entra pela porta certa, não por uma lista infinita.' },
  { n: '2', titulo: 'Lê por que funciona', texto: 'Cada anúncio vem com uma análise curta: o gancho, a estrutura, a prova, o fechamento. Você entende a lógica, não só copia o visual.' },
  { n: '3', titulo: 'Adapta e coloca no ar', texto: 'Troca o produto, mantém a estrutura. Quem fez no celular, você faz no celular. Dá pra ter um anúncio rodando ainda essa semana.' },
]

const ENTREGAS = [
  { icone: 'grid', titulo: 'Anúncios validados', texto: 'Vídeo, estático, carrossel e página de venda em PDF. Tudo rodando de verdade.' },
  { icone: 'pasta', titulo: 'Coleções por objetivo', texto: 'Do primeiro contato até a venda. Você navega pelo que precisa hoje.' },
  { icone: 'estrela', titulo: 'Melhores do mês', texto: 'Uma curadoria nova todo mês, garimpada pela Flora. O acervo cresce com você dentro.' },
  { icone: 'lupa', titulo: 'Análise de cada anúncio', texto: 'Por que funciona, em poucas linhas e sem jargão.' },
  { icone: 'filtro', titulo: 'Filtro por nicho', texto: 'Negócio local, serviço, infoproduto e e-commerce. Você vê o que serve pro seu caso.' },
  { icone: 'celular', titulo: 'Área de membros no celular', texto: 'Favoritos, busca e "continue de onde parou". Feita pra abrir entre um cliente e outro.' },
]

// Análises reais do acervo, do jeito que estão lá dentro
const ANALISES = [
  { titulo: 'Diandra · "pega de surpresa"', tipo: 'Vídeo · Serviço e infoproduto', texto: 'A sacada começa no formato: o roteiro é estruturado, mas a gravação faz parecer que a especialista foi pega de surpresa e está simplesmente respondendo uma pergunta. Enquanto ela elimina uma alternativa depois da outra (postar todo dia, carrossel, impulsionar, social media), a curiosidade aumenta: se nenhuma dessas é a resposta, qual é?' },
  { titulo: 'Letícia Vaz Store', tipo: 'Vídeo · E-commerce', texto: 'Ela te prende num desafio, te ensina a vender e te converte em um minuto e meio. Dá vários exemplos mostrando a calça e falando as qualidades enquanto você fica curiosa pra ver todas as formas de vendê-la. Deu uma aula de marketing enquanto fazia uma venda.' },
  { titulo: 'Pedro Sobral · "Como sei que funciona pra mim?"', tipo: 'Imagem estática · Infoproduto', texto: 'Quebra de objeção com prova: a pergunta que a pessoa faz é respondida com um número (validado por 4.855 gestores atuantes).' },
]

const FAQ = [
  { q: 'O acesso é imediato?', a: 'Sim. Assim que o pagamento é aprovado, a Hotmart te manda um e-mail e você entra na área de membros com o mesmo e-mail da compra. No Pix e no cartão, leva minutos. No boleto, até 2 dias úteis.' },
  { q: 'Funciona pro meu nicho?', a: 'O acervo é organizado por objetivo do anúncio (ser descoberta, gerar autoridade, provar que funciona, quebrar objeção, vender agora), e não por nicho. A estrutura que faz uma loja de roupa vender é a mesma que faz uma nutricionista fechar agenda. E dá pra filtrar por negócio local, serviço, infoproduto e e-commerce.' },
  { q: 'Preciso saber editar vídeo ou ter designer?', a: 'Não. Boa parte dos anúncios que mais vendem do acervo foi gravada no celular, sem edição elaborada. O que faz diferença é a estrutura, e é isso que a análise te mostra.' },
  { q: 'Posso copiar os anúncios?', a: 'Você usa como referência de estrutura: gancho, sequência, prova, fechamento. O produto, a fala e o visual são seus. Copiar anúncio de outra marca palavra por palavra não funciona e não é o que a gente faz.' },
  { q: 'Nunca rodei um anúncio. É pra mim?', a: 'É, se você quer começar pelo caminho mais curto: ver o que já dá certo antes de criar o seu. Aqui você não aprende a configurar campanha. Aprende o que colocar dentro dela.' },
  { q: `Depois de ${OFERTA.acessoPor} de acesso, o que acontece?`, a: 'Durante esse período você tem tudo: as coleções, as curadorias novas de cada mês e as análises. Perto do fim, a gente te avisa e você decide se quer renovar.' },
  { q: 'Tenho reembolso?', a: `Tem. São ${OFERTA.garantiaDias} dias de garantia. Entra, navega, lê as análises. Se não fizer sentido pra você, pede o reembolso direto na Hotmart e recebe 100% de volta, sem precisar explicar.` },
]

/* ── Pedaços ── */

function Icone({ nome, size = 22 }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }
  switch (nome) {
    case 'grid': return <svg {...p}><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></svg>
    case 'pasta': return <svg {...p}><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
    case 'estrela': return <svg {...p}><path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.3 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z"/></svg>
    case 'lupa': return <svg {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
    case 'filtro': return <svg {...p}><path d="M3 5h18l-7 8v6l-4 2v-8z"/></svg>
    case 'celular': return <svg {...p}><rect x="6" y="2" width="12" height="20" rx="3"/><path d="M11 18h2"/></svg>
    case 'check': return <svg {...p} strokeWidth={2.6}><path d="M20 6L9 17l-5-5"/></svg>
    case 'seta': return <svg {...p} strokeWidth={2.2}><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
    case 'chevron': return <svg {...p} strokeWidth={2}><path d="m6 9 6 6 6-6"/></svg>
    default: return null
  }
}

function Cta({ children, variante = 'terra', largo = false, className = '' }) {
  return (
    <a className={`lp-cta lp-cta--${variante} ${largo ? 'lp-cta--largo' : ''} ${className}`} href={OFERTA.checkoutUrl} rel="noopener">
      <span>{children}</span>
      <Icone nome="seta" size={18} />
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
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); io.disconnect() } }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return <Tag ref={ref} className={`lp-reveal ${vis ? 'is-in' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }} {...rest}>{children}</Tag>
}

// Celular do topo: mostra as coleções como na área de membros, trocando sozinho
function Celular({ ativa, onPick }) {
  const col = COLECOES[ativa]
  return (
    <div className="lp-phone" aria-hidden="true">
      <div className="lp-phone__frame">
        <span className="lp-phone__notch" />
        <div className="lp-phone__screen">
          <div className="lp-phone__topbar">
            <span className="lp-phone__hello">Olá, Ana ✦</span>
            <span className="lp-phone__avatar">A</span>
          </div>
          <div className="lp-phone__hero" style={{ background: col.gradient }}>
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
                <button type="button" key={c.slug} className={`lp-phone__card ${i === ativa ? 'is-on' : ''}`} style={{ background: c.gradient }} onClick={() => onPick(i)} tabIndex={-1}>
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

// Card 9:16 com leve inclinação seguindo o mouse (só em telas com cursor)
function CardColecao({ c, index }) {
  const ref = useRef(null)
  function move(e) {
    const el = ref.current
    if (!el || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    el.style.setProperty('--rx', `${(-y * 10).toFixed(2)}deg`)
    el.style.setProperty('--ry', `${(x * 12).toFixed(2)}deg`)
  }
  function leave() {
    const el = ref.current
    if (!el) return
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
  }
  return (
    <li className={`lp-col ${c.destaque ? 'lp-col--destaque' : ''}`} style={{ animationDelay: `${index * 60}ms` }}>
      <div ref={ref} className="lp-col__tilt" onMouseMove={move} onMouseLeave={leave}>
        <div className="lp-col__media" style={{ background: c.gradient }}>
          <span className="lp-col__num">{c.destaque ? '★' : String(index + 1).padStart(2, '0')}</span>
          <div className="lp-col__text">
            <span className="lp-col__kicker">{c.kicker}</span>
            <strong>{c.titulo}</strong>
            <small>{c.subtitulo}</small>
          </div>
        </div>
      </div>
    </li>
  )
}

function Faq({ item, open, onToggle, id }) {
  return (
    <div className={`lp-faq__item ${open ? 'is-open' : ''}`}>
      <button type="button" className="lp-faq__q" aria-expanded={open} aria-controls={id} onClick={onToggle}>
        <span>{item.q}</span>
        <Icone nome="chevron" size={20} />
      </button>
      <div id={id} className="lp-faq__a" aria-hidden={!open}>
        <div><p>{item.a}</p></div>
      </div>
    </div>
  )
}

/* ── Página ── */

export default function AcervoPage() {
  const [barra, setBarra] = useState(false)
  const [aberta, setAberta] = useState(-1)
  const [ativa, setAtiva] = useState(0)
  const pausado = useRef(false)

  useEffect(() => {
    document.title = 'Acervo de Anúncios — Método AVVA'
    const onScroll = () => setBarra(window.scrollY > 520)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Troca a coleção do celular sozinha; pausa um pouco quando a pessoa escolhe
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
    <div className="lp">
      {/* Barra que aparece ao rolar */}
      <div className={`lp-bar ${barra ? 'is-visible' : ''}`} aria-hidden={!barra}>
        <div className="lp-bar__inner">
          <span className="lp-bar__nome">Acervo de Anúncios</span>
          <div className="lp-bar__right">
            <span className="lp-bar__preco">{OFERTA.preco}</span>
            <Cta variante="terra" className="lp-cta--sm">Quero o acervo</Cta>
          </div>
        </div>
      </div>

      {/* ── 1. Hero ── */}
      <section className="lp-hero" id="topo">
        <div className="lp-hero__inner">
          <span className="lp-eyebrow">Acervo de Anúncios</span>
          <h1 className="lp-hero__title">
            Para de adivinhar criativo.
          </h1>
          <p className="lp-hero__sub">
            Uma biblioteca de anúncios que já vendem, organizados por objetivo e com a análise do porquê funcionam. Você escolhe, adapta pro seu nicho e coloca no ar.
          </p>
          <div className="lp-hero__actions">
            <Cta>Quero o acervo</Cta>
            <span className="lp-hero__nota">{OFERTA.preco} · pagamento único · {OFERTA.garantiaDias} dias de garantia</span>
          </div>
        </div>

        <div className="lp-hero__phone">
          <Celular ativa={ativa} onPick={escolher} />
          <div className="lp-chips" role="tablist" aria-label="Coleções">
            {COLECOES.slice(0, 6).map((c, i) => (
              <button type="button" key={c.slug} role="tab" aria-selected={i === ativa} className={`lp-chip ${i === ativa ? 'is-on' : ''}`} onClick={() => escolher(i)}>
                {c.titulo}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── 2. Pra quem é ── */}
      <section className="lp-section lp-branca lp-praquem">
        <div className="lp-container">
          <Reveal className="lp-head">
            <span className="lp-eyebrow">Pra quem é</span>
            <h2>Se você se reconhece em uma dessas, o Acervo nasceu pra você.</h2>
          </Reveal>
          <ul className="lp-tiles">
            {PRA_QUEM.map((item, i) => (
              <Reveal as="li" key={i} className="lp-tile" delay={i * 50}>
                <span className="lp-tile__check"><Icone nome="check" size={16} /></span>
                <p>{item}</p>
              </Reveal>
            ))}
          </ul>
          <Reveal className="lp-center">
            <Cta>Ok, me mostra esse acervo</Cta>
          </Reveal>
        </div>
      </section>

      {/* ── 3. Afirmação ── */}
      <section className="lp-section lp-escura lp-afirma">
        <div className="lp-container">
          <Reveal as="h2" className="lp-afirma__title">
            Muita gente diz que o problema é a verba.<br />
            <span>Quase sempre, o problema é o criativo.</span>
          </Reveal>
          <div className="lp-afirma__grid">
            <Reveal className="lp-glass" delay={80}>
              <p>Existe um motivo pros mesmos anúncios aparecerem pra você há meses: <strong>eles pagam a conta.</strong> E a estrutura deles pode ser a sua.</p>
            </Reveal>
            <Reveal className="lp-glass" delay={160}>
              <p><strong>Você não precisa criar do zero.</strong> Precisa adaptar o que já está validado. É assim que você para de torcer e começa a vender.</p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── 4. Coleções ── */}
      <section className="lp-section lp-colecoes">
        <div className="lp-container">
          <Reveal className="lp-head">
            <span className="lp-eyebrow">Coleções por objetivo</span>
            <h2>Do primeiro contato até a venda.</h2>
            <p>Você não precisa ver tudo. Entra pela coleção do objetivo que o seu negócio precisa hoje. E todo mês chega uma curadoria nova dos melhores anúncios.</p>
          </Reveal>
        </div>
        <Reveal as="ul" className="lp-cols">
          {COLECOES.map((c, i) => <CardColecao key={c.slug} c={c} index={i} />)}
        </Reveal>
        <p className="lp-cols__hint">Arrasta pro lado pra ver todas</p>
      </section>

      {/* ── 5. Como funciona ── */}
      <section className="lp-section lp-branca lp-passos">
        <div className="lp-container">
          <Reveal className="lp-head">
            <span className="lp-eyebrow">Como funciona</span>
            <h2>Levou 4 minutos. Sério.</h2>
          </Reveal>
          <ol className="lp-passos__grid">
            {PASSOS.map((p, i) => (
              <Reveal as="li" key={p.n} className="lp-passo" delay={i * 90}>
                <span className="lp-passo__n">{p.n}</span>
                <h3>{p.titulo}</h3>
                <p>{p.texto}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ── 6. Entregas ── */}
      <section className="lp-section lp-entregas">
        <div className="lp-container">
          <Reveal className="lp-head">
            <span className="lp-eyebrow">O que você leva</span>
            <h2>É aqui que você para de adivinhar.</h2>
          </Reveal>
          <ul className="lp-entregas__grid">
            {ENTREGAS.map((e, i) => (
              <Reveal as="li" key={e.titulo} className="lp-entrega" delay={i * 50}>
                <span className="lp-entrega__icone"><Icone nome={e.icone} /></span>
                <h3>{e.titulo}</h3>
                <p>{e.texto}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ── 7. Análises ── */}
      <section className="lp-section lp-branca lp-analises">
        <div className="lp-container">
          <Reveal className="lp-head">
            <span className="lp-eyebrow">Um gostinho</span>
            <h2>Não é "olha que bonito". É "olha por que vende".</h2>
            <p>Três análises de verdade, do jeito que estão lá dentro.</p>
          </Reveal>
          <div className="lp-analises__grid">
            {ANALISES.map((a, i) => (
              <Reveal as="article" key={a.titulo} className="lp-analise" delay={i * 80}>
                <span className="lp-analise__tipo">{a.tipo}</span>
                <h3>{a.titulo}</h3>
                <p>{a.texto}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. Investimento ── */}
      <section className="lp-section lp-invest" id="oferta">
        <div className="lp-container lp-container--narrow">
          <Reveal className="lp-price">
            <span className="lp-eyebrow">Investimento</span>
            <div className="lp-price__valor">
              <strong>{OFERTA.preco}</strong>
              {OFERTA.parcelas && <span>{OFERTA.parcelas}</span>}
            </div>
            <p className="lp-price__nota">Pagamento único, sem mensalidade. Menos que um almoço. Menos que um dia de anúncio errado.</p>
            <Cta largo>Sim, quero agora</Cta>
            <ul className="lp-price__selos">
              <li><Icone nome="check" size={14} /> Acesso imediato</li>
              <li><Icone nome="check" size={14} /> {OFERTA.garantiaDias} dias de garantia</li>
              <li><Icone nome="check" size={14} /> Pix, cartão ou boleto</li>
              <li><Icone nome="check" size={14} /> Pagamento seguro pela Hotmart</li>
            </ul>
            <div className="lp-price__garantia">
              <strong>{OFERTA.garantiaDias} dias de garantia, sem perguntas.</strong>
              <span>Entra, navega, lê as análises. Se não fizer sentido pra você, pede o reembolso direto na Hotmart e recebe 100% de volta.</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 9. Flora ── */}
      <section className="lp-section lp-branca lp-flora">
        <div className="lp-container lp-flora__grid">
          <Reveal className="lp-flora__foto" aria-hidden="true">
            {/* AJUSTAR: trocar pela foto da Flora (ex.: /flora.jpg em public/) */}
            <span>F</span>
          </Reveal>
          <Reveal className="lp-flora__texto" delay={100}>
            <span className="lp-eyebrow">Quem garimpa os anúncios</span>
            <h2>Flora, do Método AVVA</h2>
            <p>É a Flora quem garimpa, seleciona e analisa cada anúncio do acervo, mês a mês. O critério é um só: <strong>está rodando e está vendendo.</strong> O que entra no acervo já passou por esse filtro antes de chegar em você.</p>
            <p>Ela não acredita em criativo de sorte. Acredita em estrutura: gancho, prova e oferta, nessa ordem. Anúncio bom não é o mais bonito. É o que faz a pessoa certa parar, entender e comprar.</p>
            {/* AJUSTAR: completar com a trajetória e os números da Flora (anos com tráfego, alunas, resultados) */}
          </Reveal>
        </div>
      </section>

      {/* ── 10. FAQ ── */}
      <section className="lp-section lp-faq">
        <div className="lp-container lp-container--narrow">
          <Reveal className="lp-head lp-head--center">
            <span className="lp-eyebrow">Dúvidas</span>
            <h2>O que as alunas perguntam antes de entrar</h2>
          </Reveal>
          <Reveal className="lp-faq__lista" delay={80}>
            {FAQ.map((item, i) => (
              <Faq key={item.q} id={`faq-${i}`} item={item} open={aberta === i} onToggle={() => setAberta(aberta === i ? -1 : i)} />
            ))}
          </Reveal>
        </div>
      </section>

      {/* ── 11. Fechamento ── */}
      <section className="lp-section lp-escura lp-final">
        <div className="lp-container lp-final__inner">
          <Reveal as="h2">Você pode continuar adivinhando criativo.<br /><span>Ou pode abrir o acervo.</span></Reveal>
          <Reveal as="p" delay={80}>Entra hoje, escolhe uma coleção, adapta um anúncio e coloca no ar ainda essa semana.</Reveal>
          <Reveal className="lp-final__cta" delay={160}>
            <Cta variante="clara">Quero o acervo por {OFERTA.preco}</Cta>
          </Reveal>
        </div>
        <footer className="lp-footer">
          <span>© {new Date().getFullYear()} Método AVVA</span>
          <Link to="/login">Já sou aluna</Link>
        </footer>
      </section>
    </div>
  )
}
