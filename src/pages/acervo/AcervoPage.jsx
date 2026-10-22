import { useEffect, useState } from 'react'
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
  // Order bump: aparece só como teaser (a oferta de verdade fica no checkout)
  orderBump: { nome: 'kit de execução', preco: 'R$ 17' }, // AJUSTAR preço
  // Números mostrados na página (atualizar quando o acervo crescer)
  totalAnuncios: '70+',
  totalColecoes: 6,
}

const PRA_QUEM = [
  [<><strong>tem um negócio local, presta serviço, vende infoproduto ou tem e-commerce</strong> e roda (ou quer rodar) os próprios anúncios</>],
  [<><strong>posta, posta,</strong> e ninguém compra</>],
  [<><strong>abre o gerenciador,</strong> trava na hora de criar e fecha de novo</>],
  [<><strong>vê o anúncio da concorrente</strong> e pensa: por que eu não pensei nisso?</>],
  [<><strong>não sabe editar vídeo</strong> e acha que por isso não pode anunciar</>],
  [<><strong>prefere ver o que já funciona</strong> antes de inventar o seu</>],
  [<><strong>quer colocar um anúncio no ar</strong> ainda essa semana</>],
]

const AFIRMACOES = [
  <>existe um motivo pros mesmos anúncios aparecerem pra você há meses: <strong>eles pagam a conta.</strong> e a estrutura deles pode ser a sua.</>,
  <><strong>você não precisa criar do zero.</strong> precisa adaptar o que já está validado. é assim que você para de torcer <strong>e começa a vender.</strong></>,
]

const ENTREGAS = [
  { icone: 'calendario', texto: <><strong>{OFERTA.acessoPor} de acesso</strong>, com tudo que entrar nesse período</> },
  { icone: 'grid', texto: <><strong>{OFERTA.totalAnuncios} anúncios validados</strong>: vídeo, estático, carrossel e página de venda em pdf</> },
  { icone: 'pasta', texto: <><strong>{OFERTA.totalColecoes} coleções por objetivo</strong>, do primeiro contato até a venda</> },
  { icone: 'estrela', texto: <><strong>melhores do mês</strong>: uma seleção nova todo mês, garimpada pela flora</> },
  { icone: 'lupa', texto: <><strong>análise de cada anúncio</strong>: por que funciona, em poucas linhas e sem jargão</> },
  { icone: 'filtro', texto: <><strong>filtro por nicho</strong>: negócio local, serviço, infoproduto e e-commerce</> },
  { icone: 'celular', texto: <><strong>área de membros no celular</strong>, com favoritos, busca e "continue de onde parou"</> },
]

// Análises reais do acervo, do jeito que estão lá dentro
const ESPIADINHA = [
  {
    marca: '01',
    titulo: 'diandra: "pega de surpresa"',
    tipo: 'vídeo · serviço e infoproduto',
    texto: 'a sacada começa no formato: o roteiro é estruturado, mas a gravação faz parecer que a especialista foi pega de surpresa e está simplesmente respondendo uma pergunta. enquanto ela elimina uma alternativa depois da outra (postar todo dia, carrossel, impulsionar, social media), a curiosidade aumenta: se nenhuma dessas é a resposta, qual é?',
  },
  {
    marca: '02',
    titulo: 'letícia vaz store',
    tipo: 'vídeo · e-commerce',
    texto: 'ela te prende num desafio, te ensina a vender e te converte em um minuto e meio. dá vários exemplos mostrando a calça e falando as qualidades enquanto você fica curiosa pra ver todas as formas de vendê-la. deu uma aula de marketing enquanto fazia uma venda.',
  },
  {
    marca: '03',
    titulo: 'pedro sobral: "como sei que funciona pra mim?"',
    tipo: 'imagem estática · infoproduto',
    texto: 'quebra de objeção com prova: a pergunta que a pessoa faz é respondida com um número (validado por 4.855 gestores atuantes).',
  },
]

