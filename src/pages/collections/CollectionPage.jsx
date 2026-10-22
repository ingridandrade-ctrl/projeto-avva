import { useEffect, useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useFavorites } from '../../hooks/useFavorites'
import { useActivity } from '../../hooks/useActivity'
import { getCollectionStyle, OBJECTIVES } from '../../lib/catalog'
import { collectionCover } from '../../lib/drive'
import AdCard from '../../components/ads/AdCard'
import AdModal from '../../components/ads/AdModal'
import FilterBar from '../../components/filters/FilterBar'
import PhoneCard from '../../components/ui/PhoneCard'
import './CollectionPage.css'

export default function CollectionPage() {
  const { slug } = useParams()
  const { toggleFavorite, isFavorite } = useFavorites()
  const { isSeen } = useActivity()
  const [collection, setCollection] = useState(undefined)
  const [allCollections, setAllCollections] = useState([])
  const [allAds, setAllAds] = useState([])
  const [ads, setAds] = useState([])
  const [loading, setLoading] = useState(true)
  const [openAd, setOpenAd] = useState(null)

  const [selectedNiche, setSelectedNiche] = useState(null)
  const [selectedMedia, setSelectedMedia] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      setSelectedNiche(null)
      setSelectedMedia(null)
      setSearch('')
      setOpenAd(null)

      const [{ data: cols }, { data: covers }] = await Promise.all([
        supabase.from('collections').select('*').order('order'),
        supabase.from('ads').select('id, collection_id, objectives, drive_url').eq('active', true).order('created_at'),
      ])
      const list = cols || []
      setAllCollections(list)
      setAllAds(covers || [])
      const col = list.find(c => c.slug === slug) || null
      setCollection(col)

      if (col) {
        const isObjective = OBJECTIVES.some(o => o.value === col.slug)
        let q = supabase.from('ads').select('*').eq('active', true).order('created_at')
        q = isObjective
          ? q.or(`collection_id.eq.${col.id},objectives.cs.{${col.slug}}`)
          : q.eq('collection_id', col.id)
        const { data: adsData } = await q
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
    const term = search.trim().toLowerCase()
    if (term) result = result.filter(a => `${a.title} ${a.analysis || ''}`.toLowerCase().includes(term))
    return result
  }, [ads, selectedNiche, selectedMedia, search])

  if (collection === null) {
    return <div className="collection-page__loading">Coleção não encontrada.</div>
  }
  if (collection === undefined) {
    return <div className="collection-page__loading"><div className="collection-page__loading-spinner" /></div>
  }

  const style = getCollectionStyle(collection.slug)
  const idx = allCollections.findIndex(c => c.id === collection.id)
  const next = allCollections[idx + 1]
  const label = collection.is_bonus
    ? 'Bônus'
    : style.kind === 'fixa'
      ? `Coleção ${String(collection.order).padStart(2, '0')}`
      : style.kind === 'melhores' ? 'Melhores do mês' : 'Especial'

  const cover = collectionCover(collection, allAds, 1200)
  const seenCount = ads.filter(a => isSeen(a.id)).length
  const pct = ads.length ? Math.round((seenCount / ads.length) * 100) : 0
  const firstUnseen = ads.find(a => !isSeen(a.id)) || ads[0]

  return (
    <div className="collection-page">
      <header className="collection-page__header" style={{ background: style.gradient }}>
        {cover && <img className="collection-page__header-bg" src={cover} alt="" />}
        <div className="collection-page__header-veil" />

        <div className="collection-page__header-cover">
          <PhoneCard
            image={cover}
            title={collection.title}
            fallbackGradient={style.gradient}
            fallbackLabel={collection.is_bonus ? '★' : style.kind === 'fixa' ? String(collection.order).padStart(2, '0') : ''}
            className="collection-page__phone"
          />
        </div>

        <div className="collection-page__header-content">
          <Link to="/produto/acervo-anuncios" className="collection-page__back">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Voltar para as coleções
          </Link>
          <span className="collection-page__number">{label}</span>
          <h1>{collection.title}</h1>
          <p>{collection.subtitle}</p>

          {ads.length > 0 && (
            <div className="collection-page__progress">
              <div className="collection-page__progress-meta">
                <span>{ads.length} {ads.length === 1 ? 'anúncio' : 'anúncios'}</span>
                <span>{seenCount} vistos · {pct}%</span>
              </div>
              <div className="collection-page__progress-track">
                <div className="collection-page__progress-fill" style={{ width: `${pct}%` }} />
              </div>
            </div>
          )}

          {firstUnseen && (
            <button type="button" className="collection-page__start" onClick={() => setOpenAd(firstUnseen)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              {seenCount === 0 ? 'Começar' : seenCount >= ads.length ? 'Rever do início' : 'Continuar'}
            </button>
          )}
        </div>
      </header>

      {collection.is_bonus && (
        <div className="collection-page__notice">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          Esses anúncios funcionam melhor para quem já tem audiência.
        </div>
      )}

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        selectedNiche={selectedNiche}
        selectedMedia={selectedMedia}
        onNicheChange={setSelectedNiche}
        onMediaChange={setSelectedMedia}
        total={ads.length}
        shown={filteredAds.length}
      />

      {loading ? (
        <div className="ad-grid" aria-hidden="true">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="ad-skeleton" style={{ animationDelay: `${i * 120}ms` }} />
          ))}
        </div>
      ) : (
        <>
          <div className="ad-grid">
            {filteredAds.map((ad, i) => (
              <div key={ad.id} className="ad-grid__item" style={{ animationDelay: `${i * 50}ms` }}>
                <AdCard
                  ad={ad}
                  seen={isSeen(ad.id)}
                  isFavorite={isFavorite(ad.id)}
                  onToggleFavorite={toggleFavorite}
                  onOpen={() => setOpenAd(ad)}
                />
              </div>
            ))}
          </div>

          {filteredAds.length === 0 && (
            <div className="collection-page__empty">
              <p className="collection-page__empty-title">Nenhum anúncio encontrado</p>
              <p className="collection-page__empty-sub">
                {ads.length > 0
                  ? 'Tente ajustar os filtros ou a busca.'
                  : 'Os anúncios dessa coleção chegam em breve.'}
              </p>
            </div>
          )}
        </>
      )}

      {next && (
        <div className="collection-page__nav">
          <Link to={`/colecao/${next.slug}`} className="collection-page__next">
            <span className="collection-page__next-thumb" style={{ background: getCollectionStyle(next.slug).gradient }}>
              {collectionCover(next, allAds, 300) && <img src={collectionCover(next, allAds, 300)} alt="" loading="lazy" />}
            </span>
            <span>
              <small>Próxima coleção</small>
              {next.title}
            </span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </Link>
        </div>
      )}

      {openAd && (
        <AdModal
          ad={openAd}
          collectionTitle={collection.title}
          isFavorite={isFavorite(openAd.id)}
          onToggleFavorite={toggleFavorite}
          onClose={() => setOpenAd(null)}
          list={filteredAds.length ? filteredAds : ads}
          onNavigate={setOpenAd}
        />
      )}
    </div>
  )
}
