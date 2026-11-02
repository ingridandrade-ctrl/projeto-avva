// Estrutura fixa do Acervo de Anúncios.
// Coleções = navegação por objetivo do anúncio (nunca chamar de "módulos").

export const COLLECTIONS = [
  {
    slug: 'ser-descoberta',
    title: 'Atrair seguidores',
    subtitle: 'Atrair seguidores e chamar a atenção de quem não te conhece',
    order: 1,
    gradient: 'linear-gradient(135deg, #1A6868 0%, #3F7A66 100%)',
  },
  {
    slug: 'captar-leads',
    title: 'Captar leads',
    subtitle: 'Gerar cadastros para seu evento, lançamento, produto, serviço',
    order: 2,
    gradient: 'linear-gradient(135deg, #0C4747 0%, #7FA588 100%)',
  },
  {
    slug: 'mostrar-que-voce-entende',
    title: 'Mostrar que você entende',
    subtitle: 'Gerar autoridade e construir confiança',
    order: 3,
    gradient: 'linear-gradient(135deg, #2C6B5A 0%, #7FA588 100%)',
  },
  {
    slug: 'provar-que-funciona',
    title: 'Provar que funciona',
    subtitle: 'Prova social e resultados reais',
    order: 4,
    gradient: 'linear-gradient(135deg, #1A6868 0%, #B97A4E 100%)',
  },
  {
    slug: 'quebrar-o-mas',
    title: 'Quebrar o "mas..."',
    subtitle: 'Quebra de objeção e dos motivos pra adiar',
    order: 5,
    gradient: 'linear-gradient(135deg, #8A5C3F 0%, #C98A5E 100%)',
  },
  {
    slug: 'vender-agora',
    title: 'Vender agora',
    subtitle: 'Oferta direta e remarketing',
    order: 6,
    gradient: 'linear-gradient(135deg, #965E41 0%, #C98A5E 60%, #D4B99A 100%)',
  },
  // Bônus aposentado na área de membros (segue só na página de vendas, que
  // lê esta lista direto). Pra voltar, tira o "retired".
  {
    slug: 'datas-especiais',
    title: 'Datas especiais',
    subtitle: 'Black Friday, Dia das Mães, aniversário...',
    order: 7,
    isBonus: true,
    retired: true,
    gradient: 'linear-gradient(135deg, #C98A5E 0%, #D4B99A 55%, #7FA588 100%)',
  },
]

// Coleções fixas que valem na área de membros (sem as aposentadas)
export const FIXED_COLLECTIONS = COLLECTIONS.filter(c => !c.retired)

// Coleções por objetivo = tags que um anúncio pode ter (várias por anúncio).
export const OBJECTIVES = FIXED_COLLECTIONS
  .filter(c => !c.isBonus)
  .map(c => ({ value: c.slug, label: c.title, hint: c.subtitle }))

export const OBJECTIVE_LABELS = Object.fromEntries(OBJECTIVES.map(o => [o.value, o.label]))

// Coleções por objetivo que existem no banco (as 5 fixas + as criadas pelo
// admin). Sem a coluna "kind" (migração não rodada), vale a lista fixa.
export function objectivesFrom(collections = []) {
  const doBanco = collections.filter(c => c.kind === 'objetivo')
  if (!doBanco.length) return OBJECTIVES
  return doBanco.map(c => ({ value: c.slug, label: c.title, hint: c.subtitle || '' }))
}

export function objectiveLabelsFrom(collections = []) {
  return Object.fromEntries(objectivesFrom(collections).map(o => [o.value, o.label]))
}

export const isObjectiveCollection = (col) => Boolean(col) && (col.kind === 'objetivo' || (!col.kind && OBJECTIVES.some(o => o.value === col.slug)))

// Um anúncio pertence a uma coleção por objetivo pela tag; às coleções
// extras (melhores do mês, especiais) pela coleção "de origem".
export function belongsTo(ad, col) {
  if (!ad || !col) return false
  if (ad.collection_id === col.id) return true
  return isObjectiveCollection(col) && (ad.objectives || []).includes(col.slug)
}

export function getCollection(slug) {
  return FIXED_COLLECTIONS.find(c => c.slug === slug)
}

// As coleções vêm do banco; o catálogo acima só dá o visual das fixas.
// Para coleções criadas depois (ex.: "melhores-de-novembro-2026"), o estilo
// é escolhido pelo prefixo do slug.
const MELHORES_GRADIENTS = [
  'linear-gradient(135deg, #3F7A66 0%, #8A5C3F 55%, #D4B99A 100%)',
  'linear-gradient(135deg, #1A6868 0%, #7FA588 60%, #D4B99A 100%)',
  'linear-gradient(135deg, #8A5C3F 0%, #C98A5E 60%, #7FA588 100%)',
  'linear-gradient(135deg, #2C6B5A 0%, #965E41 60%, #D4B99A 100%)',
  'linear-gradient(135deg, #B97A4E 0%, #D4B99A 50%, #3F7A66 100%)',
]

const OBJETIVO_GRADIENTS = [
  'linear-gradient(135deg, #1A6868 0%, #3F7A66 100%)',
  'linear-gradient(135deg, #2C6B5A 0%, #7FA588 100%)',
  'linear-gradient(135deg, #1A6868 0%, #B97A4E 100%)',
  'linear-gradient(135deg, #8A5C3F 0%, #C98A5E 100%)',
  'linear-gradient(135deg, #965E41 0%, #C98A5E 60%, #D4B99A 100%)',
  'linear-gradient(135deg, #0C4747 0%, #7FA588 100%)',
]

