import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { getCollectionStyle } from '../../lib/catalog'
import './ProductPage.css'

const PRODUCTS = {
  'acervo-anuncios': {
    title: 'Acervo de Anúncios',
    description: 'Sua biblioteca de anúncios que funcionam, organizados por objetivo — do primeiro contato até a venda.',
    gradient: 'linear-gradient(135deg, #1A6868 0%, #3F7A66 45%, #A85C35 100%)',
  },
  'kit-execucao': {
    title: 'Kit de Execução',
    description: 'Ganchos, estruturas narrativas e prompts de IA prontos para você usar.',
    gradient: 'linear-gradient(135deg, #4C362D 0%, #A85C35 50%, #D4B99A 100%)',
    requiresOrderBump: true,
  },
}

const I = (d) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{d}</svg>
)

const COLLECTION_ICONS = {
  'ser-descoberta': I(<><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>),
  'mostrar-que-voce-entende': I(<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>),
  'provar-que-funciona': I(<><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>),
  'quebrar-o-mas': I(<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>),
  'vender-agora': I(<><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>),
  'datas-especiais': I(<><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>),
}

const KIND_ICONS = {
  melhores: I(<><path d="M8 21h8"/><path d="M12 17v4"/><path d="M7 4h10v5a5 5 0 0 1-10 0V4z"/><path d="M17 6h2a2 2 0 0 1 0 4h-2"/><path d="M7 6H5a2 2 0 0 0 0 4h2"/></>),
  especial: I(<><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></>),
  outra: I(<path d="M12 2l2.4 7.2H22l-6.2 4.5 2.4 7.3-6.2-4.5-6.2 4.5 2.4-7.3L2 9.2h7.6z"/>),
}

function iconFor(col) {
  return COLLECTION_ICONS[col.slug] || KIND_ICONS[getCollectionStyle(col.slug).kind] || KIND_ICONS.outra
}

export default function ProductPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [collections, setCollections] = useState(null)
  const [adCounts, setAdCounts] = useState(null)

  const product = PRODUCTS[slug]

  useEffect(() => {
    if (!product) {
      navigate('/alunas', { replace: true })
      return
    }
    if (product.requiresOrderBump && !profile?.has_order_bump) {
      navigate('/alunas', { replace: true })
      return
    }
    if (slug === 'kit-execucao') {
      navigate('/kit', { replace: true })
      return
    }

    async function load() {
      const [{ data: cols }, { data: ads }] = await Promise.all([
        supabase.from('collections').select('*').order('order'),
        supabase.from('ads').select('collection_id').eq('active', true),
      ])
      setCollections(cols || [])
      const counts = {}
      for (const ad of (ads || [])) {
        counts[ad.collection_id] = (counts[ad.collection_id] || 0) + 1
      }
      setAdCounts(counts)
    }
    load()
  }, [slug, product, profile, navigate])

  if (!product || slug === 'kit-execucao') return null

  const fixas = (collections || []).filter(c => getCollectionStyle(c.slug).kind === 'fixa')
  const extras = (collections || []).filter(c => getCollectionStyle(c.slug).kind !== 'fixa')

  function renderCard(col, index) {
    const style = getCollectionStyle(col.slug)
    const count = adCounts === null ? null : (adCounts[col.id] || 0)
    return (
      <Link
        key={col.id}
        to={`/colecao/${col.slug}`}
        className="module-card"
        style={{ animationDelay: `${index * 0.06}s` }}
      >
        <div className="module-card__banner" style={{ background: style.gradient }}>
          <div className="module-card__banner-orb" />
          <div className="module-card__banner-icon">{iconFor(col)}</div>
          <span className={`module-card__order ${col.is_bonus || style.kind !== 'fixa' ? 'module-card__order--bonus' : ''}`}>
            {col.is_bonus ? 'Bônus' : style.kind === 'fixa' ? String(col.order).padStart(2, '0') : ''}
          </span>
        </div>
        <div className="module-card__body">
          <h3>{col.title}</h3>
          <p>{col.subtitle}</p>
          <div className="module-card__footer">
            {count === null ? (
              <span className="module-card__count-skeleton" />
            ) : (
              <span className="module-card__count">{count} {count === 1 ? 'anúncio' : 'anúncios'}</span>
            )}
            <span className="module-card__cta">
              Explorar
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </span>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <div className="product-page">
      <div className="product-page__hero" style={{ background: product.gradient }}>
        <div className="product-page__hero-orb product-page__hero-orb--1" />
        <div className="product-page__hero-orb product-page__hero-orb--2" />
        <div className="product-page__hero-content">
          <Link to="/alunas" className="product-page__back">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            Voltar
          </Link>
          <h1>{product.title}</h1>
          <p>{product.description}</p>
        </div>
      </div>

      <section className="product-page__modules">
        <h2>Coleções por objetivo</h2>
        <div className="module-grid">
          {collections === null
            ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="module-card module-card--skeleton" />)
            : fixas.map(renderCard)}
        </div>
      </section>

      {extras.length > 0 && (
        <section className="product-page__modules">
          <h2>Melhores do mês e especiais</h2>
          <div className="module-grid">
            {extras.map(renderCard)}
          </div>
        </section>
      )}
    </div>
  )
}