const FAQ = [
  {
    q: 'o acesso é imediato?',
    a: 'sim. assim que o pagamento é aprovado, a hotmart te manda um e-mail e você entra na área de membros com o mesmo e-mail da compra. no pix e no cartão, leva minutos. no boleto, até 2 dias úteis.',
  },
  {
    q: 'funciona pro meu nicho?',
    a: 'o acervo é organizado por objetivo do anúncio (ser descoberta, gerar autoridade, provar que funciona, quebrar objeção, vender agora), e não por nicho. a estrutura que faz uma loja de roupa vender é a mesma que faz uma nutricionista fechar agenda. e dá pra filtrar por negócio local, serviço, infoproduto e e-commerce.',
  },
  {
    q: 'preciso saber editar vídeo ou ter designer?',
    a: 'não. boa parte dos anúncios que mais vendem do acervo foi gravada no celular, sem edição elaborada. o que faz diferença é a estrutura, e é isso que a análise te mostra.',
  },
  {
    q: 'posso copiar os anúncios?',
    a: 'você usa como referência de estrutura: gancho, sequência, prova, fechamento. o produto, a fala e o visual são seus. copiar anúncio de outra marca palavra por palavra não funciona e não é o que a gente faz.',
  },
  {
    q: 'nunca rodei um anúncio. é pra mim?',
    a: 'é, se você quer começar pelo caminho mais curto: ver o que já dá certo antes de criar o seu. aqui você não aprende a configurar campanha. aprende o que colocar dentro dela.',
  },
  {
    q: `depois de ${OFERTA.acessoPor} de acesso, o que acontece?`,
    a: `durante esse período você tem tudo: as coleções, as seleções novas que entram todo mês e as análises. perto do fim, a gente te avisa e você decide se quer renovar.`,
  },
  {
    q: 'tenho reembolso?',
    a: `tem. ${OFERTA.garantiaDias} dias de garantia. entra, navega, lê as análises. se não fizer sentido pra você, pede o reembolso direto na hotmart e recebe 100% de volta, sem precisar explicar.`,
  },
]

