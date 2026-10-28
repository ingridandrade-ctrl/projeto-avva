import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useFavorites } from '../../hooks/useFavorites'
import AdCard from '../../components/ads/AdCard'
import AdModal from '../../components/ads/AdModal'
import './SearchPage.css'

export default function SearchPage() {
  const [params, setParams] = useSearchParams()
  const query = params.get('q') || ''
  const [typed, setTyped] = useState(query)
  const timer = useRef(null)
  const { toggleFavorite, isFavorite } = useFavorites()
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [openAd, setOpenAd] = useState(null)

  // Só busca depois de uma pausa na digitação
  function onType(value) {
    setTyped(value)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      setParams(value.trim() ? { q: value.trim() } : {}, { replace: true })
    }, 400)
  }

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
        .select('*, collections(title)')
        .eq('active', true)
        .or(`title.ilike.${term},analysis.ilike.${term}`)
        .order('created_at', { ascending: false })
        .limit(50)
      setResults(data || [])
      setLoading(false)
    }
    search()
  }, [query])

  return (
    <div className="search-page">
      <h1>Buscar anúncios</h1>
      <label className="search-page__field">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
        <input
          type="search"
          autoFocus
          placeholder="Digite um tema, um gancho, um nicho..."
          value={typed}
          onChange={e => onType(e.target.value)}
        />
      </label>
      {query.length >= 2 && <p className="search-page__query">Resultados para "{query}"</p>}

      {loading && <p className="search-page__status">Buscando...</p>}

      {!loading && results.length === 0 && query.length >= 2 && (
        <p className="search-page__status">Nenhum resultado encontrado.</p>
      )}

      {!loading && query.length < 2 && (
        <p className="search-page__status">Digite pelo menos 2 letras pra buscar.</p>
      )}

      <div className="ad-grid">
        {results.map(ad => (
          <AdCard
            key={ad.id}
            ad={ad}
            isFavorite={isFavorite(ad.id)}
            onToggleFavorite={toggleFavorite}
            onOpen={() => setOpenAd(ad)}
          />
        ))}
      </div>

      {openAd && (
        <AdModal
          ad={openAd}
          collectionTitle={openAd.collections?.title}
          isFavorite={isFavorite(openAd.id)}
          onToggleFavorite={toggleFavorite}
          onClose={() => setOpenAd(null)}
          list={results}
          onNavigate={setOpenAd}
        />
      )}
    </div>
  )
}
