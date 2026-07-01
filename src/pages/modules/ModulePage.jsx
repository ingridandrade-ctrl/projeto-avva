import { useEffect, useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useFavorites } from '../../hooks/useFavorites'
import { useProgress } from '../../hooks/useProgress'
import AdCard from '../../components/ads/AdCard'
import FilterBar from '../../components/filters/FilterBar'
import DriveEmbed from '../../components/ads/DriveEmbed'
import Button from '../../components/ui/Button'
import './ModulePage.css'

const MODULE_ORDER = [
  'boas-vindas', 'o-basico', 'negocio-local', 'infoproduto',
  'servico', 'ecommerce', 'bonus-datas',
]

const MODULE_LABELS = {
  'boas-vindas': 'Boas-vindas',
  'o-basico': 'O Basico',
  'negocio-local': 'Negocio Local',
  'infoproduto': 'Infoproduto',
  'servico': 'Servico',
  'ecommerce': 'E-commerce',
  'bonus-datas': 'Bonus Datas',
}

const BASICO_SECTIONS = [
  { key: 'atencao', title: 'O que prende atenção nos primeiros segundos' },
  { key: 'continuar', title: 'O que faz a pessoa continuar assistindo' },
  { key: 'converte', title: 'O que converte' },
  { key: 'formatos', title: 'Os principais formatos (UGC, talking head, notícia, POV...)' },
  { key: 'momentos', title: 'Como um anúncio pode atravessar vários momentos' },
]

const BONUS_DATES = ['Black Friday', 'Aniversário', 'Lançamento']

