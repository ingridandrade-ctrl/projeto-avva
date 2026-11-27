import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { COLLECTIONS, NICHE_LABELS, itemTypeLabel } from '../../lib/catalog'
import { TIPOS, TONS, DESTINOS } from '../../lib/adaptar'
import DriveEmbed from '../../components/ads/DriveEmbed'
import AdaptPanel from '../../components/ads/AdaptPanel'
import Tag from '../../components/ui/Tag'
import CopyButton from '../../components/ui/CopyButton'
import '../../components/ads/AdModal.css'
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
  reforco: 'Dá menos de R$ 0,20 por dia. Um anúncio que não vende custa beeeem mais que isso.',
  garantiaDias: 7,
  acessoPor: '1 ano',
  totalColecoes: 6,
  // Julia sugeriu R$ 97 (confirmar com a Flora antes de publicar): troque preco e precoDe
  // Vídeo do acervo por dentro (gravação de tela do celular). Vazio = mostra o mockup no lugar.
  videoUrl: '',                 // AJUSTAR: link do YouTube/Vimeo ou arquivo .mp4 em public/acervo/
  videoPoster: '/acervo/tela-acervo.webp',
}

// Prints do passo a passo (AJUSTAR: trocar pelos prints reais da área de membros no celular)
const PASSOS_PRINTS = [
  { n: '1', titulo: 'Você entra e escolhe o objetivo', texto: 'Atrair seguidores, captar leads, provar que funciona, vender agora. Cada coleção é um momento do funil, e você entra pela porta que precisa hoje.', src: '/acervo/passo-1.webp', alt: 'As seis coleções por objetivo na área de membros' },
  { n: '2', titulo: 'Você filtra pelo seu nicho', texto: 'Dentro da coleção, você marca o seu tipo de negócio e vê só o que serve pro seu caso.', src: '', alt: 'Print: filtro por nicho dentro de uma coleção' },
  { n: '3', titulo: 'Você abre o anúncio, lê a análise e faz a sua versão', texto: 'A análise explica por que ele vende. Do lado, o botão Fazer a minha versão: você preenche a sua ficha e abre direto na sua IA.', src: '/acervo/passo-3.webp', alt: 'Anúncio aberto na área de membros, com a análise do lado' },
]


// Quem faz o acervo: fotos da colagem (AJUSTAR: colocar 5 fotos em public/acervo/quem/, 1.jpg a 5.jpg)
const QUEM_FOTOS = [
  { src: '/acervo/quem/1.jpg', alt: 'Flora e Ingrid num mirante' },
  { src: '/acervo/quem/2.jpg', alt: 'Flora e Ingrid no Rio' },
  { src: '/acervo/quem/3.jpg', alt: 'Flora e Ingrid se abraçando' },
  { src: '/acervo/quem/4.jpg', alt: 'Flora e Ingrid trabalhando' },
]

// Depoimentos de quem já comprou (AJUSTAR: colar os reais; nome e nicho). Vazio = seção não aparece.
const DEPOIMENTOS = [
  // { nome: 'Nome', nicho: 'Clínica de estética', texto: '...' },
]

// Os quatro tipos de negócio do filtro, com o que a pessoa encontra em cada um
const TIPOS_NEGOCIO = [
  { nome: 'Negócio local', icone: 'pino', texto: 'Clínica, salão, loja de rua, restaurante: anúncios que trazem gente até o seu endereço' },
  { nome: 'Prestação de serviço', icone: 'agenda', texto: 'Consultoria, estética, nutrição, advocacia: anúncios que fecham agenda e orçamento' },
  { nome: 'Infoproduto', icone: 'play', texto: 'Curso, mentoria, comunidade: anúncios que captam, provam e vendem no digital' },
  { nome: 'E-commerce', icone: 'sacola', texto: 'Loja online e produto físico: anúncios que mostram, convencem e levam pro carrinho' },
]

const PRA_QUEM = [
  <><strong>Tem um negócio local, presta serviço, vende infoproduto ou tem e-commerce</strong> e roda (ou quer rodar) os próprios anúncios</>,
  <><strong>Acabou de colocar um produto no mundo</strong> e está sem ideia de anúncio</>,
  <><strong>Cansou de garimpar referência sozinha</strong> e quer entender por que cada uma funciona</>,
  <><strong>Prefere ver o que já funciona</strong> antes de inventar o seu</>,
  <><strong>Já gastou com anúncio que não vendeu</strong> e quer saber o que faltou no criativo</>,
  <><strong>Quer criar o anúncio em minutos</strong>, com uma ferramenta que escreve a sua versão na sua voz</>,
]

