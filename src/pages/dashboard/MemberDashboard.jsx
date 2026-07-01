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

  function getProgressBorder(moduleId) {
    const pct = getModuleProgress(moduleId)
    if (pct >= 100) return '4px solid var(--teal-medio)'
    if (pct > 0) return '4px solid var(--amendoado)'
    return '4px solid transparent'
  }

  const firstName = profile?.name?.split(' ')[0] || 'Aluna'
  const favoriteAds = favorites.map(f => f.ads).filter(Boolean)

  return (
    <div className="member-dashboard">
      <div className="member-dashboard__hero">
        <div className="member-dashboard__hero-content">
          <h1>Ola, {firstName}</h1>
          <p>Bem-vinda ao seu Acervo de Criativos</p>
        </div>
      </div>

      <section className="member-dashboard__section">
        <div className="member-dashboard__section-header">
          <h2>Seus modulos</h2>
        </div>
        <div className="module-grid">
          {modules
            .filter(m => m.slug !== 'kit-execucao')
            .map((mod, index) => (
              <Link
                key={mod.id}
                to={mod.slug === 'bonus-datas' ? `/modulos/${mod.slug}` : `/modulos/${mod.slug}`}
                className="module-card"
                style={{
                  borderLeft: getProgressBorder(mod.id),
                  animationDelay: `${index * 0.08}s`
                }}
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

      <section className="member-dashboard__section">
        <div className="member-dashboard__section-header">
          <h2>Seus favoritos</h2>
        </div>
        {favoriteAds.length > 0 ? (
          <>
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
          </>
        ) : (
          <div className="member-dashboard__empty-favorites">
            <svg
              className="member-dashboard__empty-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <p>Favorite seus anuncios preferidos para acesso rapido</p>
          </div>
        )}
      </section>
    </div>
  )
}
