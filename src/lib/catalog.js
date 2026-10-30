// Estrutura fixa do Acervo de Anúncios.
// Coleções = navegação por objetivo do anúncio (nunca chamar de "módulos").

export const COLLECTIONS = [
  {
    slug: 'ser-descoberta',
    title: 'Ser descoberta',
    subtitle: 'Atrair seguidores e chamar a atenção de quem não te conhece',
    order: 1,
    gradient: 'linear-gradient(135deg, #1A6868 0%, #3F7A66 100%)',
  },
  {
    slug: 'mostrar-que-voce-entende',
    title: 'Mostrar que você entende',
    subtitle: 'Gerar autoridade e construir confiança',
    order: 2,
    gradient: 'linear-gradient(135deg, #2C6B5A 0%, #7FA588 100%)',
  },
  {
    slug: 'provar-que-funciona',
    title: 'Provar que funciona',
    subtitle: 'Prova social e resultados reais',
    order: 3,
    gradient: 'linear-gradient(135deg, #1A6868 0%, #B97A4E 100%)',
  },
  {
    slug: 'quebrar-o-mas',
    title: 'Quebrar o "mas..."',
    subtitle: 'Quebra de objeção e dos motivos pra adiar',
    order: 4,
    gradient: 'linear-gradient(135deg, #8A5C3F 0%, #C98A5E 100%)',
  },
  {
    slug: 'vender-agora',
    title: 'Vender agora',
    subtitle: 'Oferta direta e remarketing',
    order: 5,
    gradient: 'linear-gradient(135deg, #965E41 0%, #C98A5E 60%, #D4B99A 100%)',
  },
  // Bônus aposentado na área de membros (segue só na página de vendas, que
  // lê esta lista direto). Pra voltar, tira o "retired".
  {
    slug: 'datas-especiais',
    title: 'Datas especiais',
    subtitle: 'Black Friday, Dia das Mães, aniversário...',
    order: 6,
    isBonus: true,
    retired: true,
    gradient: 'linear-gradient(135deg, #C98A5E 0%, #D4B99A 55%, #7FA588 100%)',
  },
]

// Coleções fixas que valem na área de membros (sem as aposentadas)
export const FIXED_COLLECTIONS = COLLECTIONS.filter(c => !c.retired)

// Coleções por objetivo = tags que um anúncio pode ter (várias por anúncio).
export const OBJECTIVES = FIXED_COLLECTIONS
  .filter(c => c.order <= 6)
  .map(c => ({ value: c.slug, label: c.title, hint: c.subtitle }))

export const OBJECTIVE_LABELS = Object.fromEntries(OBJECTIVES.map(o => [o.value, o.label]))

// Um anúncio pertence a uma coleção por objetivo pela tag; às coleções
// extras (melhores do mês, especiais) pela coleção "de origem".
export function belongsTo(ad, col) {
  if (!ad || !col) return false
  if (ad.collection_id === col.id) return true
  const isObjective = OBJECTIVES.some(o => o.value === col.slug)
  return isObjective && (ad.objectives || []).includes(col.slug)
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

export function getCollectionStyle(slug = '') {
  const fixed = getCollection(slug)
  if (fixed) return { gradient: fixed.gradient, kind: 'fixa' }
  if (slug.startsWith('especial-')) {
    return { gradient: 'linear-gradient(135deg, #2E211B 0%, #4C362D 45%, #965E41 100%)', kind: 'especial' }
  }
  if (slug.startsWith('melhores-')) {
    let h = 0
    for (const ch of slug) h = (h * 31 + ch.charCodeAt(0)) % 997
    return { gradient: MELHORES_GRADIENTS[h % MELHORES_GRADIENTS.length], kind: 'melhores' }
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

// Tipos de mídia
export const MEDIA_TYPES = [
  { value: 'video', label: 'Vídeo' },
  { value: 'image', label: 'Imagem estática' },
  { value: 'carousel', label: 'Carrossel' },
  { value: 'pdf', label: 'Página (PDF)' },
]

export const MEDIA_LABELS = Object.fromEntries(MEDIA_TYPES.map(m => [m.value, m.label]))
