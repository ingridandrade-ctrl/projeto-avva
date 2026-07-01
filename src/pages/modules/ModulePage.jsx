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

  if (loading) {
    return <div className="module-page__loading">Carregando...</div>
  }

  if (!mod) {
    return <div className="module-page__loading">Módulo não encontrado.</div>
  }

  if (slug === 'boas-vindas') {
    return (
      <div className="module-page">
        <h1>{mod.title}</h1>
        <p className="module-page__desc">{mod.description}</p>
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
        <h1>{mod.title}</h1>
        <p className="module-page__desc">{mod.description}</p>

        <div className="basico-sections">
          {BASICO_SECTIONS.map(section => {
            const sectionAds = ads.filter(a => a.subniche === section.key)
            const done = isComplete(mod.id, section.key)
            return (
              <div key={section.key} className="basico-section">
                <div className="basico-section__header">
                  <h2>{section.title}</h2>
                  <button
                    className={`basico-section__check ${done ? 'basico-section__check--done' : ''}`}
                    onClick={() => markComplete(mod.id, section.key)}
                  >
                    {done ? '✓ Lido' : 'Marcar como lido'}
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
      <h1>{mod.title}</h1>
      <p className="module-page__desc">{mod.description}</p>

      {isBonus && (
        <div className="module-page__notice">
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
        {filteredAds.map(ad => (
          <AdCard
            key={ad.id}
            ad={ad}
            isFavorite={isFavorite(ad.id)}
            onToggleFavorite={toggleFavorite}
          />
        ))}
      </div>

      {filteredAds.length === 0 && (
        <p className="module-page__empty">
          Nenhum anúncio encontrado com esses filtros.
        </p>
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
