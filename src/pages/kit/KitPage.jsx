import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import CopyButton from '../../components/ui/CopyButton'
import './KitPage.css'

const MOMENT_LABELS = { topo: 'Topo de funil', meio: 'Meio de funil', fundo: 'Fundo de funil' }
const MOMENT_COLORS = { topo: 'topo', meio: 'meio', fundo: 'fundo' }

export default function KitPage() {
  const { profile } = useAuth()
  const [ganchos, setGanchos] = useState([])
  const [narrativas, setNarrativas] = useState([])
  const [angulos, setAngulos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('kit_items')
        .select('*')
        .eq('active', true)
        .order('created_at')
      const items = data || []
      setGanchos(items.filter(i => i.type === 'gancho'))
      setNarrativas(items.filter(i => i.type === 'narrativa'))
      setAngulos(items.filter(i => i.type === 'angulo'))
      setLoading(false)
    }
    load()
  }, [])

  if (!profile?.has_order_bump) {
    return <Navigate to="/dashboard" replace />
  }

  if (loading) {
    return <div className="kit-page"><p>Carregando...</p></div>
  }

  const hasSections = ganchos.length > 0 || narrativas.length > 0 || angulos.length > 0
  const showDividerAfterGanchos = ganchos.length > 0 && (narrativas.length > 0 || angulos.length > 0)
  const showDividerAfterNarrativas = narrativas.length > 0 && angulos.length > 0

  return (
    <div className="kit-page">
      <header className="kit-page__header">
        <h1>Kit de Execução</h1>
        <p className="kit-page__desc">
          Ganchos prontos, estruturas narrativas e prompts de IA para criar seus anúncios.
        </p>
      </header>

      <div className="kit-page__content">
        {ganchos.length > 0 && (
          <section className="kit-section">
            <h2>Tipos de gancho prontos</h2>
            <div className="gancho-grid">
              {ganchos.map((g, idx) => (
                <div key={g.id} className="gancho-card">
                  <span className="gancho-card__number">{String(idx + 1).padStart(2, '0')}</span>
                  <span className="gancho-card__tipo">{g.title}</span>
                  {g.description && <p className="gancho-card__desc">{g.description}</p>}
                  {g.example && <p className="gancho-card__exemplo">"{g.example}"</p>}
                  {g.example && <CopyButton text={g.example} />}
                  {g.prompt && (
                    <div className="gancho-card__prompt">
                      <p className="mono">{g.prompt}</p>
                      <CopyButton text={g.prompt} label="Copiar prompt" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {showDividerAfterGanchos && <div className="kit-section__divider" />}

        {narrativas.length > 0 && (
          <section className="kit-section">
            <h2>Estruturas narrativas</h2>
            <div className="estrutura-grid">
              {narrativas.map(e => (
                <div key={e.id} className="estrutura-card">
                  <h3>{e.title}</h3>
                  {e.description && <p className="estrutura-card__desc">{e.description}</p>}
                  {e.example && (
                    <div className="estrutura-card__exemplo">
                      <span className="estrutura-card__label">Exemplo:</span>
                      <p>{e.example}</p>
                    </div>
                  )}
                  {e.example && <CopyButton text={e.example} />}
                  {e.prompt && (
                    <div className="estrutura-card__prompt-block">
                      <span className="estrutura-card__label">Prompt de IA:</span>
                      <p className="mono">{e.prompt}</p>
                      <CopyButton text={e.prompt} label="Copiar prompt" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {showDividerAfterNarrativas && <div className="kit-section__divider" />}

        {angulos.length > 0 && (
          <section className="kit-section">
            <h2>Ângulos de copy + Prompts de IA</h2>
            <div className="angulo-grid">
              {angulos.map(a => (
                <div
                  key={a.id}
                  className={`angulo-card ${a.moment ? `angulo-card--${MOMENT_COLORS[a.moment] || 'default'}` : ''}`}
                >
                  <h3>{a.title}{a.moment && ` — ${MOMENT_LABELS[a.moment] || a.moment}`}</h3>
                  {a.description && <p className="angulo-card__desc">{a.description}</p>}
                  {a.phrases && a.phrases.length > 0 && (
                    <div className="angulo-card__phrases">
                      {a.phrases.map((phrase, j) => (
                        <div key={j} className="angulo-card__phrase">
                          <p>{phrase}</p>
                          <CopyButton text={phrase} />
                        </div>
                      ))}
                    </div>
                  )}
                  {a.prompt && (
                    <div className="angulo-card__prompt">
                      <p className="mono">{a.prompt}</p>
                      <CopyButton text={a.prompt} label="Copiar prompt" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {!hasSections && (
          <p className="kit-page__empty">Conteúdo em breve.</p>
        )}
      </div>
    </div>
  )
}