const hashOf = (s = '') => { let h = 0; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) % 997; return h }

// Aceita o slug (texto) ou a coleção inteira. Com a coleção, o tipo vem da
// coluna "kind" do banco; sem ela, do slug (coleções antigas).
export function getCollectionStyle(colOrSlug = '') {
  const col = typeof colOrSlug === 'object' && colOrSlug ? colOrSlug : null
  const slug = col ? (col.slug || '') : (colOrSlug || '')
  const fixed = getCollection(slug)
  if (col?.kind) {
    if (col.kind === 'objetivo') return { gradient: fixed?.gradient || OBJETIVO_GRADIENTS[hashOf(slug) % OBJETIVO_GRADIENTS.length], kind: 'fixa' }
    if (col.kind === 'mes') return { gradient: MELHORES_GRADIENTS[hashOf(slug) % MELHORES_GRADIENTS.length], kind: 'melhores' }
    if (col.kind === 'paginas') return { gradient: 'linear-gradient(135deg, #2E211B 0%, #0C4747 55%, #3F7A66 100%)', kind: 'paginas' }
    return { gradient: fixed?.gradient || 'linear-gradient(135deg, #2E211B 0%, #4C362D 45%, #965E41 100%)', kind: 'especial' }
  }
  if (fixed) return { gradient: fixed.gradient, kind: 'fixa' }
  if (slug === PAGES_SLUG) {
    return { gradient: 'linear-gradient(135deg, #2E211B 0%, #0C4747 55%, #3F7A66 100%)', kind: 'paginas' }
  }
  if (slug.startsWith('especial-')) {
    return { gradient: 'linear-gradient(135deg, #2E211B 0%, #4C362D 45%, #965E41 100%)', kind: 'especial' }
  }
  if (slug.startsWith('melhores-')) {
    return { gradient: MELHORES_GRADIENTS[hashOf(slug) % MELHORES_GRADIENTS.length], kind: 'melhores' }
  }
  return { gradient: 'linear-gradient(135deg, #1A6868 0%, #3F7A66 100%)', kind: 'outra' }
}

// Tags de nicho — fixas, só estas 4 (multi-select)
export const NICHES = [
  { value: 'negocio-local', label: 'Negócio local' },
  { value: 'servico', label: 'Prestação de serviço' },
  { value: 'infoproduto', label: 'Infoproduto' },
  { value: 'ecommerce', label: 'E-commerce' },
]

export const NICHE_LABELS = Object.fromEntries(NICHES.map(n => [n.value, n.label]))

// ── Páginas ──
// Segundo tipo de item do Acervo (ads.kind = 'pagina'). Não usam os objetivos
// dos anúncios: têm o próprio tipo e moram numa coleção só, "paginas".
export const PAGES_SLUG = 'paginas'

export const PAGE_TYPES = [
  { value: 'vendas', label: 'Página de vendas', hint: 'Apresenta a oferta e fecha a venda (inclui upsell)' },
  { value: 'captura', label: 'Página de captura', hint: 'Troca um material ou acesso pelo contato' },
  { value: 'obrigado', label: 'Página de obrigado', hint: 'Depois da compra ou do cadastro: confirma e dá o próximo passo' },
  { value: 'servico', label: 'Página de serviço', hint: 'Apresenta o serviço e leva pro contato ou agendamento' },
]

export const PAGE_TYPE_LABELS = Object.fromEntries(PAGE_TYPES.map(t => [t.value, t.label]))

// Nichos que valem pra página (sem e-commerce)
export const PAGE_NICHES = NICHES.filter(n => n.value !== 'ecommerce')

// Formatos em que uma página chega (print longo ou PDF)
export const PAGE_MEDIA_TYPES = [
  { value: 'image', label: 'Print (imagem)' },
  { value: 'pdf', label: 'PDF' },
]

export const isPage = (ad) => ad?.kind === 'pagina'

// Rótulo curto do item: tipo de página pra páginas, mídia pra anúncios
export function itemTypeLabel(ad) {
  if (!ad) return null
  if (isPage(ad)) return PAGE_TYPE_LABELS[ad.page_type] || 'Página'
  return ad.media_type ? (MEDIA_LABELS[ad.media_type] || ad.media_type) : null
}

// Tipos de mídia
export const MEDIA_TYPES = [
  { value: 'video', label: 'Vídeo' },
  { value: 'image', label: 'Imagem estática' },
  { value: 'carousel', label: 'Carrossel' },
  { value: 'pdf', label: 'Página (PDF)' },
]

export const MEDIA_LABELS = Object.fromEntries(MEDIA_TYPES.map(m => [m.value, m.label]))

// Etiqueta da coleção nos cards e cabeçalhos ("Coleção 01", "Melhores do mês"…)
// Passe a lista de coleções pra numerar pela posição (Coleção 01, 02…) e
// não pelo número de ordem bruto do banco.
export function collectionKindLabel(col, collections = null) {
  if (!col) return ''
  if (col.is_bonus) return 'Bônus'
  const kind = getCollectionStyle(col).kind
  if (kind === 'fixa') {
    const objetivos = collections ? collections.filter(c => getCollectionStyle(c).kind === 'fixa').sort((a, b) => a.order - b.order) : null
    const pos = objetivos ? objetivos.findIndex(c => c.id === col.id) + 1 : col.order
    return `Coleção ${String(pos || col.order).padStart(2, '0')}`
  }
  if (kind === 'melhores') return 'Melhores do mês'
  if (kind === 'paginas') return 'Páginas'
  return 'Especial'
}
