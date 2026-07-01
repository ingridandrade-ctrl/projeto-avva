import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { useProgress } from '../../hooks/useProgress'
import { useFavorites } from '../../hooks/useFavorites'
import ProgressBar from '../../components/ui/ProgressBar'
import AdCard from '../../components/ads/AdCard'
import './MemberDashboard.css'

export default function MemberDashboard() {
  const { profile } = useAuth()
  const { progress } = useProgress()
  const { favorites, toggleFavorite, isFavorite } = useFavorites()
  const [modules, setModules] = useState([])
  const [adCounts, setAdCounts] = useState({})

  useEffect(() => {
    async function load() {
      const { data: mods } = await supabase
        .from('modules')
        .select('*')
        .order('order')
      setModules(mods || [])

      const { data: ads } = await supabase
        .from('ads')
        .select('id, module_id')
      const counts = {}
      for (const ad of (ads || [])) {
        counts[ad.module_id] = (counts[ad.module_id] || 0) + 1
      }
      setAdCounts(counts)
    }
    load()
  }, [])

  function getModuleProgress(moduleId) {
    const completed = progress.filter(p => p.module_id === moduleId).length
    const total = adCounts[moduleId] || 1
    return Math.round((completed / total) * 100)
  }

  const firstName = profile?.name?.split(' ')[0] || 'Aluna'
  const favoriteAds = favorites.map(f => f.ads).filter(Boolean)

  return (
    <div className="member-dashboard">
      <div className="member-dashboard__greeting">
        <h1>Olá, {firstName}</h1>
        <p>Bem-vinda ao seu Acervo de Criativos</p>
      </div>

      <section className="member-dashboard__section">
        <h2>Seus módulos</h2>
        <div className="module-grid">
          {modules
            .filter(m => m.slug !== 'kit-execucao')
            .map(mod => (
              <Link
                key={mod.id}
                to={mod.slug === 'bonus-datas' ? `/modulos/${mod.slug}` : `/modulos/${mod.slug}`}
                className="module-card"
              >
                <span className="module-card__order">
                  {mod.order === 0 ? '✦' : `${mod.order}`}
                </span>
                <div className="module-card__info">
                  <h3>{mod.title}</h3>
                  {mod.description && (
                    <p className="module-card__desc">{mod.description}</p>
                  )}
                  <ProgressBar value={getModuleProgress(mod.id)} />
                </div>
              </Link>
            ))}
        </div>
      </section>

      {favoriteAds.length > 0 && (
        <section className="member-dashboard__section">
          <h2>Seus favoritos</h2>
          <div className="ad-grid">
            {favoriteAds.slice(0, 4).map(ad => (
              <AdCard
                key={ad.id}
                ad={ad}
                isFavorite={isFavorite(ad.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
          {favoriteAds.length > 4 && (
            <p className="member-dashboard__more">
              + {favoriteAds.length - 4} favoritos
            </p>
          )}
        </section>
      )}
    </div>
  )
}
