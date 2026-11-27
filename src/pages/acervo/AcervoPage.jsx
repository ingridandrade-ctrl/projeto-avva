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
  { n: '2', titulo: 'Você filtra pelo seu nicho', texto: 'Dentro da coleção, você marca o seu tipo de negócio e vê só o que serve pro seu caso.', src: '', alt: '' },
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
  { n: '1', titulo: 'Você preenche a sua ficha uma vez.', texto: 'O que você vende, pra quem e uma prova real. Fica salvo no seu celular.' },
  { n: '2', titulo: 'Você escolhe como escreve.', texto: 'Direta, leve, acolhedora, elegante. Se colar um texto seu, ela imita o seu jeito.' },
  { n: '3', titulo: 'Você diz pra onde o anúncio leva.', texto: 'WhatsApp, site, página de vendas ou direct.' },
  { n: '4', titulo: 'Você abre no ChatGPT ou no Claude.', texto: 'Um toque e a sua versão aparece: a mesma estrutura do original, na sua voz, com a sua prova.' },
]

// O que a ferramenta garante (vem das regras que o prompt carrega)
const FERRAMENTA_REGRAS = [
  { titulo: 'Não copia o original', texto: 'Repete a estrutura, nunca as frases.' },
  { titulo: 'Não inventa número', texto: 'Prova e preço só entram se você deu.' },
  { titulo: 'Pergunta antes de chutar', texto: 'Se faltar algo, ela pergunta primeiro.' },
  { titulo: 'Sem cara de IA', texto: 'Sem frase de efeito, jargão ou emoji.' },
  { titulo: 'Funciona na versão gratuita', texto: 'ChatGPT ou Claude, sem plano pago.' },
  { titulo: 'Vídeo, imagem, carrossel e página', texto: 'Cada formato com a sua entrega.' },
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
    title: 'Especialista em posicionamento: mitos do Instagram para aula gravada',
    tipo: 'Vídeo · Infoproduto',
    colecao: 'Melhores de Setembro 2026',
    media_type: 'video',
    niches: ['infoproduto'],
    objectives: ['vender'],
    drive_url: 'https://drive.google.com/file/d/18USYqZIvfmPj5PC11trkP1sG-EqRc_yL/view',
    analysis: `A especialista em comunicação e posicionamento derruba uma por uma as saídas que todo mundo tenta para crescer no Instagram, postar todo dia, fazer carrossel, impulsionar e contratar social media, com o nome de cada uma escrito grande na tela, antes de convidar para uma aula gravada.

Cada uma cai com uma imagem fácil de lembrar. Postar todo dia sem um formato que funcione é repetir o mesmo erro 30 vezes no mês, e impulsionar conteúdo que não foi validado é jogar gasolina numa casa que já está pegando fogo. Para quem já tentou tudo isso e não cresceu, o que fica aos poucos é a sensação de que o problema nunca foi falta de esforço, e isso deixa a pessoa aberta para o que vem depois.

O que vem é um nome, cotas de alcance, uma entrega extra que, segundo ela, o Instagram reserva para perfis pequenos e que ninguém conta que existe. Esse nome soa como uma regra escondida, então explica por que o perfil travou e ainda desperta curiosidade. A aula promete mostrar um vídeo indo de zero a 500 mil views, montado com uma amiga, e como adaptar o formato mesmo para nicho pequeno. Para dar peso, ela conta que empresas pagam caro pelas palestras fechadas dela, e pede em troca só que a pessoa aplique e mande o print.

Pra aplicar: liste as soluções que a sua cliente já tentou e explique com uma imagem simples por que cada uma não funciona. Tire a culpa dela, dê um nome ao caminho que você ensina e convide para a aula ou para onde você for enviar ela.`,
  },
  {
    id: 'espiada-2',
    marca: '02',
    title: 'Letícia Vaz Store: desafio de 100 calças para vender a calça jeans',
    tipo: 'Vídeo · E-commerce',
    colecao: 'Melhores de Julho 2026',
    media_type: 'video',
    niches: ['ecommerce'],
    objectives: ['vender'],
    drive_url: 'https://drive.google.com/file/d/1BSsRMSv2EyuAF_2vtr7vArw_2-8vtY_Z/view',
    analysis: `Nesse vídeo, a Letícia Vaz transforma a venda de uma calça jeans num desafio: ela diz que precisa vender 100 calças naquele dia e, enquanto vende, mostra cinco formas diferentes de divulgar a peça.

O desafio prende porque cria uma história com final aberto, e quem assiste quer saber se ela vai conseguir. As cinco formas fazem o vídeo servir para dois públicos ao mesmo tempo: a cliente que quer a calça e quem também vende e quer aprender a divulgar.

O mais interessante é que cada forma de divulgar também funciona como argumento de venda. Quando ela usa a calça numa reunião, num show e em casa, a cliente imagina a peça na própria rotina. Quando responde quem tem cintura fina e quadril largo, quem é muito alta e quem é baixinha, mostrando que a barra dá para cortar na tesoura, ela tira a dúvida de cada tipo de corpo. O bastidor mostra quantas vezes a calça foi pedida e os detalhes de acabamento, e os prints de clientes elogiando deixam outras mulheres convencerem por ela.

O próprio desafio é a quinta forma e amarra as outras, porque quem acompanhou acaba torcendo pela meta. No fim, ela mostra mais uma calça e pede para comentar calça para receber o link, um pedido pequeno que coloca a pessoa dentro do desafio.

Pra aplicar: crie uma meta pública de vendas e conte para a sua cliente, para ela acompanhar e torcer. Mostre o produto na rotina, responda as dúvidas de cada tipo de cliente, mostre o bastidor e deixe as clientes falarem por você. Feche com um pedido simples, ligado à meta que você anunciou.`,
  },
  {
    id: 'espiada-3',
    marca: '03',
    title: 'Pedro Sobral: caixinha de pergunta respondida com número',
    tipo: 'Imagem estática · Infoproduto',
    colecao: 'Melhores de Agosto 2026',
    media_type: 'image',
    niches: ['infoproduto'],
    objectives: ['vender'],
    drive_url: 'https://drive.google.com/file/d/1_N96o46TeKGDO9npxoUsK80aG1UlHsbJ/view',
    analysis: `O Pedro Sobral usa uma caixinha de pergunta para responder a dúvida de quem está quase entrando no Protocolo 30k e ainda hesita: como eu sei que o Protocolo 30k vai funcionar pra mim.

Como a pergunta parece ter vindo de um seguidor, o tom muda. A pessoa que tem a mesma dúvida lê a resposta como uma conversa entre o Pedro e alguém igual a ela, bem longe de um argumento de venda.

A resposta vem com um número exato, 4.855 gestores de tráfego atuantes que validaram o protocolo. Um número quebrado assim parece contado um por um, e o atuantes diz que são pessoas que trabalham com isso de verdade, como quem perguntou. Depois ele diz que é altamente improvável que pro SEU caso não funcione, com o seu em letra maiúscula, como quem olha nos olhos da pessoa. A foto dele de perto, olhando de lado com um meio sorriso, completa com a segurança de quem não se preocupa com essa dúvida.

Pra aplicar: pegue a pergunta que mais aparece antes da compra, aquela de será que funciona para mim, e responda com o número mais concreto que você tiver sobre quem já usou o seu método. Mostre que essas pessoas estão no mesmo lugar que a sua cliente.`,
  },
]