// Coleções mostradas nos cards (as 6 por objetivo + a curadoria mensal)
// Capas reais das coleções, as mesmas da área de membros (cadastradas no admin)
const CAPAS_COLECOES = {
  'ser-descoberta': 'https://ufprndosuvqbrqlvndry.supabase.co/storage/v1/object/public/covers/ser-descoberta-1793649588587.webp',
  'captar-leads': 'https://ufprndosuvqbrqlvndry.supabase.co/storage/v1/object/public/covers/captar-leads-1793653459281.webp',
  'mostrar-que-voce-entende': 'https://ufprndosuvqbrqlvndry.supabase.co/storage/v1/object/public/covers/mostrar-que-voce-entende-1793654306990.webp',
  'provar-que-funciona': 'https://ufprndosuvqbrqlvndry.supabase.co/storage/v1/object/public/covers/provar-que-funciona-1793650114882.webp',
  'quebrar-o-mas': 'https://ufprndosuvqbrqlvndry.supabase.co/storage/v1/object/public/covers/quebrar-o-mas-1793654125233.webp',
  'vender-agora': 'https://ufprndosuvqbrqlvndry.supabase.co/storage/v1/object/public/covers/vender-agora-1793653833845.webp',
}

const COLECOES = [
  ...COLLECTIONS.filter(c => !c.retired && !c.isBonus).sort((a, b) => a.order - b.order).map(c => ({
    slug: c.slug,
    titulo: c.title,
    subtitulo: c.subtitle,
    kicker: c.isBonus ? 'Bônus' : `Coleção ${String(c.order).padStart(2, '0')}`,
    gradient: c.gradient,
    capa: CAPAS_COLECOES[c.slug] || '',
  })),
  {
    slug: 'melhores-do-mes',
    titulo: 'Melhores do mês',
    subtitulo: 'Curadoria nova todo mês',
    kicker: 'Todo mês',
    gradient: 'linear-gradient(135deg, #3F7A66 0%, #8A5C3F 55%, #D4B99A 100%)',
    capa: 'https://ufprndosuvqbrqlvndry.supabase.co/storage/v1/object/public/covers/melhores-de-novembro-2026-1793916891065.webp',
  },
]

// Bônus: entram junto com o acervo, sem custo
const BONUS = [
  { titulo: 'Especial Mini VSL', texto: 'Anúncios mais longos, de 1 a 3 minutos, que vendem sozinhos. Pra quem quer entender como se segura atenção até a oferta.', capa: '/acervo/capa-minivsl.webp' },
  { titulo: 'Especial Páginas', texto: 'Páginas de vendas, captura, obrigado e serviço, com a análise do que faz cada uma converter. E a nossa ferramenta monta a sua, bloco por bloco.', capa: '/acervo/capa-paginas.webp' },
]

// A ferramenta, passo a passo, do jeito que acontece lá dentro
const FERRAMENTA_PASSOS = [
  {
    n: '1',
    titulo: 'Você preenche a sua ficha uma vez.',
    texto: 'O que você vende, pra quem, o que muda pra ela, uma prova real, o "mas" que você mais ouve. Nada é obrigatório, e fica salvo no seu celular. Na próxima vez, está tudo lá.',
  },
  {
    n: '2',
    titulo: 'Você escolhe como escreve.',
    texto: 'Direta, leve, acolhedora, elegante, provocadora, técnica. Cada tom vira uma regra concreta pra IA. E se você colar um texto seu, uma legenda ou um áudio transcrito, ela imita o seu ritmo e as suas palavras.',
  },
  {
    n: '3',
    titulo: 'Você diz pra onde o anúncio leva.',
    texto: 'WhatsApp, site, página de vendas, perfil, direct. E o que a pessoa ganha ao clicar. A ferramenta já sugere o destino mais comum pra aquele tipo de anúncio.',
  },
  {
    n: '4',
    titulo: 'Você abre no ChatGPT ou no Claude.',
    texto: 'Um toque e a sua IA abre com tudo montado: a sequência do anúncio original, a análise, a sua ficha e as regras. Ela escreve a sua versão com a mesma duração, na sua voz, com a sua prova. Se faltar alguma informação, ela pergunta antes de escrever, em vez de inventar.',
  },
]

