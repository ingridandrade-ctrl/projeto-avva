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

const MODULE_ICONS = {
  'boas-vindas': '👋',
  'o-basico': '📐',
  'negocio-local': '📍',
  'infoproduto': '💡',
  'servico': '🔧',
  'ecommerce': '🛒',
  'bonus-datas': '🎁',
  'kit-execucao': '✍️',
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
        <div className="module-circles">
          {filteredModules.map((mod, index) => {
            const pct = getModuleProgress(mod.id)
            const isComplete = pct >= 100
            return (
              <Link
                key={mod.id}
                to={slug === 'kit-execucao' ? '/kit' : `/modulos/${mod.slug}`}
                className={`module-circle ${isComplete ? 'module-circle--complete' : ''}`}
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <div className="module-circle__ring">
                  <svg className="module-circle__progress" viewBox="0 0 100 100">
                    <circle className="module-circle__track" cx="50" cy="50" r="44" />
                    <circle
                      className="module-circle__fill"
                      cx="50" cy="50" r="44"
                      strokeDasharray={`${pct * 2.76} 276`}
                      strokeDashoffset="0"
                    />
                  </svg>
                  <span className="module-circle__icon">
                    {MODULE_ICONS[mod.slug] || `${mod.order}`}
                  </span>
                </div>
                <span className="module-circle__title">{mod.title}</span>
                {pct > 0 && pct < 100 && (
                  <span className="module-circle__pct">{pct}%</span>
                )}
                {isComplete && (
                  <span className="module-circle__check">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}
