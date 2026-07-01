import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { COLLECTIONS } from '../../lib/catalog'
import './ProductPage.css'

const PRODUCTS = {
  'acervo-anuncios': {
    title: 'Acervo de Anúncios',
    description: 'Sua biblioteca de anúncios que funcionam, organizados por objetivo — do primeiro contato até a venda.',
    gradient: 'linear-gradient(135deg, #0C4747 0%, #1A6868 50%, #A85C35 100%)',
  },
  'kit-execucao': {
    title: 'Kit de Execução',
    description: 'Ganchos, estruturas narrativas e prompts de IA prontos para você usar.',
    gradient: 'linear-gradient(135deg, #4C362D 0%, #A85C35 50%, #D4B99A 100%)',
    requiresOrderBump: true,
  },
}

const COLLECTION_ICONS = {
  'ser-descoberta': (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
  ),
  'mostrar-que-voce-entende': (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
  ),
  'provar-que-funciona': (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
  ),
  'quebrar-o-mas': (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
  ),
  'vender-agora': (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
  ),
  'datas-especiais': (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
  ),
}

export default function ProductPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [adCounts, setAdCounts] = useState(null)

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

    if (slug === 'kit-execucao') {
      navigate('/kit', { replace: true })
      return
    }

    async function load() {
      const { data: ads } = await supabase
        .from('ads')
        .select('id, collection_id, collections(slug)')
        .eq('active', true)
      const counts = {}
      for (const ad of (ads || [])) {
        const cslug = ad.collections?.slug
        if (cslug) counts[cslug] = (counts[cslug] || 0) + 1
      }
      setAdCounts(counts)
    }
    load()
  }, [slug, product, profile, navigate])

  if (!product || slug === 'kit-execucao') return null

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

      {/* Coleções */}
      <section className="product-page__modules">
        <h2>Coleções</h2>
        <div className="module-grid">
          {COLLECTIONS.map((col, index) => (
            <Link
              key={col.slug}
              to={`/colecao/${col.slug}`}
              className="module-card"
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              <div className="module-card__banner" style={{ background: col.gradient }}>
                <div className="module-card__banner-orb" />
                <div className="module-card__banner-icon">
                  {COLLECTION_ICONS[col.slug]}
                </div>
                <span className="module-card__order">
                  {col.isBonus ? 'Bônus' : String(col.order).padStart(2, '0')}
                </span>
              </div>
              <div className="module-card__body">
                <h3>{col.title}</h3>
                <p>{col.subtitle}</p>
                <div className="module-card__footer">
                  {adCounts === null ? (
                    <span className="module-card__count-skeleton" />
                  ) : (
                    <span className="module-card__count">
                      {adCounts[col.slug] || 0} anúncios
                    </span>
                  )}
                  <span className="module-card__cta">
                    Explorar
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
