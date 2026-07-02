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
  },
  'kit-execucao': {
    title: 'Kit de Execução',
    description: 'Ganchos, estruturas narrativas e prompts de IA prontos para você usar.',
    requiresOrderBump: true,
  },
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
      {/* Cabeçalho editorial */}
      <header className="product-hero">
        <Link to="/dashboard" className="product-hero__back">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          Início
        </Link>
        <h1 className="product-hero__title">
          Acervo de<br /><em>anúncios</em>
        </h1>
        <div className="product-hero__rule">
          <span>{product.description}</span>
        </div>
      </header>

      {/* Coleções em linhas */}
      <section className="product-collections">
        <span className="product-collections__label">Coleções — por objetivo</span>

        {COLLECTIONS.map(col => (
          <Link key={col.slug} to={`/colecao/${col.slug}`} className="col-row">
            <span className="col-row__number">
              {col.isBonus ? '✦' : String(col.order).padStart(2, '0')}
            </span>
            <div className="col-row__info">
              <h2 className="col-row__title">{col.title}</h2>
              <p className="col-row__sub">{col.subtitle}</p>
            </div>
            <span className="col-row__meta">
              {adCounts === null ? (
                <span className="col-row__skeleton" />
              ) : (
                `${adCounts[col.slug] || 0} anúncios`
              )}
            </span>
            <span className="col-row__arrow" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
            </span>
          </Link>
        ))}
      </section>
    </div>
  )
}
