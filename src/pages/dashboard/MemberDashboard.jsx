import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { useFavorites } from '../../hooks/useFavorites'
import { useActivity } from '../../hooks/useActivity'
import { collectionCover } from '../../lib/drive'
import { getCollectionStyle, belongsTo } from '../../lib/catalog'
import CoverCard from '../../components/ads/CoverCard'
import AdModal from '../../components/ads/AdModal'
import './MemberDashboard.css'

// Link da página de venda do Kit (order bump). Vazio = botão escondido.
const KIT_SALES_URL = ''

// Home = vitrine dos produtos + um destaque do Acervo (mês mais recente).
// O conteúdo de cada produto vive dentro dele.
export default function MemberDashboard() {
  const { profile } = useAuth()
  const { toggleFavorite, isFavorite } = useFavorites()
  const { isSeen } = useActivity()
  const [collections, setCollections] = useState([])
  const [ads, setAds] = useState([])
  const [kitCount, setKitCount] = useState(null)
  const [loaded, setLoaded] = useState(false)
  const [openAd, setOpenAd] = useState(null)
  const [slide, setSlide] = useState(0)
  const timer = useRef(null)

  const firstName = profile?.name?.split(' ')[0] || 'Aluna'
  const hasKit = Boolean(profile?.has_order_bump)

  useEffect(() => {
    async function load() {
      const [{ data: cols }, { data: adsData }, { count }] = await Promise.all([
        supabase.from('collections').select('*').order('order'),
        supabase.from('ads').select('*').eq('active', true).order('created_at'),
        supabase.from('kit_items').select('id', { count: 'exact', head: true }),
      ])
      setCollections(cols || [])
      setAds(adsData || [])
      setKitCount(count || 0)
      setLoaded(true)
    }
    load()
  }, [])

  // Destaque = a coleção "Melhores de <mês>" mais recente (automático)
  const featured = useMemo(() => {
    const months = collections.filter(c => getCollectionStyle(c.slug).kind === 'melhores')
    const extras = collections.filter(c => getCollectionStyle(c.slug).kind !== 'fixa')
    return months[months.length - 1] || extras[extras.length - 1] || null
  }, [collections])
  const featuredAds = useMemo(() => (featured ? ads.filter(a => belongsTo(a, featured)) : []), [ads, featured])
  const cover = featured ? collectionCover(featured, ads, 1400) : null

  const slides = featured && featuredAds.length > 0 ? 2 : 1

  // Passa sozinho a cada 8s; para quando o modal está aberto
  useEffect(() => {
    clearInterval(timer.current)
    if (slides < 2 || openAd) return
    timer.current = setInterval(() => setSlide(s => (s + 1) % slides), 8000)
    return () => clearInterval(timer.current)
  }, [slides, openAd])

  function go(n) {
    setSlide(((n % slides) + slides) % slides)
  }

  const products = [
    {
      key: 'acervo',
      to: '/produto/acervo-anuncios',
      title: 'Acervo de Anúncios',
      description: 'Anúncios que funcionam, organizados por objetivo: do primeiro contato até a venda. Com a análise da Flora em cada um.',
      meta: loaded ? `${collections.length} coleções · ${ads.length} anúncios` : null,
      gradient: 'linear-gradient(135deg, #1A6868 0%, #3F7A66 45%, #A85C35 100%)',
      cover,
      owned: true,
    },
    {
      key: 'kit',
      to: '/kit',
      title: 'Kit de Execução',
      description: 'Ganchos prontos, estruturas narrativas e ângulos com prompts de IA para você sair do anúncio direto para a execução.',
      meta: kitCount === null ? null : `${kitCount} itens prontos`,
      gradient: 'linear-gradient(135deg, #A85C35 0%, #C98A5E 55%, #D4B99A 100%)',
      owned: hasKit,
    },
  ]

  return (
    <div className="member-dashboard">
      <section className="home-hero" aria-roledescription="carrossel">
        <div className="home-hero__orb home-hero__orb--1" />
        <div className="home-hero__orb home-hero__orb--2" />

        <div className="home-hero__track" style={{ transform: `translateX(-${slide * 100}%)` }}>
          <div className="home-hero__slide" aria-hidden={slide !== 0}>
            <div className="home-hero__content">
              <p className="home-hero__greeting">Olá, {firstName} ✦</p>
              <h1 className="home-hero__title">Bem-vinda à sua área de membros</h1>
              <p className="home-hero__subtitle">Seus produtos do Método AVVA estão aqui. Escolha um para começar.</p>
            </div>
          </div>

          {slides > 1 && (
            <div className="home-hero__slide home-hero__slide--featured" aria-hidden={slide !== 1}>
              <div className="home-hero__content">
                <p className="home-hero__greeting">Em destaque no Acervo de Anúncios</p>
                <h2 className="home-hero__title">{featured.title}</h2>
                <p className="home-hero__subtitle">{featured.subtitle}</p>
                <Link to={`/colecao/${featured.slug}`} className="home-hero__cta">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                  Explorar coleção
                </Link>
              </div>
              <div className="home-hero__stack" aria-hidden="true">
                {featuredAds.slice(0, 3).map((ad, i) => (
                  <div key={ad.id} className={`home-hero__stack-item home-hero__stack-item--${i}`}>
                    <CoverCard ad={ad} seen={isSeen(ad.id)} onClick={() => setOpenAd(ad)} size="sm" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {slides > 1 && (
          <>
            <button type="button" className="home-hero__arrow home-hero__arrow--prev" onClick={() => go(slide - 1)} aria-label="Anterior">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <button type="button" className="home-hero__arrow home-hero__arrow--next" onClick={() => go(slide + 1)} aria-label="Próximo">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
            <div className="home-hero__dots">
              {Array.from({ length: slides }).map((_, i) => (
                <button key={i} type="button" className={`home-hero__dot ${i === slide ? 'home-hero__dot--on' : ''}`} onClick={() => go(i)} aria-label={`Slide ${i + 1}`} />
              ))}
            </div>
          </>
        )}
      </section>

      <section className="home-products">
        <div className="home-products__head">
          <h2>Seus produtos</h2>
          <p>O que você já tem acesso e o que ainda pode desbloquear</p>
        </div>

        <div className="home-products__grid">
          {products.map(p => {
            const inner = (
              <>
                <div className="product-card__visual" style={{ background: p.gradient }}>
                  {p.cover && <img src={p.cover} alt="" loading="lazy" />}
                  <div className="product-card__shade" />
                  {!p.owned && (
                    <span className="product-card__lock">
                      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </span>
                  )}
                </div>
                <div className="product-card__body">
                  <h3>{p.title}</h3>
                  <p>{p.description}</p>
                  <div className="product-card__footer">
                    {p.meta && <span className="product-card__meta">{p.meta}</span>}
                    {p.owned ? (
                      <span className="product-card__cta">
                        Acessar
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                      </span>
                    ) : KIT_SALES_URL ? (
                      <a className="product-card__cta product-card__cta--buy" href={KIT_SALES_URL} target="_blank" rel="noreferrer">
                        Quero desbloquear
                      </a>
                    ) : (
                      <span className="product-card__locked-label">Disponível para quem tem o Kit</span>
                    )}
                  </div>
                </div>
              </>
            )
            return p.owned ? (
              <Link key={p.key} to={p.to} className="product-card">{inner}</Link>
            ) : (
              <div key={p.key} className="product-card product-card--locked">{inner}</div>
            )
          })}
        </div>
      </section>


      {openAd && (
        <AdModal
          ad={openAd}
          collectionTitle={featured?.title}
          isFavorite={isFavorite(openAd.id)}
          onToggleFavorite={toggleFavorite}
          onClose={() => setOpenAd(null)}
          list={featuredAds}
          onNavigate={setOpenAd}
        />
      )}
    </div>
  )
}