const colecoes = COLLECTIONS.filter(c => c.order <= 6).sort((a, b) => a.order - b.order)

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
      {/* ── Topo ── */}
      <header className="lp-top">
        <a className="lp-top__brand" href="#topo">método avva</a>
        <Link to="/login" className="lp-top__login">já sou aluna</Link>
      </header>

      {/* ── 1. Hero ── */}
      <section className="lp-hero" id="topo">
        <span className="lp-estrela lp-estrela--1" aria-hidden="true">✦</span>
        <span className="lp-estrela lp-estrela--2" aria-hidden="true">✦</span>
        <div className="lp-hero__inner">
          <Logo className="lp-logo--hero" />
          <h1 className="lp-hero__frase">
            a biblioteca de anúncios das empreendedoras que <em>cansaram de adivinhar criativo</em> e querem copiar a estrutura do que já vende.
          </h1>
          <p className="lp-hero__sub">
            você escolhe pelo objetivo, lê por que funciona, adapta pro seu nicho e coloca no ar. tudo pelo celular, com acesso imediato.
          </p>
          <Cta>quero o acervo 🤎</Cta>
          <p className="lp-hero__nota">{OFERTA.preco} · pagamento único · {OFERTA.garantiaDias} dias de garantia</p>
        </div>
      </section>

      {/* ── 2. Pra quem é ── */}
      <section className="lp-section lp-praquem">
        <div className="lp-container">
          <h2 className="lp-titulo lp-titulo--colchete">pra quem é</h2>
          <p className="lp-praquem__intro">
            o feed virou um loop de criativo igual. anúncio bonito que não vende, dancinha que não converte, verba indo embora. <em>o acervo nasce pra você que:</em>
          </p>
          <ul className="lp-checks">
            {PRA_QUEM.map((item, i) => (
              <li key={i}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <Cta largo>ok, me mostra esse acervo</Cta>
        </div>
      </section>

      {/* ── 3. Afirmação ── */}
      <section className="lp-section lp-afirma">
        <span className="lp-estrela lp-estrela--3" aria-hidden="true">✦</span>
        <div className="lp-container lp-container--narrow">
          <h2 className="lp-titulo lp-titulo--grande">
            muita gente diz que o problema é a verba.<br />
            quase sempre <strong>o problema é o criativo.</strong>
          </h2>
          <div className="lp-afirma__caixas">
            {AFIRMACOES.map((a, i) => (
              <div key={i} className="lp-caixa">
                <Seta />
                <p>{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. O que é + coleções ── */}
      <section className="lp-section lp-escuro lp-oque">
        <div className="lp-container lp-oque__grid">
          <div className="lp-oque__texto">
            <p className="lp-oque__frase">
              o acervo é uma <span className="lp-cor-areia">estante de anúncios</span> que estão vendendo agora, organizada pelo que você precisa <span className="lp-cor-areia">hoje</span>, com a análise do porquê funciona, pra te ajudar <em>a ter anúncios mais <span className="lp-cor-terra">simples, honestos e que vendem.</span></em>
            </p>
            <span className="lp-oque__legenda">as coleções, por objetivo</span>
          </div>
          <ol className="lp-cards">
            {colecoes.map((c, i) => (
              <li key={c.slug} className={`lp-card ${i % 2 ? 'lp-card--areia' : 'lp-card--terra'}`}>
                <Seta />
                <h3>{c.title.toLowerCase()}</h3>
                <p>{c.subtitle.toLowerCase()}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── 5. Entregas ── */}
      <section className="lp-section lp-entregas">
        <div className="lp-container lp-container--narrow">
          <h2 className="lp-titulo lp-titulo--grande lp-titulo--centro">
            é aqui que você<br /><strong>para de adivinhar.</strong>
          </h2>
          <ul className="lp-entregas__lista">
            {ENTREGAS.map((e, i) => (
              <li key={i}>
                <Icone nome={e.icone} />
                <span>{e.texto}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── 6. Espiadinha ── */}
      <section className="lp-section lp-escuro lp-escuro--umber lp-espiada">
        <div className="lp-container lp-container--narrow">
          <h2 className="lp-titulo lp-titulo--grande lp-titulo--centro lp-titulo--claro">
            pra você dar uma<br /><strong>espiadinha…</strong>
          </h2>
          <p className="lp-espiada__sub">três análises de verdade, do jeito que estão lá dentro. o resto você descobre lá dentro, né?</p>
          <div className="lp-espiada__cards">
            {ESPIADINHA.map((a, i) => (
              <article key={a.marca} className={`lp-espiada__card ${i % 2 ? 'lp-espiada__card--areia' : 'lp-espiada__card--terra'}`}>
                <span className="lp-espiada__marca" aria-hidden="true">{a.marca}</span>
                <div>
                  <span className="lp-espiada__tipo">{a.tipo}</span>
                  <h3>{a.titulo}</h3>
                  <p>{a.texto}</p>
                </div>
              </article>
            ))}
          </div>
          <Cta variante="gradiente" largo>quero começar 🤎</Cta>
        </div>
      </section>

      {/* ── 7. Investimento ── */}
      <section className="lp-section lp-invest" id="oferta">
        <span className="lp-estrela lp-estrela--4" aria-hidden="true">✦</span>
        <span className="lp-estrela lp-estrela--5" aria-hidden="true">✦</span>
        <div className="lp-container lp-container--narrow lp-invest__inner">
          <span className="lp-pill">investimento</span>
          <p className="lp-invest__preco">{OFERTA.preco}</p>
          <p className="lp-invest__detalhe">
            {OFERTA.parcelas && <><strong>{OFERTA.parcelas}</strong><br /></>}
            (pagamento único, sem mensalidade)
          </p>
          <Cta variante="teal" largo>yay, quero agora</Cta>
          <ul className="lp-selos" aria-label="garantias">
            <li>acesso imediato</li>
            <li>{OFERTA.garantiaDias} dias de garantia</li>
            <li>pix, cartão ou boleto</li>
            <li>pagamento seguro pela hotmart</li>
          </ul>
          {OFERTA.orderBump && (
            <p className="lp-invest__bump">
              psiu: no checkout você pode adicionar o <strong>{OFERTA.orderBump.nome}</strong> por {OFERTA.orderBump.preco}. ganchos, estruturas narrativas e prompts de ia pra transformar qualquer anúncio do acervo no <em>seu</em> anúncio.
            </p>
          )}
        </div>
      </section>

      {/* ── 8. Quem é a Flora ── */}
      <section className="lp-section lp-flora">
        <div className="lp-container lp-flora__grid">
          <div className="lp-flora__texto">
            <h2 className="lp-titulo">quem é a flora</h2>
            <p>eu sou a flora, do método avva. sou quem garimpa, seleciona e analisa cada anúncio do acervo, mês a mês.</p>
            <p>o critério é um só: <strong>está rodando e está vendendo.</strong> o que entra no acervo já passou por esse filtro antes de chegar em você.</p>
            <p>não acredito em criativo de sorte. acredito em estrutura: gancho, prova e oferta, nessa ordem. anúncio bom não é o mais bonito. é o que faz a pessoa certa parar, entender e comprar.</p>
            {/* AJUSTAR: completar com a trajetória e os números da Flora (anos com tráfego, alunas, resultados) */}
            <p>agora é a sua vez de abrir o acervo e parar de adivinhar.</p>
          </div>
          <div className="lp-flora__foto" aria-hidden="true">
            {/* AJUSTAR: trocar pela foto da Flora (ex.: /flora.jpg em public/) */}
            <span>F</span>
            <i className="lp-estrela lp-estrela--foto">✦</i>
          </div>
        </div>
      </section>

      {/* ── 9. FAQ ── */}
      <section className="lp-section lp-escuro lp-faq">
        <div className="lp-container lp-container--narrow">
          <div className="lp-faq__lista">
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
                  <div id={`faq-${i}`} className="lp-faq__a" hidden={!open}>
                    <p>{item.a}</p>
                  </div>
                </div>
              )
            })}
          </div>
          <Logo className="lp-logo--rodape" />
          <div className="lp-rodape">
            <span>© {new Date().getFullYear()} método avva</span>
            <Link to="/login">já sou aluna</Link>
          </div>
        </div>
      </section>

      {/* ── Barra fixa (mobile) ── */}
      <div className={`lp-sticky ${stickyVisible ? 'is-visible' : ''}`} aria-hidden={!stickyVisible}>
        <span className="lp-sticky__preco">{OFERTA.preco}</span>
        <Cta>quero o acervo 🤎</Cta>
      </div>
    </div>
  )
}
