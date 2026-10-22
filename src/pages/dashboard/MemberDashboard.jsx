import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { useFavorites } from '../../hooks/useFavorites'
import { useActivity } from '../../hooks/useActivity'
import { getCollectionStyle, belongsTo } from '../../lib/catalog'
import { collectionCover } from '../../lib/drive'
import Row from '../../components/ui/Row'
import PhoneCard from '../../components/ui/PhoneCard'
import CoverCard from '../../components/ads/CoverCard'
import AdModal from '../../components/ads/AdModal'
import './MemberDashboard.css'

export default function MemberDashboard() {
  const { profile } = useAuth()
  const { favorites, toggleFavorite, isFavorite } = useFavorites()
  const { recent, isSeen } = useActivity()
  const [collections, setCollections] = useState([])
  const [ads, setAds] = useState([])
  const [loading, setLoading] = useState(true)
  const [openAd, setOpenAd] = useState(null)
  const [openList, setOpenList] = useState([])

  const firstName = profile?.name?.split(' ')[0] || 'Aluna'

  useEffect(() => {
    async function load() {
      const [{ data: cols }, { data: adsData }] = await Promise.all([
        supabase.from('collections').select('*').order('order'),
        supabase.from('ads').select('*').eq('active', true).order('created_at', { ascending: false }),
      ])
      setCollections(cols || [])
      setAds(adsData || [])
      setLoading(false)
    }
    load()
  }, [])

  const byId = useMemo(() => Object.fromEntries(ads.map(a => [a.id, a])), [ads])
  const colById = useMemo(() => Object.fromEntries(collections.map(c => [c.id, c])), [collections])
  const colTitle = ad => colById[ad.collection_id]?.title
  const countOf = col => ads.filter(a => belongsTo(a, col)).length

  // Capas de coleção: anúncios mais antigos primeiro (capa estável)
  const adsAsc = useMemo(() => [...ads].reverse(), [ads])

  // Destaque: a coleção extra mais recente (ex.: Melhores de Outubro 2026)
  const extras = collections.filter(c => getCollectionStyle(c.slug).kind !== 'fixa')
  const fixas = collections.filter(c => getCollectionStyle(c.slug).kind === 'fixa')
  const featured = extras.length ? extras[extras.length - 1] : fixas[0]
  const featuredAds = featured ? ads.filter(a => belongsTo(a, featured)) : []
  const featuredStyle = featured ? getCollectionStyle(featured.slug) : null

  const recentAds = recent.map(id => byId[id]).filter(Boolean)
  const favoriteAds = favorites.map(f => f.ads || byId[f.ad_id]).filter(Boolean)
  const latestAds = ads.slice(0, 10)

  function open(ad, list) {
    setOpenList(list)
    setOpenAd(ad)
  }

  function collectionCard(col, kicker) {
    const style = getCollectionStyle(col.slug)
    const n = countOf(col)
    return (
      <PhoneCard
        key={col.id}
        to={`/colecao/${col.slug}`}
        image={collectionCover(col, adsAsc, 800)}
        title={col.title}
        kicker={kicker}
        meta={`${n} ${n === 1 ? 'anúncio' : 'anúncios'}`}
        fallbackGradient={style.gradient}
        fallbackLabel={col.is_bonus ? '★' : style.kind === 'fixa' ? String(col.order).padStart(2, '0') : ''}
      />
    )
  }

  return (
    <div className="member-dashboard">
      {/* Destaque */}
      {loading ? (
        <div className="hero hero--skeleton" aria-hidden="true" />
      ) : (
        <section className="hero" style={{ background: featuredStyle?.gradient }}>
          <div className="hero__orb hero__orb--1" />
          <div className="hero__orb hero__orb--2" />
          <div className="hero__content">
            <p className="hero__greeting">Olá, {firstName} ✦</p>
            {featured ? (
              <>
                <span className="hero__eyebrow">
                  Em destaque{featuredAds.length > 0 && ` · ${featuredAds.length} anúncios`}
                </span>
                <h1 className="hero__title">{featured.title}</h1>
                <p className="hero__subtitle">{featured.subtitle}</p>
                <div className="hero__actions">
                  <Link to={`/colecao/${featured.slug}`} className="hero__cta">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                    Explorar coleção
                  </Link>
                  <Link to="/produto/acervo-anuncios" className="hero__cta hero__cta--ghost">
                    Ver todas as coleções
                  </Link>
                </div>
              </>
            ) : (
              <>
                <h1 className="hero__title">Bem-vinda à sua área de membros</h1>
                <p className="hero__subtitle">Escolha um produto para começar</p>
              </>
            )}
          </div>
          {featuredAds.length > 0 && (
            <div className="hero__stack" aria-hidden="true">
              {featuredAds.slice(0, 3).map((ad, i) => (
                <div key={ad.id} className={`hero__stack-item hero__stack-item--${i}`}>
                  <CoverCard ad={ad} seen={isSeen(ad.id)} onClick={() => open(ad, featuredAds)} size="sm" />
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {loading ? (
        <div className="home-skeleton">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} />)}
        </div>
      ) : (
        <>
          {recentAds.length > 0 && (
            <Row title="Continue de onde parou" subtitle="Os últimos anúncios que você abriu" link="/produto/acervo-anuncios">
              {recentAds.map(ad => (
                <CoverCard key={ad.id} ad={ad} subtitle={colTitle(ad)} seen={isSeen(ad.id)} onClick={() => open(ad, recentAds)} />
              ))}
            </Row>
          )}

          <Row title="Seus produtos" subtitle="Tudo que você tem acesso" size="lg">
            <PhoneCard
              to="/produto/acervo-anuncios"
              image={collectionCover(featured, adsAsc, 800)}
              title="Acervo de Anúncios"
              kicker="Produto"
              meta={`${collections.length} coleções · ${ads.length} anúncios`}
              fallbackGradient="linear-gradient(160deg, #1A6868 0%, #3F7A66 40%, #C98A5E 100%)"
            />
            <PhoneCard
              to="/kit"
              locked={!profile?.has_order_bump}
              title="Kit de Execução"
              kicker={profile?.has_order_bump ? 'Order bump' : 'Premium'}
              meta="Ganchos, estruturas e prompts de IA"
              fallbackGradient="linear-gradient(160deg, #A85C35 0%, #C98A5E 55%, #D4B99A 100%)"
              fallbackLabel="✦"
            />
          </Row>

          <Row title="Coleções por objetivo" subtitle="Do primeiro contato até a venda" link="/produto/acervo-anuncios" size="lg">
            {fixas.map(col => collectionCard(col, col.is_bonus ? 'Bônus' : `Coleção ${String(col.order).padStart(2, '0')}`))}
          </Row>

          {latestAds.length > 0 && (
            <Row title="Novidades no acervo" subtitle="Últimos anúncios adicionados" link="/produto/acervo-anuncios">
              {latestAds.map(ad => (
                <CoverCard key={ad.id} ad={ad} subtitle={colTitle(ad)} seen={isSeen(ad.id)} onClick={() => open(ad, latestAds)} />
              ))}
            </Row>
          )}

          {extras.length > 0 && (
            <Row title="Melhores do mês e especiais" subtitle="Seleções da Flora, mês a mês" link="/produto/acervo-anuncios" size="lg">
              {[...extras].reverse().map(col => collectionCard(col, getCollectionStyle(col.slug).kind === 'especial' ? 'Especial' : 'Melhores do mês'))}
            </Row>
          )}

          <Row title="Seus favoritos" subtitle="Os que você salvou com ♥" link={favoriteAds.length ? '/favoritos' : undefined}>
            {favoriteAds.length > 0 ? favoriteAds.map(ad => (
              <CoverCard key={ad.id} ad={ad} subtitle={colTitle(ad)} seen={isSeen(ad.id)} onClick={() => open(ad, favoriteAds)} />
            )) : (
              <div className="empty-card">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                <p>Toque no ♥ de um anúncio para guardar aqui</p>
              </div>
            )}
          </Row>
        </>
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
