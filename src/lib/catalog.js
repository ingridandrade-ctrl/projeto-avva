// Estrutura fixa do Acervo de Anúncios.
// Coleções = navegação por objetivo do anúncio (nunca chamar de "módulos").

export const COLLECTIONS = [
  {
    slug: 'ser-descoberta',
    title: 'Ser descoberta',
    subtitle: 'Atrair seguidores',
    order: 1,
    gradient: 'linear-gradient(135deg, #0C4747 0%, #1A6868 100%)',
  },
  {
    slug: 'mostrar-que-voce-entende',
    title: 'Mostrar que você entende',
    subtitle: 'Gerar autoridade',
    order: 2,
    gradient: 'linear-gradient(135deg, #1A6868 0%, #2C6B5A 100%)',
  },
  {
    slug: 'provar-que-funciona',
    title: 'Provar que funciona',
    subtitle: 'Prova social',
    order: 3,
    gradient: 'linear-gradient(135deg, #0C4747 0%, #A85C35 100%)',
  },
  {
    slug: 'quebrar-o-mas',
    title: 'Quebrar o "mas..."',
    subtitle: 'Quebra de objeção',
    order: 4,
    gradient: 'linear-gradient(135deg, #4C362D 0%, #A85C35 100%)',
  },
  {
    slug: 'vender-agora',
    title: 'Vender agora',
    subtitle: 'Oferta direta e remarketing',
    order: 5,
    gradient: 'linear-gradient(135deg, #A85C35 0%, #c06a3d 60%, #D4B99A 100%)',
  },
  {
    slug: 'datas-especiais',
    title: 'Datas especiais',
    subtitle: 'Black Friday, Dia das Mães, aniversário...',
    order: 6,
    isBonus: true,
    gradient: 'linear-gradient(135deg, #A85C35 0%, #D4B99A 50%, #1A6868 100%)',
  },
]

export function getCollection(slug) {
  return COLLECTIONS.find(c => c.slug === slug)
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
]

export const MEDIA_LABELS = Object.fromEntries(MEDIA_TYPES.map(m => [m.value, m.label]))
