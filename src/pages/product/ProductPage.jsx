import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { useProgress } from '../../hooks/useProgress'
import './ProductPage.css'

const PRODUCTS = {
  'acervo-criativos': {
    title: 'Acervo de Criativos',
    description: 'Sua biblioteca completa de anúncios analisados, organizados por nicho e momento de funil.',
    gradient: 'linear-gradient(135deg, #0C4747 0%, #1A6868 50%, #A85C35 100%)',
  },
  'kit-execucao': {
    title: 'Kit de Execução',
    description: 'Ganchos, estruturas narrativas e prompts de IA prontos para você usar.',
    gradient: 'linear-gradient(135deg, #4C362D 0%, #A85C35 50%, #D4B99A 100%)',
    requiresOrderBump: true,
  },
}

const MODULE_BANNERS = {
  'boas-vindas': {
    gradient: 'linear-gradient(135deg, #0C4747 0%, #1A6868 100%)',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
    ),
  },
  'o-basico': {
    gradient: 'linear-gradient(135deg, #1A6868 0%, #2C6B5A 100%)',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
    ),
  },
  'negocio-local': {
    gradient: 'linear-gradient(135deg, #A85C35 0%, #D4B99A 100%)',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
    ),
  },
  'infoproduto': {
    gradient: 'linear-gradient(135deg, #4C362D 0%, #A85C35 100%)',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
    ),
  },
  'servico': {
    gradient: 'linear-gradient(135deg, #0C4747 0%, #A85C35 100%)',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
    ),
  },
  'ecommerce': {
    gradient: 'linear-gradient(135deg, #1A6868 0%, #0C4747 50%, #4C362D 100%)',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
    ),
  },
  'bonus-datas': {
    gradient: 'linear-gradient(135deg, #A85C35 0%, #D4B99A 50%, #1A6868 100%)',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
    ),
  },
  'kit-execucao': {
    gradient: 'linear-gradient(135deg, #4C362D 0%, #A85C35 100%)',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
    ),
  },
}

export default function ProductPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { progress } = useProgress()
  const [modules, setModules] = useState([])
  const [adCounts, setAdCounts] = useState({})

  const product = PRODUCTS[slug]

  useEffect(() => {
    if (!product) {
      navigate('/dashboard', { replace: true })
      return
    }

    if (product.requiresOrderBump && !profile?.has_order_bump) {
      navigate('/dashboard', { replace: true })
      return
    }

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
  }, [slug, product, profile, navigate])

  if (!product) return null

  function getModuleProgress(moduleId) {
    const completed = progress.filter(p => p.module_id === moduleId).length
    const total = adCounts[moduleId] || 1
    return Math.round((completed / total) * 100)
  }

  const filteredModules = slug === 'kit-execucao'
    ? modules.filter(m => m.slug === 'kit-execucao')
    : modules.filter(m => m.slug !== 'kit-execucao')

  return (
    <div className="product-page">
      {/* Hero */}
      <div className="product-page__hero" style={{ background: product.gradient }}>
        <div className="product-page__hero-orb product-page__hero-orb--1" />
        <div className="product-page__hero-orb product-page__hero-orb--2" />
        <div className="product-page__hero-content">
          <Link to="/dashboard" className="product-page__back">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            Voltar
          </Link>
          <h1>{product.title}</h1>
          <p>{product.description}</p>
        </div>
      </div>

      {/* Modules */}
      <section className="product-page__modules">
        <h2>Módulos</h2>
        <div className="module-grid">
          {filteredModules.map((mod, index) => {
            const pct = getModuleProgress(mod.id)
            const isComplete = pct >= 100
            const banner = MODULE_BANNERS[mod.slug] || { gradient: 'linear-gradient(135deg, #0C4747, #1A6868)', icon: null }

            return (
              <Link
                key={mod.id}
                to={slug === 'kit-execucao' ? '/kit' : `/modulos/${mod.slug}`}
                className={`module-card ${isComplete ? 'module-card--complete' : ''}`}
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <div className="module-card__banner" style={{ background: banner.gradient }}>
                  <div className="module-card__banner-orb" />
                  <div className="module-card__banner-icon">
                    {banner.icon}
                  </div>
                  <span className="module-card__order">
                    {mod.order === 0 ? 'Intro' : `${String(mod.order).padStart(2, '0')}`}
                  </span>
                  {isComplete && (
                    <span className="module-card__badge-complete">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      Completo
                    </span>
                  )}
                </div>
                <div className="module-card__body">
                  <h3>{mod.title}</h3>
                  {mod.description && <p>{mod.description}</p>}
                  <div className="module-card__footer">
                    {pct > 0 && !isComplete && (
                      <div className="module-card__progress">
                        <div className="module-card__progress-bar">
                          <div className="module-card__progress-fill" style={{ width: `${pct}%` }} />
                        </div>
                        <span>{pct}%</span>
                      </div>
                    )}
                    <span className="module-card__cta">
                      {isComplete ? 'Revisar' : pct > 0 ? 'Continuar' : 'Começar'}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}
