import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useFavorites } from '../../hooks/useFavorites'
import AdCard from '../../components/ads/AdCard'
import './SearchPage.css'

export default function SearchPage() {
  const [params] = useSearchParams()
  const query = params.get('q') || ''
  const { toggleFavorite, isFavorite } = useFavorites()
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function search() {
      if (query.length < 2) {
        setResults([])
        return
      }
      setLoading(true)
      const term = `%${query}%`
      const { data } = await supabase
        .from('ads')
        .select('*')
        .or(`title.ilike.${term},analysis.ilike.${term},subniche.ilike.${term}`)
        .order('created_at', { ascending: false })
        .limit(50)
      setResults(data || [])
      setLoading(false)
    }
    search()
  }, [query])

  return (
    <div className="search-page">
      <h1>Resultados para "{query}"</h1>

      {loading && <p className="search-page__status">Buscando...</p>}

      {!loading && results.length === 0 && query.length >= 2 && (
        <p className="search-page__status">Nenhum resultado encontrado.</p>
      )}

      {!loading && query.length < 2 && (
        <p className="search-page__status">Digite pelo menos 2 caracteres para buscar.</p>
      )}

      <div className="ad-grid">
        {results.map(ad => (
          <AdCard
            key={ad.id}
            ad={ad}
            isFavorite={isFavorite(ad.id)}
            onToggleFavorite={toggleFavorite}
          />
        ))}
      </div>
    </div>
  )
}
