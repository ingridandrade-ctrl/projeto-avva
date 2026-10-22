import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useFavorites } from '../../hooks/useFavorites'
import { useActivity } from '../../hooks/useActivity'
import AdCard from '../../components/ads/AdCard'
import AdModal from '../../components/ads/AdModal'
import '../search/SearchPage.css'

export default function FavoritesPage() {
  const { favorites, loading, toggleFavorite, isFavorite } = useFavorites()
  const { isSeen } = useActivity()
  const [collections, setCollections] = useState({})
  const [openAd, setOpenAd] = useState(null)

  useEffect(() => {
    supabase.from('collections').select('id, title').then(({ data }) => {
      setCollections(Object.fromEntries((data || []).map(c => [c.id, c.title])))
    })
  }, [])

  const ads = favorites.map(f => f.ads).filter(a => a && a.active !== false)

  return (
    <div className="search-page">
      <h1>Seus favoritos</h1>

      {loading && <p className="search-page__status">Carregando…</p>}

      {!loading && ads.length === 0 && (
        <p className="search-page__status">
          Você ainda não salvou nenhum anúncio. Toque no ♥ de um anúncio para guardar aqui.{' '}
          <Link to="/produto/acervo-anuncios">Explorar coleções →</Link>
        </p>
      )}

      <div className="ad-grid">
        {ads.map(ad => (
          <AdCard
            key={ad.id}
            ad={ad}
            seen={isSeen(ad.id)}
            isFavorite={isFavorite(ad.id)}
            onToggleFavorite={toggleFavorite}
            onOpen={() => setOpenAd(ad)}
          />
        ))}
      </div>

      {openAd && (
        <AdModal
          ad={openAd}
          collectionTitle={collections[openAd.collection_id]}
          isFavorite={isFavorite(openAd.id)}
          onToggleFavorite={toggleFavorite}
          onClose={() => setOpenAd(null)}
          list={ads}
          onNavigate={setOpenAd}
        />
      )}
    </div>
  )
}
