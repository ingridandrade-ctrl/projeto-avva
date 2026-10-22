import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { getCollectionStyle } from '../../lib/catalog'
import { collectionCover } from '../../lib/drive'
import PhoneCard from '../../components/ui/PhoneCard'
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

export default function ProductPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [collections, setCollections] = useState(null)
  const [ads, setAds] = useState([])

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
      const [{ data: cols }, { data: adsData }] = await Promise.all([
        supabase.from('collections').select('*').order('order'),
        supabase.from('ads').select('id, collection_id, drive_url, media_type, created_at').eq('active', true).order('created_at'),
      ])
      setCollections(cols || [])
      setAds(adsData || [])
    }
    load()
  }, [slug, product, profile, navigate])

  if (!product || slug === 'kit-execucao') return null

  const fixas = (collections || []).filter(c => getCollectionStyle(c.slug).kind === 'fixa')
  const extras = (collections || []).filter(c => getCollectionStyle(c.slug).kind !== 'fixa')
  const countOf = col => ads.filter(a => a.collection_id === col.id).length

  function renderCard(col, index) {
    const style = getCollectionStyle(col.slug)
    const n = countOf(col)
    const kicker = col.is_bonus
      ? 'Bônus'
      : style.kind === 'fixa'
        ? `Coleção ${String(col.order).padStart(2, '0')}`
        : style.kind === 'melhores' ? 'Melhores do mês' : 'Especial'
    return (
      <PhoneCard
        key={col.id}
        to={`/colecao/${col.slug}`}
        image={collectionCover(col, ads, 900)}
        title={col.title}
        kicker={kicker}
        meta={`${n} ${n === 1 ? 'anúncio' : 'anúncios'}`}
        fallbackGradient={style.gradient}
        fallbackLabel={col.is_bonus ? '★' : style.kind === 'fixa' ? String(col.order).padStart(2, '0') : ''}
        className="module-card"
        style={{ animationDelay: `${index * 0.06}s` }}
      />
    )
  }

  const heroCover = collections?.length ? collectionCover(extras[extras.length - 1] || fixas[0], ads, 1600) : null

  return (
    <div className="product-page">
      <div className="product-page__hero" style={{ background: product.gradient }}>
        {heroCover && <img className="product-page__hero-bg" src={heroCover} alt="" />}
        <div className="product-page__hero-veil" />
        <div className="product-page__hero-content">
          <Link to="/alunas" className="product-page__back">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            Voltar
          </Link>
          <h1>{product.title}</h1>
          <p>{product.description}</p>
          {collections && (
            <span className="product-page__hero-meta">{collections.length} coleções · {ads.length} anúncios</span>
          )}
        </div>
      </div>

      <section className="product-page__modules">
        <h2>Coleções por objetivo</h2>
        <div className="module-grid">
          {collections === null
            ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="module-card--skeleton" />)
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
