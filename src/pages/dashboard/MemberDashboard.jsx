import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { useFavorites } from '../../hooks/useFavorites'
import { useActivity } from '../../hooks/useActivity'
import { getCollectionStyle } from '../../lib/catalog'
import Row from '../../components/ui/Row'
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

  // Destaque: a coleção extra mais recente (ex.: Melhores de Outubro 2026)
  const extras = collections.filter(c => getCollectionStyle(c.slug).kind !== 'fixa')
  const fixas = collections.filter(c => getCollectionStyle(c.slug).kind === 'fixa')
  const featured = extras.length ? extras[extras.length - 1] : fixas[0]
  const featuredAds = featured ? ads.filter(a => a.collection_id === featured.id) : []
  const featuredStyle = featured ? getCollectionStyle(featured.slug) : null

  const recentAds = recent.map(id => byId[id]).filter(Boolean)
  const favoriteAds = favorites.map(f => f.ads || byId[f.ad_id]).filter(Boolean)
  const latestAds = ads.slice(0, 12)

  function open(ad, list) {
    setOpenList(list)
    setOpenAd(ad)
  }

  return (
    <div className="member-dashboard">
      {/* Destaque */}
      <section className="hero" style={{ background: featuredStyle?.gradient }}>
        <div className="hero__orb hero__orb--1" />
        <div className="hero__orb hero__orb--2" />
        <div className="hero__content">
          <p className="hero__greeting">Olá, {firstName} ✦</p>
          {featured ? (
            <>
              <span className="hero__eyebrow">Em destaque</span>
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
                {featuredAds.length > 0 && (
                  <span className="hero__pill">{featuredAds.length} anúncios</span>
                )}
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
              <div key={ad.id} className={`hero__stack-item hero__stack-item--${i}`} onClick={() => open(ad, featuredAds)}>
                <CoverCard ad={ad} seen={isSeen(ad.id)} onClick={() => open(ad, featuredAds)} />
              </div>
            ))}
          </div>
        )}
      </section>

      {loading ? (
        <div className="home-skeleton">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} />)}
        </div>
      ) : (
        <>
          {recentAds.length > 0 && (
            <Row title="Continue de onde parou" subtitle="Os últimos anúncios que você abriu">
              {recentAds.map(ad => (
                <CoverCard key={ad.id} ad={ad} subtitle={colTitle(ad)} seen={isSeen(ad.id)} onClick={() => open(ad, recentAds)} />
              ))}
            </Row>
          )}

          <Row title="Coleções por objetivo" subtitle="Do primeiro contato até a venda" link="/produto/acervo-anuncios" size="lg">
            {fixas.map(col => (
              <Link key={col.id} to={`/colecao/${col.slug}`} className="col-cover" style={{ background: getCollectionStyle(col.slug).gradient }}>
                <span className="col-cover__num">{col.is_bonus ? 'Bônus' : String(col.order).padStart(2, '0')}</span>
                <strong>{col.title}</strong>
                <span className="col-cover__sub">{col.subtitle}</span>
                <span className="col-cover__count">{ads.filter(a => a.collection_id === col.id).length} anúncios</span>
              </Link>
            ))}
          </Row>

          {extras.length > 0 && (
            <Row title="Melhores do mês e especiais" subtitle="Seleções da Flora, mês a mês" link="/produto/acervo-anuncios" size="lg">
              {[...extras].reverse().map(col => (
                <Link key={col.id} to={`/colecao/${col.slug}`} className="col-cover" style={{ background: getCollectionStyle(col.slug).gradient }}>
                  <span className="col-cover__num">{getCollectionStyle(col.slug).kind === 'especial' ? 'Especial' : 'Mês'}</span>
                  <strong>{col.title}</strong>
                  <span className="col-cover__sub">{col.subtitle}</span>
                  <span className="col-cover__count">{ads.filter(a => a.collection_id === col.id).length} anúncios</span>
                </Link>
              ))}
            </Row>
          )}

          {latestAds.length > 0 && (
            <Row title="Novidades no acervo" subtitle="Últimos anúncios adicionados">
              {latestAds.map(ad => (
                <CoverCard key={ad.id} ad={ad} subtitle={colTitle(ad)} seen={isSeen(ad.id)} onClick={() => open(ad, latestAds)} />
              ))}
            </Row>
          )}

          {favoriteAds.length > 0 && (
            <Row title="Seus favoritos" subtitle="Os que você salvou com ♥">
              {favoriteAds.map(ad => (
                <CoverCard key={ad.id} ad={ad} subtitle={colTitle(ad)} seen={isSeen(ad.id)} onClick={() => open(ad, favoriteAds)} />
              ))}
            </Row>
          )}

          <Row title="Seus produtos" size="lg">
            <Link to="/produto/acervo-anuncios" className="col-cover col-cover--product" style={{ background: 'linear-gradient(135deg, #1A6868 0%, #3F7A66 40%, #C98A5E 100%)' }}>
              <span className="col-cover__num">Produto</span>
              <strong>Acervo de Anúncios</strong>
              <span className="col-cover__sub">{collections.length} coleções · {ads.length} anúncios</span>
              <span className="col-cover__count">Acessar →</span>
            </Link>
            {profile?.has_order_bump ? (
              <Link to="/kit" className="col-cover col-cover--product" style={{ background: 'linear-gradient(135deg, #A85C35 0%, #C98A5E 55%, #D4B99A 100%)' }}>
                <span className="col-cover__num">Order bump</span>
                <strong>Kit de Execução</strong>
                <span className="col-cover__sub">Ganchos, estruturas e prompts de IA</span>
                <span className="col-cover__count">Acessar →</span>
              </Link>
            ) : (
              <div className="col-cover col-cover--product col-cover--locked" style={{ background: 'linear-gradient(135deg, #A85C35 0%, #C98A5E 55%, #D4B99A 100%)' }}>
                <span className="col-cover__num">Premium</span>
                <strong>Kit de Execução</strong>
                <span className="col-cover__sub">Ganchos, estruturas e prompts de IA</span>
                <span className="col-cover__count">🔒 Faça upgrade para acessar</span>
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