// Checklist do que está incluído, dentro da oferta
const INCLUSO = [
  <><strong>Acervo vivo</strong>: anúncios novos toda semana, garimpados e analisados pela gente</>,
  <><strong>Análise em cada anúncio</strong>: por que funciona e o que importa nele</>,
  <><strong>Fazer a minha versão</strong>, a nossa ferramenta, ao lado de todo anúncio e página</>,
  <><strong>{OFERTA.totalColecoes} coleções por objetivo</strong>, do topo ao fundo do funil, com filtro por tipo de negócio</>,
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
      'Você lê a análise, entende por que ele vende, e a ferramenta escreve a sua versão. Em poucos minutos o anúncio está pronto pra gravar',
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
    q: 'De onde vêm os anúncios?',
    a: 'A gente garimpa o mercado toda semana: anúncios que estão rodando e vendendo, de negócios de todo tipo. Cada um entra no acervo com a análise de por que funciona.',
  },
  {
    q: 'Tenho serviço e infoproduto. Filtro por qual?',
    a: 'Você filtra um de cada vez, e vale olhar os dois: muitos anúncios estão marcados nos dois tipos, porque a estrutura que fecha agenda é parecida com a que vende um curso.',
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
  const [aberta, setAberta] = useState(-1)
  const [analiseAberta, setAnaliseAberta] = useState(null) // índice da análise no pop-up
  const fecharRef = useRef(null)
  const origemRef = useRef(null)

  function abrirAnalise(i, e) {
    origemRef.current = e?.currentTarget || null
    setAnaliseAberta(i)
  }

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
            A biblioteca de anúncios <br className="lp-br-d" />das empreendedoras <br />que <em>cansaram de começar do&nbsp;zero.</em>
          </h1>
          <p className="lp-hero__destaque">
            No acervo você entende a lógica dos anúncios que vendem e transforma as suas referências favoritas em anúncios pro seu negócio, com uma ferramenta que escreve a sua versão <strong>em&nbsp;poucos&nbsp;cliques.</strong>
          </p>
          <Cta>Quero o acervo</Cta>
          <p className="lp-hero__nota">Tudo pelo celular, com acesso imediato <br className="lp-br-m" />· Pagamento único · {OFERTA.garantiaDias} dias de garantia</p>
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
            <p>O acervo é uma plataforma com os melhores anúncios do mercado, organizados por objetivo e com filtro por tipo de negócio. Pra você que já anuncia ou quer começar a&nbsp;anunciar.</p>
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
              <p>De atrair seguidores a vender agora, em vídeo, imagem e carrossel. Você escolhe o seu objetivo e acessa uma curadoria feita pro seu negócio. Além disso, todo mês os melhores anúncios do momento viram parte da coleção Melhores&nbsp;do&nbsp;mês.</p>
            </Reveal>
            <ol className="lp-cards">
              {COLECOES.map((c, i) => <CardColecao key={c.slug} c={c} index={i} />)}
            </ol>
          </div>

          {/* 2. Filtro por tipo de negócio */}
          <div className="lp-dentro__bloco lp-dentro__bloco--filtro">
            <Reveal className="lp-dentro__texto">
              <span className="lp-dentro__num">02</span>
              <h3>Dentro de cada coleção, <br className="lp-br-d" />você filtra pelo <strong>seu tipo de&nbsp;negócio.</strong></h3>
              <p>Você acessa a coleção, filtra pelo seu tipo de negócio e já cai nos melhores anúncios voltados pro que você vende. Sem precisar ficar garimpando na sua pasta de salvos do&nbsp;Instagram.</p>
            </Reveal>
            <Reveal className="lp-filtro" delay={80} aria-hidden="true">
              <span className="lp-filtro__rotulo">Filtrar por</span>
              <div className="lp-filtro__chips">
                <span>Todos</span><span>Infoproduto</span><span className="is-on">E-commerce ✓</span><span>Negócio local</span><span>Serviço</span>
              </div>
              <p className="lp-filtro__resultado">Mostrando só o que serve pro seu caso</p>
            </Reveal>
          </div>

          {/* 3. A ferramenta, embaixo de cada anúncio */}
          <div className="lp-dentro__bloco lp-dentro__bloco--filtro">
            <Reveal className="lp-dentro__texto">
              <span className="lp-dentro__num">03</span>
              <h3>Em cada anúncio, a nossa ferramenta <br className="lp-br-d" /><strong>prepara o&nbsp;prompt pra&nbsp;você.</strong></h3>
              <p>Embaixo de cada análise tem o botão Fazer a minha versão. Você preenche a sua ficha uma vez e a ferramenta junta a análise daquele anúncio com o seu negócio num prompt pronto pra abrir no ChatGPT ou no&nbsp;Claude.</p>
            </Reveal>
            <Reveal className="lp-filtro lp-filtro--ferramenta" delay={80} aria-hidden="true">
              <span className="lp-filtro__rotulo">Embaixo da análise</span>
              <span className="lp-filtro__botao">✦ Fazer a minha versão <small>com IA</small></span>
              <ul className="lp-filtro__passos">
                <li>A análise desse anúncio</li>
                <li>A sua ficha, preenchida uma vez</li>
                <li>Prompt pronto pra copiar</li>
              </ul>
            </Reveal>
          </div>

          {/* 4. Plataforma viva, no celular */}
          <div className="lp-dentro__bloco lp-dentro__bloco--filtro">
            <Reveal className="lp-dentro__texto">
              <span className="lp-dentro__num">04</span>
              <h3>Uma plataforma viva, <br className="lp-br-d" /><strong>aberta no seu&nbsp;celular.</strong></h3>
              <p>Toda semana entram anúncios novos, garimpados e analisados pela gente. Você abre o acervo no celular, a qualquer hora, com favoritos, busca e a marcação do que você já&nbsp;viu.</p>
            </Reveal>
            <Reveal className="lp-filtro lp-filtro--novos" delay={80} aria-hidden="true">
              <span className="lp-filtro__rotulo">Novos no acervo · esta semana</span>
              <ul className="lp-filtro__lista">
                <li><i /><span>Mitos do Instagram para aula gravada</span><em>Novo</em></li>
                <li><i /><span>Desafio de 100 calças para vender jeans</span><em>Novo</em></li>
                <li><i /><span>Caixinha de pergunta respondida com número</span><em>Novo</em></li>
              </ul>
              <p className="lp-filtro__resultado">Anúncios novos toda semana, analisados um por um</p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── 3. Como funciona, em 3 prints ── */}
      {/* ── 4. O que é + coleções ── */}
      {/* ── 4b. Fazer a minha versão (a ferramenta) ── */}
      <section className="lp-section lp-ia" id="ferramenta">
        <div className="lp-container">
          <Reveal className="lp-ia__head">
            <span className="lp-pill">Como funciona</span>
            <h2 className="lp-titulo lp-titulo--grande">Três passos e o seu anúncio <strong>sai pronto pra gravar.</strong></h2>
          </Reveal>
          <ol className="lp-passos__lista">
            {PASSOS_PRINTS.map((p, i) => (
              <Reveal as="li" key={p.n} className="lp-passo" delay={i * 90}>
                <div className="lp-passo__print">
                  {p.src ? (
                    <img src={p.src} alt={p.alt} loading="lazy" />
                  ) : (
                    <span className="lp-passo__vazio" />
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
              Primeiro você entende. <strong>Depois, a&nbsp;ferramenta <br className="lp-br-m" />escreve a&nbsp;sua&nbsp;versão.</strong>
            </h2>
            <p>
              O botão Fazer a minha versão fica <strong>logo abaixo da análise</strong> de cada anúncio. Você preenche a sua ficha uma vez e a sua IA abre com a sua versão quase&nbsp;pronta.
            </p>
          </Reveal>
          <Reveal className="lp-formula" delay={60} aria-hidden="true">
            <span className="lp-formula__item"><b>A análise</b>do anúncio que você escolheu</span>
            <i>+</i>
            <span className="lp-formula__item"><b>A sua ficha</b>o seu negócio, na sua voz</span>
            <i>=</i>
            <span className="lp-formula__item lp-formula__item--fim"><b>A sua versão</b>pronta pra gravar</span>
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
              <div className="lp-celular__tela">
                <span className="lp-celular__notch" />
                <PainelIA />
              </div>
            </div>
            <p className="lp-ia__legenda">O painel de verdade, do jeito que abre dentro de cada anúncio. Pode mexer.</p>
          </Reveal>
        </div>

        <div className="lp-container">
          <Reveal className="lp-combinado" delay={60}>
            <div className="lp-combinado__head">
              <span className="lp-pill lp-pill--terra">O combinado</span>
              <h3>O combinado <em>com a ferramenta.</em></h3>
            </div>
            <ul className="lp-combinado__lista">
              {FERRAMENTA_REGRAS.map((r) => (
                <li key={r.titulo}>
                  <strong>{r.titulo}</strong>
                  <span>{r.texto}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal className="lp-center" delay={100}>
            <Cta>Quero a ferramenta junto com o acervo</Cta>
          </Reveal>
        </div>
      </section>

      {/* ── 5. Dar uma espiadinha + bônus (marrom) ── */}
      <section className="lp-section lp-espiada" id="espiadinha">
        <div className="lp-container">
          <Reveal className="lp-espiada__head">
            <span className="lp-pill lp-pill--terra">Dar uma espiadinha</span>
            <h2 className="lp-titulo lp-titulo--grande lp-titulo--claro">Separamos três anúncios <br className="lp-br-m" />do&nbsp;acervo <strong>pra você ver como&nbsp;funciona.</strong></h2>
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
          <Reveal className="lp-espiada__bonus-head" delay={60}>
            <span className="lp-pill lp-pill--terra">Bônus</span>
            <h2 className="lp-titulo lp-titulo--grande lp-titulo--claro">E você ainda leva <br className="lp-br-m" /><strong>de bônus:</strong></h2>
          </Reveal>
          <ul className="lp-bonus__grid">
            {BONUS.map((b, i) => <CardBonus key={b.titulo} b={b} index={i} />)}
          </ul>
          <Reveal className="lp-center" delay={120}><Cta>Quero o acervo</Cta></Reveal>
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
          <Reveal className="lp-head">
            <span className="lp-pill">Investimento</span>
            <h2 className="lp-titulo lp-titulo--grande">Quanto custa <strong>entrar no acervo?</strong></h2>
          </Reveal>
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
              <h3>Garantia de <em>{OFERTA.garantiaDias} dias.</em></h3>
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
              Amigas da vida, parceiras de projetos, <strong>estrategistas digitais, gestoras de tráfego, crias dos bastidores</strong> e&nbsp;geminianas.
            </p>
            <p>
              Cada uma tem a sua agência, e procurar os melhores anúncios faz parte da nossa rotina. Estamos há anos de olho em anúncios, páginas e estratégias, e foi essa experiência que nos ensinou a entender <strong>por que alguns anúncios vendem e outros não.</strong>
            </p>
            <p>
              Nós nos conhecemos em 2024, dentro do Subido Pro, e logo descobrimos que <strong>quase fomos separadas na maternidade</strong>: uma nasceu no dia 28 e a outra no dia 29 de maio de 1995. Desde então, a amizade só cresceu, e o sonho de criar algo juntas também. Desse sonho nasceu o acervo.
            </p>
            <p>
              O acervo é a nossa curadoria de anúncios, um projeto vivo, feito pra você ter <strong>referências novas toda semana</strong>, garimpadas e selecionadas por quem entende do assunto. A gente acredita em entregar pronto, mas também em desenvolver a sua leitura, por isso analisamos cada anúncio, pra você aprender junto com a gente. E como no digital o tempo é rei, criamos uma ferramenta exclusiva que transforma as suas referências favoritas em anúncios feitos pro seu negócio.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── 9. FAQ ── */}
      <section className="lp-section lp-faq">
        <div className="lp-container lp-container--narrow">
          <Reveal className="lp-faq__head">
            <span className="lp-pill lp-pill--terra">Dúvidas</span>
            <h2 className="lp-titulo lp-titulo--grande lp-titulo--claro">Perguntas <strong>frequentes</strong></h2>
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
              </div>
            </div>
          </div>,
          document.body
        )
      })()}

    </div>
  )
}