// O que a ferramenta garante (vem das regras que o prompt carrega)
const FERRAMENTA_REGRAS = [
  { titulo: 'Não copia o original', texto: 'Ela repete a sequência (gancho, desenvolvimento, prova, fechamento), nunca as frases.' },
  { titulo: 'Não inventa número', texto: 'Prova, preço, prazo e garantia só entram se você deu. Sem prova, ela não cria uma.' },
  { titulo: 'Pergunta antes de chutar', texto: 'Se faltar material pra algum passo, ela para e pergunta, no máximo três coisas, numa mensagem só.' },
  { titulo: 'Sem cara de IA', texto: 'A lista do que ela não pode escrever vai junto: validação pronta, pergunta retórica, frase de efeito, jargão, emoji, exclamação.' },
  { titulo: 'Funciona na versão gratuita', texto: 'ChatGPT ou Claude, sem plano pago. Se você usa outra IA, copia o prompt e cola lá.' },
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
// Mesmo formato dos anúncios do acervo: o pop-up da espiadinha é o modal da área de membros
const ESPIADINHA = [
  {
    id: 'espiada-1',
    marca: '01',
    title: 'Diandra: "pega de surpresa"',
    tipo: 'Vídeo · Serviço e infoproduto',
    colecao: 'Melhores de Setembro 2026',
    media_type: 'video',
    niches: ['servico', 'infoproduto'],
    objectives: ['vender'],
    drive_url: 'https://drive.google.com/file/d/18USYqZIvfmPj5PC11trkP1sG-EqRc_yL/view',
    analysis: 'Começa no formato: o roteiro é estruturado, mas a gravação faz parecer que a especialista foi pega de surpresa e está simplesmente respondendo uma pergunta. Enquanto ela elimina uma alternativa depois da outra (postar todo dia, carrossel, impulsionar, social media), a curiosidade aumenta: se nenhuma dessas é a resposta, qual é?',
  },
  {
    id: 'espiada-2',
    marca: '02',
    title: 'Letícia Vaz Store',
    tipo: 'Vídeo · E-commerce',
    colecao: 'Melhores de Julho 2026',
    media_type: 'video',
    niches: ['ecommerce'],
    objectives: ['vender'],
    drive_url: 'https://drive.google.com/file/d/1BSsRMSv2EyuAF_2vtr7vArw_2-8vtY_Z/view',
    analysis: 'Ela te prende num desafio, te ensina a vender e te converte em um minuto e meio. Dá vários exemplos mostrando a calça e falando as qualidades enquanto você fica curiosa pra ver todas as formas de vendê-la. Deu uma aula de marketing enquanto fazia uma venda.',
  },
  {
    id: 'espiada-3',
    marca: '03',
    title: 'Pedro Sobral: "Como sei que funciona pra mim?"',
    tipo: 'Imagem estática · Infoproduto',
    colecao: 'Melhores de Agosto 2026',
    media_type: 'image',
    niches: ['infoproduto'],
    objectives: ['vender'],
    drive_url: 'https://drive.google.com/file/d/1_N96o46TeKGDO9npxoUsK80aG1UlHsbJ/view',
    analysis: 'Quebra de objeção com prova: a pergunta que a pessoa faz é respondida com um número (validado por 4.855 gestores atuantes).',
  },
]

// Checklist do que está incluído, dentro da oferta
const INCLUSO = [
  <><strong>Acervo vivo</strong>: anúncios novos toda semana, com a curadoria que a gente faz pros nossos clientes</>,
  <><strong>Análise em cada anúncio</strong>: por que funciona e o que importa nele</>,
  <><strong>Fazer a minha versão</strong>, a nossa ferramenta, ao lado de todo anúncio e página</>,
  <><strong>{OFERTA.totalColecoes} coleções por objetivo</strong> e filtro por tipo de negócio</>,
  <><strong>Melhores do mês</strong> e os dois especiais: Mini VSL e Páginas</>,
  <><strong>Área de membros no celular</strong>, com favoritos, busca e marcação do que você já viu</>,
  <><strong>{OFERTA.acessoPor} de acesso</strong>, com tudo que entrar nesse período</>,
]


const CENARIOS = [
  {
    letra: 'A',
    titulo: 'Sem o acervo',
    itens: [
      'Você abre o gerenciador e trava na hora de escrever o anúncio',
      'Você posta, impulsiona e torce. A verba vai embora e a venda não vem',
      'Mais um mês olhando o anúncio dos outros, sem saber por que o seu não vende',
    ],
  },
  {
    letra: 'B',
    titulo: 'Com o acervo',
    itens: [
      'Você abre o celular, entra na coleção do que precisa hoje e encontra um anúncio que já funcionou pra um negócio como o seu',
      'Você lê a análise, entende por que ele vende, e a ferramenta escreve a sua versão. Em dez minutos o anúncio está pronto pra gravar',
      'Você já tem anúncios rodando com estrutura, a sua ficha pronta pra fazer o próximo, e olha pra qualquer anúncio sabendo o que faz ele vender',
    ],
  },
]

const FAQ = [
  {
    q: 'Mas o meu nicho é diferente, isso não vai funcionar pra mim…',
    a: 'O acervo é organizado pelo objetivo do anúncio (atrair seguidores, captar leads, mostrar que você entende, provar que funciona, quebrar o "mas...", vender agora), e dentro de cada coleção você filtra pelo seu tipo de negócio. A estrutura que faz uma loja de roupa vender é a mesma que faz uma nutricionista fechar agenda.',
  },
  {
    q: 'Mas eu já comprei curso de anúncio e não saí do lugar…',
    a: 'Aqui você recebe a referência pronta, com a análise do lado: você abre, escolhe pelo objetivo, lê por que funciona, faz a sua versão e coloca no ar. Dá pra publicar o primeiro ainda hoje.',
  },
  {
    q: 'Mas eu nem sei se vou ter tempo de usar…',
    a: 'Cada análise tem poucas linhas. Em dez minutos no celular você escolhe um anúncio, lê por que ele vende e sai com a sua versão pronta pra gravar.',
  },
  {
    q: 'A ferramenta vai fazer o anúncio por mim?',
    a: 'Ela escreve a sua versão, mas a partir do que você entendeu. Primeiro você lê a análise e vê por que aquele anúncio funciona. Depois preenche a sua ficha (o que vende, pra quem, uma prova real, como a sua cliente fala) e a ferramenta escreve na sua voz, com a sua prova, sem inventar número. O objetivo é você ganhar autonomia, e a ferramenta encurtar o caminho.',
  },
  {
    q: 'Nunca rodei um anúncio, tenho pouca verba ou só impulsiono. É pra mim?',
    a: 'É. O acervo mostra o que colocar dentro do anúncio, e criativo com estrutura rende mais com verba pequena ou grande. Impulsionar também é anúncio: você escolhe a estrutura, adapta e impulsiona. Configurar a campanha é outra etapa, e o acervo não cobre essa parte.',
  },
  {
    q: `Depois de ${OFERTA.acessoPor} de acesso, o que acontece?`,
    a: 'Durante esse período você tem tudo: as coleções, os anúncios novos que entram toda semana, as análises e a ferramenta. Perto do fim, a gente te avisa e você decide se quer renovar.',
  },
  {
    q: 'Tenho reembolso?',
    a: `Tem. São ${OFERTA.garantiaDias} dias de garantia. Se você entrar e não fizer sentido pra você, é só pedir e você recebe 100% de volta.`,
  },
]

function IconeTipo({ nome }) {
  const p = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }
  switch (nome) {
    case 'pino': return <svg {...p}><path d="M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>
    case 'agenda': return <svg {...p}><rect x="3" y="4" width="18" height="17" rx="3"/><path d="M8 2v4M16 2v4M3 10h18M8 15l2.5 2.5L16 12"/></svg>
    case 'play': return <svg {...p}><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M10 9l5 3-5 3z" fill="currentColor"/></svg>
    case 'sacola': return <svg {...p}><path d="M5 8h14l-1 12H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>
    default: return null
  }
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
    <Reveal as="li" className={`lp-card ${index % 2 ? 'lp-card--teal' : 'lp-card--terra'}`} delay={index * 60}>
      <div ref={ref} className="lp-card__tilt" onMouseMove={move} onMouseLeave={leave}>
        <span className="lp-card__kicker">{c.kicker}</span>
        <span className="lp-card__orbita" aria-hidden="true"><i>✦</i></span>
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
  const [analiseAberta, setAnaliseAberta] = useState(null) // índice da análise no pop-up
  const fecharRef = useRef(null)
  const origemRef = useRef(null)

  function abrirAnalise(i, e) {
    origemRef.current = e?.currentTarget || null
    setAnaliseAberta(i)
  }

  const [espiadaFav, setEspiadaFav] = useState({}) // favoritar / concluído só visuais, como na área de membros
  const [espiadaVista, setEspiadaVista] = useState({})
  const toque = useRef(null)

  // Pop-up: foco no fechar, Esc fecha, setas trocam de anúncio, body fixo como no modal
  // da área de membros (iOS ignora overflow hidden), foco de volta ao botão que abriu
  function fecharAnalise(depois) {
    setAnaliseAberta(null)
    requestAnimationFrame(() => {
      if (depois) depois()
      else origemRef.current?.focus({ preventScroll: true })
    })
  }

  const popupAberto = analiseAberta !== null
  useEffect(() => {
    if (!popupAberto) return
    const onKey = e => {
      const tag = (e.target?.tagName || '').toLowerCase()
      if (tag === 'input' || tag === 'textarea') return
      if (e.key === 'Escape') fecharAnalise()
      if (e.key === 'ArrowLeft') setAnaliseAberta(i => (i + ESPIADINHA.length - 1) % ESPIADINHA.length)
      if (e.key === 'ArrowRight') setAnaliseAberta(i => (i + 1) % ESPIADINHA.length)
    }
    document.addEventListener('keydown', onKey)
    const scrollY = window.scrollY
    const estilo = document.body.style
    const prev = { overflow: estilo.overflow, position: estilo.position, top: estilo.top, width: estilo.width }
    Object.assign(estilo, { overflow: 'hidden', position: 'fixed', top: `-${scrollY}px`, width: '100%' })
    fecharRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      Object.assign(estilo, prev)
      window.scrollTo({ top: scrollY, behavior: 'instant' })
    }
  }, [popupAberto])

  function onTouchStart(e) { toque.current = { x: e.touches[0].clientX, y: e.touches[0].clientY } }
  function onTouchEnd(e) {
    if (!toque.current) return
    const dx = e.changedTouches[0].clientX - toque.current.x
    const dy = e.changedTouches[0].clientY - toque.current.y
    toque.current = null
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      setAnaliseAberta(i => (i + (dx < 0 ? 1 : ESPIADINHA.length - 1)) % ESPIADINHA.length)
    }
  }

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
      <div className="lp-moldura__inner">
      <section className="lp-hero" id="topo">
        <div className="lp-hero__inner">
          <div className="lp-hero__logo">
            <img className="lp-logomarca" src="/acervo/logo.webp" alt="acervo de anúncios" width="1140" height="970" fetchPriority="high" />
          </div>
          <h1 className="lp-hero__frase">
            A biblioteca de anúncios das empreendedoras que <em>cansaram de começar do zero.</em>
          </h1>
          <p className="lp-hero__destaque">
            No acervo você entende a lógica dos anúncios que vendem e transforma as suas referências favoritas em anúncios pro seu negócio, <strong>com uma ferramenta que escreve a sua versão em poucos cliques.</strong>
          </p>
          <p className="lp-hero__sub">
            Tudo pelo celular, com acesso imediato.
          </p>
          <Cta>Quero o acervo</Cta>
          <p className="lp-hero__nota">Pagamento único · {OFERTA.garantiaDias} dias de garantia</p>
        </div>

      </section>

      <Letreiro />

      {/* ── 2. Veja por dentro (vídeo ou mockup) ── */}
      <section className="lp-section lp-dentro" id="por-dentro">
        <div className="lp-container">
          <Reveal className="lp-dentro__head">
            <span className="lp-pill">Veja por dentro</span>
            <h2 className="lp-titulo lp-titulo--grande">
              O que você vai<br /><strong>encontrar no acervo.</strong>
            </h2>
            <p>O acervo é uma plataforma que reúne os anúncios que funcionam, organizados por objetivo e com filtro por tipo de negócio, pra você que quer escalar o seu negócio no digital, mas está cansada de perder horas tentando acertar o criativo.</p>
          </Reveal>

          <Reveal className="lp-dentro__mock" delay={100}>
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
                      <img src="/acervo/tela-acervo.webp" alt="" width="1400" height="897" loading="lazy" />
                    </div>
                    <div className="lp-laptop__base" />
                  </div>
                  <img className="lp-mock__celular" src="/acervo/mock-celular.png" alt="" width="1060" height="2150" loading="lazy" />
                  <span className="lp-sticker lp-sticker--1">anúncios novos toda semana</span>
                </div>
              )}
          </Reveal>

          {/* 1. Coleções: a frase + as capas reais */}
          <div className="lp-dentro__bloco">
            <Reveal className="lp-dentro__texto">
              <span className="lp-dentro__num">01</span>
              <h3>{OFERTA.totalColecoes} coleções, uma pra cada <strong>momento da venda.</strong></h3>
              <p>De atrair seguidores a vender agora, em vídeo, imagem e carrossel. Você escolhe o seu objetivo e acessa uma curadoria feita pro seu negócio. Além disso, todo mês os melhores anúncios do momento viram parte da coleção Melhores do mês.</p>
            </Reveal>
            <ol className="lp-cards">
              {COLECOES.map((c, i) => <CardColecao key={c.slug} c={c} index={i} />)}
            </ol>
          </div>

          {/* 2. Filtro por tipo de negócio */}
          <div className="lp-dentro__bloco lp-dentro__bloco--filtro">
            <Reveal className="lp-dentro__texto">
              <span className="lp-dentro__num">02</span>
              <h3>Dentro de cada coleção, você filtra pelo <strong>seu tipo de negócio.</strong></h3>
              <p>Você acessa a coleção, filtra pelo seu tipo de negócio e já cai nos melhores anúncios voltados pro que você vende. Sem precisar ficar garimpando na sua pasta de salvos do Instagram.</p>
            </Reveal>
            <ul className="lp-tipos">
              {TIPOS_NEGOCIO.map((t, i) => (
                <Reveal as="li" key={t.nome} delay={i * 60}>
                  <span className="lp-tipos__icone" aria-hidden="true"><IconeTipo nome={t.icone} /></span>
                  <strong>{t.nome}</strong>
                  <span>{t.texto}</span>
                </Reveal>
              ))}
            </ul>
          </div>

          {/* 3. Análise + ferramenta, com o mockup ou o vídeo */}
          <div className="lp-dentro__bloco">
            <Reveal className="lp-dentro__texto">
              <span className="lp-dentro__num">03</span>
              <h3>Cada anúncio vem com a análise e com a <strong>nossa ferramenta.</strong></h3>
              <p>A análise explica por que ele vende, em poucas linhas e sem jargão. Do lado, o botão Fazer a minha versão escreve a sua, com a mesma estrutura e na voz do seu negócio.</p>
            </Reveal>
          </div>

        </div>
      </section>

      {/* ── 2b. Dar uma espiadinha (seção própria, marrom) ── */}
      <section className="lp-section lp-espiada" id="espiadinha">
        <div className="lp-container">
          <Reveal className="lp-espiada__head">
            <span className="lp-pill lp-pill--terra">Dar uma espiadinha</span>
            <h2 className="lp-titulo lp-titulo--grande lp-titulo--claro">Separamos três anúncios do acervo <strong>pra você ver como é a análise de cada um.</strong></h2>
          </Reveal>
          <div className="lp-espiada__cards">
            {ESPIADINHA.map((a, i) => (
              <Reveal as="article" key={a.marca} className={`lp-espiada__card lp-espiada__card--resumo ${i % 2 ? 'lp-espiada__card--areia' : 'lp-espiada__card--terra'}`} delay={i * 90}>
                <span className="lp-espiada__marca" aria-hidden="true">{a.marca}</span>
                <div>
                  <span className="lp-espiada__tipo">{a.tipo}</span>
                  <h3>{a.title}</h3>
                  <p className="lp-espiada__resumo">{a.analysis}</p>
                  <button type="button" className="lp-espiada__abrir" onClick={e => abrirAnalise(i, e)}>
                    Abrir o anúncio
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></svg>
                  </button>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal className="lp-center" delay={120}><Cta>Quero o acervo</Cta></Reveal>
        </div>
      </section>

      {/* ── 3. Como funciona, em 3 prints ── */}
      {/* ── 4. O que é + coleções ── */}
      {/* ── 4b. Fazer a minha versão (a ferramenta) ── */}
      <section className="lp-section lp-ia" id="ferramenta">
        <div className="lp-container">
          <Reveal className="lp-ia__head">
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
          <Reveal className="lp-ia__head lp-ia__head--ferramenta">
            <span className="lp-pill">A nossa ferramenta</span>
            <h2 className="lp-titulo lp-titulo--grande">
              Primeiro você entende.<br /><strong>Depois, a ferramenta escreve a sua versão.</strong>
            </h2>
            <p>
              O botão Fazer a minha versão fica <strong>logo abaixo da análise de cada anúncio e de cada página</strong>, já montado com aquela análise e com o seu negócio. Você preenche a sua ficha, toca, e a sua IA abre com a sua versão quase pronta.
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
                            <span className="lp-celular__notch" />
              <PainelIA />
            </div>
            <p className="lp-ia__legenda">O painel de verdade, do jeito que abre dentro de cada anúncio. Pode mexer.</p>
          </Reveal>
        </div>

        <div className="lp-container">
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

      {/* ── 8. Investimento ── */}
      <section className="lp-section lp-invest" id="oferta">
        <Reveal className="lp-container lp-container--narrow lp-invest__inner">
          <span className="lp-pill">Investimento</span>
          <div className="lp-ticket">
          <div className="lp-ticket__topo">
          {OFERTA.precoDe && (
            <p className="lp-invest__de">de <s>{OFERTA.precoDe}</s> por</p>
          )}
          <div className="lp-carimbo">
            <Selo id="selo-preco" texto={`${(OFERTA.precoNota || 'oferta').toLowerCase()} ✦ pagamento único ✦ `} className="lp-selo--preco" />
            <p className="lp-invest__preco">{OFERTA.preco}</p>
          </div>
          <p className="lp-invest__detalhe">
            {OFERTA.parcelas ? <strong>{OFERTA.parcelas}</strong> : `${OFERTA.acessoPor} de acesso, pagamento único`}
          </p>
          {OFERTA.reforco && <p className="lp-invest__reforco">{OFERTA.reforco}</p>}
          </div>
          <div className="lp-ticket__corte" aria-hidden="true" />
          <div className="lp-ticket__base">
          <span className="lp-ticket__rotulo">O que você recebe</span>
          <ul className="lp-incluso" aria-label="O que está incluído">
            {INCLUSO.map((item, i) => (
              <li key={i}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <Cta variante="teal" largo>Quero o acervo</Cta>
          <ul className="lp-selos" aria-label="Garantias">
            <li>Acesso imediato</li>
            <li>Pix ou cartão</li>
            <li>Pagamento seguro</li>
          </ul>
          </div>
          </div>
        </Reveal>
      </section>

      {/* ── 2. Pra quem é ── */}
      <section className="lp-section lp-praquem">
        <i className="lp-ondas lp-ondas--praquem" aria-hidden="true" />
        <div className="lp-container">
          <Reveal className="lp-head">
            <span className="lp-pill lp-pill--terra">Pra quem é</span>
            <h2 className="lp-titulo lp-titulo--grande">O acervo é pra você que<strong>…</strong></h2>
          </Reveal>
          <ul className="lp-checks">
            {PRA_QUEM.map((item, i) => (
              <Reveal as="li" key={i} className={`lp-adesivo lp-adesivo--${i % 3}`} delay={i * 50}>
                <span className="lp-adesivo__num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>
                <span>{item}</span>
              </Reveal>
            ))}
          </ul>
          <Reveal delay={120}><Cta largo>Quero o acervo</Cta></Reveal>
        </div>
      </section>

      {/* ── 10. Fechamento: cenário A x cenário B ── */}
      <section className="lp-section lp-cenarios">
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
          <Reveal delay={120}><Cta largo>Quero anúncios que vendem</Cta></Reveal>
        </div>
      </section>

      {/* ── Garantia ── */}
      <section className="lp-section lp-garantia-sec">
        <div className="lp-container lp-container--narrow">
          <Reveal className="lp-garantia">
            <span className="lp-garantia__selo" aria-hidden="true">
              <strong>{OFERTA.garantiaDias}</strong>
              <small>dias</small>
            </span>
            <div className="lp-garantia__texto">
              <h2>Garantia de <em>{OFERTA.garantiaDias} dias.</em></h2>
              <p>Se o acervo não fizer sentido pra você, é só pedir o reembolso dentro de {OFERTA.garantiaDias} dias. Você recebe 100% do seu investimento de volta.</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Quem faz o acervo ── */}
      <section className="lp-section lp-quem" id="quem">
        <i className="lp-ondas lp-ondas--quem" aria-hidden="true" />
        <div className="lp-container lp-quem__grid">
          <Reveal className="lp-quem__colagem" aria-hidden="true">
            {QUEM_FOTOS.map((f, i) => (
              <figure key={f.src} className={`lp-quem__foto lp-quem__foto--${i + 1}`}>
                <img src={f.src} alt={f.alt} loading="lazy" onError={e => { e.currentTarget.parentElement.classList.add('is-vazia') }} />
                <figcaption>{f.alt}</figcaption>
              </figure>
            ))}
          </Reveal>
          <Reveal className="lp-quem__texto" delay={100}>
            <span className="lp-pill">Quem faz o acervo</span>
            <h2 className="lp-titulo lp-titulo--grande lp-quem__nomes">Flora Tavares <em>&amp;</em> Ingrid Andrade</h2>
            <p className="lp-quem__lead">
              Amigas da vida, parceiras de projetos, <strong>estrategistas digitais, gestoras de tráfego, crias dos bastidores</strong> e geminianas.
            </p>
            <p>
              Cada uma tem a sua agência, e procurar os melhores anúncios faz parte da nossa rotina. Estamos há anos de olho em anúncios, páginas e estratégias, e foi essa experiência que nos ensinou a entender <strong>por que alguns anúncios vendem e outros não.</strong>
            </p>
            <p>
              Nós nos conhecemos em 2024, dentro do Subido Pro, e logo descobrimos que <strong>quase fomos separadas na maternidade</strong>: uma nasceu no dia 28 e a outra no dia 29 de maio de 1995. Desde então, a amizade só cresceu, e o sonho de criar algo juntas também. Desse sonho nasceu o acervo.
            </p>
            <p>
              O acervo é a nossa curadoria de anúncios, um projeto vivo, feito pra você ter <strong>referências novas toda semana</strong>, selecionadas por quem entende do assunto. A gente acredita em entregar pronto, mas também em desenvolver a sua leitura, por isso analisamos cada anúncio, pra você aprender junto com a gente. E como no digital o tempo é rei, criamos uma ferramenta exclusiva que transforma as suas referências favoritas em anúncios feitos pro seu negócio.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── 9. FAQ ── */}
      <section className="lp-section lp-faq">
        <div className="lp-container lp-container--narrow">
          <Reveal className="lp-faq__head">
            <span className="lp-pill lp-pill--terra">Dúvidas</span>
            <h2 className="lp-titulo lp-titulo--grande lp-titulo--claro">O que mais perguntam antes de entrar</h2>
          </Reveal>
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
      <footer className="lp-fim">
        <div className="lp-container lp-container--narrow lp-fim__inner">
          <Logo className="lp-logo--rodape" />
          <div className="lp-rodape">
            <span>© {new Date().getFullYear()} AVVA Hub</span>
            <Link to="/login">Já sou aluna</Link>
          </div>
        </div>
      </footer>
      </div>
      </div>

      {/* ── Pop-up: prévia do anúncio aberto, como na área de membros ── */}
      {analiseAberta !== null && (() => {
        const a = ESPIADINHA[analiseAberta]
        const paragrafos = a.analysis.split(/\n+/).map(t => t.trim()).filter(Boolean)
        const fav = !!espiadaFav[a.id]
        const vista = !!espiadaVista[a.id]
        const ir = passo => setAnaliseAberta((analiseAberta + passo + ESPIADINHA.length) % ESPIADINHA.length)
        return createPortal(
          <div className="ad-modal lp-admodal" role="dialog" aria-modal="true" aria-label={a.title} onPointerDown={e => { if (e.target === e.currentTarget) fecharAnalise() }}>
            <div key={a.id} className="ad-modal__panel">
              <button ref={fecharRef} type="button" className="ad-modal__close" onClick={() => fecharAnalise()} aria-label="Fechar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
              <div className="ad-modal__media" data-media={a.media_type} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
                <div className="ad-modal__phone">
                  <DriveEmbed key={a.id} url={a.drive_url} title={a.title} mediaType={a.media_type} />
                </div>
                <button type="button" className="ad-modal__arrow ad-modal__arrow--prev" onClick={() => ir(-1)} aria-label="Anterior">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                <button type="button" className="ad-modal__arrow ad-modal__arrow--next" onClick={() => ir(1)} aria-label="Próximo">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>
              <div className="ad-modal__content">
                <div className="ad-modal__handle" aria-hidden="true" />
                <div className="ad-modal__topline">
                  <span className="ad-modal__eyebrow">{a.colecao}</span>
                  <span className="ad-modal__position">{analiseAberta + 1} de {ESPIADINHA.length}</span>
                </div>
                <h2 className="ad-modal__title">{a.title}</h2>
                <div className="ad-modal__tags">
                  {itemTypeLabel(a) && <Tag type="teal">{itemTypeLabel(a)}</Tag>}
                  {a.niches.map(n => <Tag key={n}>{NICHE_LABELS[n] || n}</Tag>)}
                </div>
                <section className="ad-modal__analysis">
                  <h3>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2z"/></svg>
                    Por que funciona
                  </h3>
                  {paragrafos.map((t, i) => <p key={i}>{t}</p>)}
                  <CopyButton text={a.analysis} label="Copiar análise" />
                </section>
                <div className="lp-previa__adapt">
                  <AdaptPanel ad={a} collectionTitle={a.colecao} collectionSlug="melhores-do-mes" previa />
                </div>
                <p className="lp-previa__adapt-nota">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
                  Aqui é só uma prévia. Dentro do acervo, você preenche a ficha e esse painel monta o prompt com a análise e abre na sua IA.
                </p>
                <div className="ad-modal__actions">
                  <button type="button" className={`ad-modal__pill ${vista ? 'ad-modal__pill--on' : ''}`} onClick={() => setEspiadaVista(v => ({ ...v, [a.id]: !v[a.id] }))}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                    {vista ? 'Concluído' : 'Marcar como concluído'}
                  </button>
                  <button type="button" className={`ad-modal__pill ad-modal__pill--fav ${fav ? 'ad-modal__pill--on' : ''}`} onClick={() => setEspiadaFav(v => ({ ...v, [a.id]: !v[a.id] }))}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill={fav ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    {fav ? 'Favorito' : 'Favoritar'}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )
      })()}

      {/* ── Barra fixa (mobile) ── */}
      <div className={`lp-sticky ${stickyVisible ? 'is-visible' : ''}`} aria-hidden={!stickyVisible}>
        <span className="lp-sticky__preco">{OFERTA.preco}</span>
        <Cta>Quero o acervo</Cta>
      </div>
    </div>
  )
}