export default function ModulePage() {
  const { slug } = useParams()
  const { toggleFavorite, isFavorite } = useFavorites()
  const { markComplete, isComplete } = useProgress()
  const [mod, setMod] = useState(null)
  const [ads, setAds] = useState([])
  const [loading, setLoading] = useState(true)

  const [selectedMoment, setSelectedMoment] = useState(null)
  const [selectedFormat, setSelectedFormat] = useState(null)
  const [selectedSubniche, setSelectedSubniche] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setSelectedMoment(null)
      setSelectedFormat(null)
      setSelectedSubniche(null)
      setSelectedDate(null)

      const { data: modData } = await supabase
        .from('modules')
        .select('*')
        .eq('slug', slug)
        .single()
      setMod(modData)

      if (modData) {
        const { data: adsData } = await supabase
          .from('ads')
          .select('*')
          .eq('module_id', modData.id)
          .eq('active', true)
          .order('created_at')
        setAds(adsData || [])
      }
      setLoading(false)
    }
    load()
  }, [slug])

  const formats = useMemo(
    () => [...new Set(ads.map(a => a.format).filter(Boolean))].sort(),
    [ads]
  )
  const subniches = useMemo(
    () => [...new Set(ads.map(a => a.subniche).filter(Boolean))].sort(),
    [ads]
  )

  const filteredAds = useMemo(() => {
    let result = ads
    if (selectedMoment) result = result.filter(a => a.moment === selectedMoment)
    if (selectedFormat) result = result.filter(a => a.format === selectedFormat)
    if (selectedSubniche) result = result.filter(a => a.subniche === selectedSubniche)
    if (selectedDate) result = result.filter(a => a.subniche === selectedDate)
    return result
  }, [ads, selectedMoment, selectedFormat, selectedSubniche, selectedDate])

  const nextSlug = MODULE_ORDER[MODULE_ORDER.indexOf(slug) + 1]
  const moduleNumber = MODULE_ORDER.indexOf(slug) + 1

  if (loading) {
    return (
      <div className="module-page__loading">
        <div className="module-page__loading-spinner" />
        <span>Carregando...</span>
      </div>
    )
  }

  if (!mod) {
    return <div className="module-page__loading">Módulo não encontrado.</div>
  }

  if (slug === 'boas-vindas') {
    return (
      <div className="module-page">
        <div className="module-page__header">
          <span className="module-page__header-number">
            {String(moduleNumber).padStart(2, '0')}
          </span>
          <div className="module-page__header-text">
            <h1>{mod.title}</h1>
            <p className="module-page__desc">{mod.description}</p>
          </div>
        </div>
        {ads.length > 0 && (
          <div className="module-page__welcome-video">
            <DriveEmbed url={ads[0].drive_url} title={ads[0].title} />
          </div>
        )}
        {nextSlug && (
          <div className="module-page__nav">
            <Link to={`/modulos/${nextSlug}`}>
              <Button>Próximo módulo →</Button>
            </Link>
          </div>
        )}
      </div>
    )
  }

  if (slug === 'o-basico') {
    return (
      <div className="module-page">
        <div className="module-page__header">
          <span className="module-page__header-number">
            {String(moduleNumber).padStart(2, '0')}
          </span>
          <div className="module-page__header-text">
            <h1>{mod.title}</h1>
            <p className="module-page__desc">{mod.description}</p>
          </div>
        </div>

        <div className="basico-sections">
          {BASICO_SECTIONS.map((section, idx) => {
            const sectionAds = ads.filter(a => a.subniche === section.key)
            const done = isComplete(mod.id, section.key)
            return (
              <div key={section.key} className="basico-section">
                <span className="basico-section__number">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <div className="basico-section__header">
                  <h2>{section.title}</h2>
                  <button
                    className={`basico-section__check ${done ? 'basico-section__check--done' : ''}`}
                    onClick={() => markComplete(mod.id, section.key)}
                  >
                    {done ? (
                      <><span className="basico-section__check-icon">✓</span> Lido</>
                    ) : (
                      'Marcar como lido'
                    )}
                  </button>
                </div>
                {sectionAds.map(ad => (
                  <div key={ad.id} className="basico-section__ad">
                    <DriveEmbed url={ad.drive_url} title={ad.title} />
                    {ad.analysis && (
                      <div className="basico-section__analysis">
                        <h3>Análise</h3>
                        <p>{ad.analysis}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          })}
        </div>

        {nextSlug && (
          <div className="module-page__nav">
            <Link to={`/modulos/${nextSlug}`}>
              <Button>Próximo módulo →</Button>
            </Link>
          </div>
        )}
      </div>
    )
  }

  const isBonus = slug === 'bonus-datas'

  return (
    <div className="module-page">
      <div className="module-page__header">
        <span className="module-page__header-number">
          {String(moduleNumber).padStart(2, '0')}
        </span>
        <div className="module-page__header-text">
          <h1>{mod.title}</h1>
          <p className="module-page__desc">{mod.description}</p>
        </div>
      </div>

      {isBonus && (
        <div className="module-page__notice">
          <span className="module-page__notice-icon">&#9888;</span>
          Esses anúncios funcionam para quem já tem audiência
        </div>
      )}

      {isBonus && (
        <div className="module-page__date-filter">
          <span className="filter-bar__label">Data:</span>
          {BONUS_DATES.map(d => (
            <button
              key={d}
              className={`module-page__date-btn ${selectedDate === d ? 'module-page__date-btn--active' : ''}`}
              onClick={() => setSelectedDate(selectedDate === d ? null : d)}
            >
              {d}
            </button>
          ))}
        </div>
      )}

      <FilterBar
        formats={formats}
        subniches={isBonus ? [] : subniches}
        selectedMoment={selectedMoment}
        selectedFormat={selectedFormat}
        selectedSubniche={selectedSubniche}
        onMomentChange={setSelectedMoment}
        onFormatChange={setSelectedFormat}
        onSubnicheChange={setSelectedSubniche}
      />

      <div className="ad-grid">
        {filteredAds.map((ad, idx) => (
          <div
            key={ad.id}
            className="ad-grid__item"
            style={{ animationDelay: `${idx * 60}ms` }}
          >
            <AdCard
              ad={ad}
              isFavorite={isFavorite(ad.id)}
              onToggleFavorite={toggleFavorite}
            />
          </div>
        ))}
      </div>

      {filteredAds.length === 0 && (
        <div className="module-page__empty">
          <div className="module-page__empty-icon" />
          <p className="module-page__empty-title">Nenhum anúncio encontrado</p>
          <p className="module-page__empty-sub">
            Tente ajustar os filtros acima para ver mais resultados.
          </p>
        </div>
      )}

      {nextSlug && (
        <div className="module-page__nav">
          <Link to={`/modulos/${nextSlug}`}>
            <Button variant="secondary">Próximo módulo →</Button>
          </Link>
        </div>
      )}
    </div>
  )
}
