import { useEffect, useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useFavorites } from '../../hooks/useFavorites'
import { getCollection, COLLECTIONS } from '../../lib/catalog'
import AdCard from '../../components/ads/AdCard'
import FilterBar from '../../components/filters/FilterBar'
import './CollectionPage.css'

export default function CollectionPage() {
  const { slug } = useParams()
  const { toggleFavorite, isFavorite } = useFavorites()
  const [ads, setAds] = useState([])
  const [loading, setLoading] = useState(true)

  const [selectedNiche, setSelectedNiche] = useState(null)
  const [selectedMedia, setSelectedMedia] = useState(null)

  const collection = getCollection(slug)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setSelectedNiche(null)
      setSelectedMedia(null)

      const { data: colData } = await supabase
        .from('collections')
        .select('id')
        .eq('slug', slug)
        .single()

      if (colData) {
        const { data: adsData } = await supabase
          .from('ads')
          .select('*')
          .eq('collection_id', colData.id)
          .eq('active', true)
          .order('created_at')
        setAds(adsData || [])
      } else {
        setAds([])
      }
      setLoading(false)
    }
    load()
  }, [slug])

  const filteredAds = useMemo(() => {
    let result = ads
    if (selectedNiche) result = result.filter(a => (a.niches || []).includes(selectedNiche))
    if (selectedMedia) result = result.filter(a => a.media_type === selectedMedia)
    return result
  }, [ads, selectedNiche, selectedMedia])

  if (!collection) {
    return <div className="collection-page__loading">Coleção não encontrada.</div>
  }

  const idx = COLLECTIONS.findIndex(c => c.slug === slug)
  const next = COLLECTIONS[idx + 1]

  return (
    <div className="collection-page">
      {/* Header */}
      <div className="collection-page__header" style={{ background: collection.gradient }}>
        <div className="collection-page__header-orb" />
        <div className="collection-page__header-content">
          <Link to="/produto/acervo-anuncios" className="collection-page__back">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            Coleções
          </Link>
          <span className="collection-page__number">
            {collection.isBonus ? 'Bônus' : `Coleção ${String(collection.order).padStart(2, '0')}`}
          </span>
          <h1>{collection.title}</h1>
          <p>{collection.subtitle}</p>
        </div>
      </div>

      {/* Aviso fixo do bônus */}
      {collection.isBonus && (
        <div className="collection-page__notice">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          Esses anúncios funcionam melhor para quem já tem audiência.
        </div>
      )}

      <FilterBar
        selectedNiche={selectedNiche}
        selectedMedia={selectedMedia}
        onNicheChange={setSelectedNiche}
        onMediaChange={setSelectedMedia}
      />

      {loading ? (
        <div className="collection-page__loading">
          <div className="collection-page__loading-spinner" />
          <span>Carregando...</span>
        </div>
      ) : (
        <>
          <div className="ad-grid">
            {filteredAds.map((ad, i) => (
              <div key={ad.id} className="ad-grid__item" style={{ animationDelay: `${i * 60}ms` }}>
                <AdCard
                  ad={ad}
                  isFavorite={isFavorite(ad.id)}
                  onToggleFavorite={toggleFavorite}
                />
              </div>
            ))}
          </div>

          {filteredAds.length === 0 && (
            <div className="collection-page__empty">
              <p className="collection-page__empty-title">Nenhum anúncio encontrado</p>
              <p className="collection-page__empty-sub">
                {ads.length > 0
                  ? 'Tente ajustar os filtros acima.'
                  : 'Os anúncios dessa coleção chegam em breve.'}
              </p>
            </div>
          )}
        </>
      )}

      {next && (
        <div className="collection-page__nav">
          <Link to={`/colecao/${next.slug}`} className="collection-page__next">
            <span>
              <small>Próxima coleção</small>
              {next.title}
            </span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </Link>
        </div>
      )}
    </div>
  )
}
