import { useEffect, useMemo, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { useFavorites } from '../../hooks/useFavorites'
import { useActivity } from '../../hooks/useActivity'
import { getCollectionStyle, belongsTo } from '../../lib/catalog'
import { collectionCover } from '../../lib/drive'
import PhoneCard from '../../components/ui/PhoneCard'
import Row from '../../components/ui/Row'
import CoverCard from '../../components/ads/CoverCard'
import AdModal from '../../components/ads/AdModal'
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

// Página do produto: tudo do Acervo mora aqui (continuar, coleções,
// melhores do mês, novidades, favoritos).
export default function ProductPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { favorites, toggleFavorite, isFavorite } = useFavorites()
  const { recent, isSeen } = useActivity()
  const [collections, setCollections] = useState(null)
  const [ads, setAds] = useState([])
  const [openAd, setOpenAd] = useState(null)
  const [openList, setOpenList] = useState([])

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
        supabase.from('ads').select('*').eq('active', true).order('created_at'),
      ])
      setCollections(cols || [])
      setAds(adsData || [])
    }
    load()
  }, [slug, product, profile, navigate])

  const byId = useMemo(() => Object.fromEntries(ads.map(a => [a.id, a])), [ads])
  const colById = useMemo(() => Object.fromEntries((collections || []).map(c => [c.id, c])), [collections])

  if (!product || slug === 'kit-execucao') return null

  const fixas = (collections || []).filter(c => getCollectionStyle(c.slug).kind === 'fixa')
  const extras = (collections || []).filter(c => getCollectionStyle(c.slug).kind !== 'fixa')
  const countOf = col => ads.filter(a => belongsTo(a, col)).length
  const colTitle = ad => colById[ad.collection_id]?.title

  const recentAds = recent.map(id => byId[id]).filter(Boolean)
  const favoriteAds = favorites.map(f => f.ads || byId[f.ad_id]).filter(a => a && a.active !== false)
  const latestAds = [...ads].reverse().slice(0, 12)

  function open(ad, list) {
    setOpenList(list)
    setOpenAd(ad)
  }

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
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Voltar para o início
          </Link>
          <h1>{product.title}</h1>
          <p>{product.description}</p>
          {collections && (
            <span className="product-page__hero-meta">{collections.length} coleções · {ads.length} anúncios</span>
          )}
        </div>
      </div>

      {recentAds.length > 0 && (
        <Row title="Continue de onde parou" subtitle="Os últimos anúncios que você abriu">
          {recentAds.map(ad => (
            <CoverCard key={ad.id} ad={ad} subtitle={colTitle(ad)} seen={isSeen(ad.id)} onClick={() => open(ad, recentAds)} />
          ))}
        </Row>
      )}

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
            {[...extras].reverse().map(renderCard)}
          </div>
        </section>
      )}

      {latestAds.length > 0 && (
        <div className="product-page__rows">
          <Row title="Novidades no acervo" subtitle="Últimos anúncios adicionados">
            {latestAds.map(ad => (
              <CoverCard key={ad.id} ad={ad} subtitle={colTitle(ad)} seen={isSeen(ad.id)} onClick={() => open(ad, latestAds)} />
            ))}
          </Row>

          {favoriteAds.length > 0 && (
            <Row title="Seus favoritos" subtitle="Os que você salvou com ♥" link="/favoritos">
              {favoriteAds.map(ad => (
                <CoverCard key={ad.id} ad={ad} subtitle={colTitle(ad)} seen={isSeen(ad.id)} onClick={() => open(ad, favoriteAds)} />
              ))}
            </Row>
          )}
        </div>
      )}

      {openAd && (
        <AdModal
          ad={openAd}
          collectionTitle={colTitle(openAd)}
          isFavorite={isFavorite(openAd.id)}
          onToggleFavorite={toggleFavorite}
          onClose={() => setOpenAd(null)}
          list={openList}
          onNavigate={setOpenAd}
        />
      )}
    </div>
  )
}
