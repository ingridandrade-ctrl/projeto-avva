// Cada produto tem a própria casa no admin: alunas, conteúdo e capas
// ficam lá dentro, não no menu geral.
export const PRODUCTS = {
  acervo: {
    slug: 'acervo',
    title: 'Acervo de Anúncios',
    type: 'Produto principal',
    description: 'Anúncios organizados por objetivo, com a análise do porquê cada um funciona.',
    image: '/produtos/acervo-de-anuncios.png',
    gradient: 'linear-gradient(135deg, #1A6868 0%, #3F7A66 40%, #C98A5E 100%)',
    tabs: [
      { to: 'alunas', label: 'Alunas' },
      { to: 'anuncios', label: 'Anúncios' },
      { to: 'colecoes', label: 'Coleções e capas' },
      { to: 'sugestoes', label: 'Sugestões' },
    ],
  },
  kit: {
    slug: 'kit',
    title: 'Kit de Execução',
    type: 'Order bump',
    description: 'A estrutura e o super prompt de cada tipo de anúncio, mais ganchos, narrativas e ângulos prontos.',
    image: null,
    gradient: 'linear-gradient(135deg, #965E41 0%, #C98A5E 55%, #D4B99A 100%)',
    tabs: [
      { to: 'itens', label: 'Itens do Kit' },
      { to: 'alunas', label: 'Alunas com o Kit' },
    ],
  },
}
