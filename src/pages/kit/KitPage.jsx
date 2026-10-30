import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import CopyButton from '../../components/ui/CopyButton'
import { getCollectionStyle } from '../../lib/catalog'
import { COMO_USAR, QUAL_USAR, FICHA, PROMPT_CLASSIFICAR, ESTRUTURAS } from '../../lib/kitEstruturas'
import './KitPage.css'

const MOMENT_LABELS = { topo: 'Topo de funil', meio: 'Meio de funil', fundo: 'Fundo de funil' }
const MOMENT_COLORS = { topo: 'topo', meio: 'meio', fundo: 'fundo' }

export default function KitPage() {
  const { profile } = useAuth()
  const [ganchos, setGanchos] = useState([])
  const [narrativas, setNarrativas] = useState([])
  const [angulos, setAngulos] = useState([])
  const [loading, setLoading] = useState(true)
  const [atual, setAtual] = useState(ESTRUTURAS[0].slug) // estrutura aberta
  const [promptAberto, setPromptAberto] = useState(false)

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
    return <Navigate to="/alunas" replace />
  }

  if (loading) {
    return <div className="kit-page"><p>Carregando...</p></div>
  }

  const hasSections = ganchos.length > 0 || narrativas.length > 0 || angulos.length > 0
  const estrutura = ESTRUTURAS.find(e => e.slug === atual) || ESTRUTURAS[0]
  const estiloDe = (slug) => getCollectionStyle(slug).gradient
  const showDividerAfterGanchos = ganchos.length > 0 && (narrativas.length > 0 || angulos.length > 0)
  const showDividerAfterNarrativas = narrativas.length > 0 && angulos.length > 0

  return (
    <div className="kit-page">
      <header className="kit-page__header">
        <h1>Kit de Execução</h1>
        <p className="kit-page__desc">
          Você já viu no Acervo o que funciona e por quê. Aqui é o passo seguinte: fazer o seu.
          Uma estrutura e um super prompt para cada tipo de anúncio, mais ganchos, narrativas e ângulos prontos.
        </p>
      </header>

      <div className="kit-page__content">
        {/* ── Como usar ── */}
        <section className="kit-section kit-intro">
          <div className="kit-intro__passos">
            <h2>Como usar</h2>
            <ol>
              {COMO_USAR.map((t, i) => <li key={i}>{t}</li>)}
            </ol>
            <p className="kit-intro__regra">
              Uma regra vale para tudo: a IA escreve, você decide. Se saiu algo que você não falaria, apaga.
              Se saiu uma prova que você não tem, apaga também.
            </p>
          </div>
          <div className="kit-ficha">
            <div className="kit-ficha__head">
              <h3>Ficha do seu negócio</h3>
              <CopyButton text={FICHA} label="Copiar ficha" />
            </div>
            <p className="kit-ficha__desc">Preencha uma vez e guarde. É o que deixa o prompt específico para você.</p>
            <pre className="kit-ficha__texto">{FICHA}</pre>
          </div>
        </section>

        <div className="kit-section__divider" />

        {/* ── Qual estrutura usar ── */}
        <section className="kit-section">
          <h2>Qual estrutura usar</h2>
          <p className="kit-section__lead">A pergunta é sempre a mesma: o que eu quero que a pessoa faça ou sinta ao terminar de ver?</p>
          <div className="kit-qual">
            {QUAL_USAR.map(q => {
              const e = ESTRUTURAS.find(x => x.slug === q.slug)
              return (
                <button
                  type="button"
                  key={q.slug}
                  className={`kit-qual__row ${atual === q.slug ? 'kit-qual__row--on' : ''}`}
                  onClick={() => { setAtual(q.slug); setPromptAberto(false); document.getElementById('kit-estrutura')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}
                >
                  <span className="kit-qual__quer">Se você quer que ela <strong>{q.quer}</strong></span>
                  <span className="kit-qual__nome" style={{ background: estiloDe(q.slug) }}>{e.title}</span>
                  <span className="kit-qual__momento">{q.momento}</span>
                </button>
              )
            })}
          </div>
          <p className="kit-section__nota">Um anúncio pode cumprir duas funções. Um anúncio que tenta cumprir as cinco não cumpre nenhuma.</p>
        </section>

        <div className="kit-section__divider" />

        {/* ── As 5 estruturas ── */}
        <section className="kit-section" id="kit-estrutura">
          <h2>As 5 estruturas de anúncio</h2>
          <div className="kit-tabs" role="tablist">
            {ESTRUTURAS.map((e, i) => (
              <button
                type="button"
                key={e.slug}
                role="tab"
                aria-selected={atual === e.slug}
                className={`kit-tab ${atual === e.slug ? 'kit-tab--on' : ''}`}
                style={atual === e.slug ? { background: estiloDe(e.slug) } : undefined}
                onClick={() => { setAtual(e.slug); setPromptAberto(false) }}
              >
                <span className="kit-tab__num">{String(i + 1).padStart(2, '0')}</span>
                {e.title}
              </button>
            ))}
          </div>

          <article className="kit-est" key={estrutura.slug}>
            <header className="kit-est__head" style={{ background: estiloDe(estrutura.slug) }}>
              <span className="kit-est__kicker">{estrutura.subtitle}</span>
              <h3>{estrutura.title}</h3>
              <p>{estrutura.funcao}</p>
            </header>

            <div className="kit-est__body">
              <div className="kit-est__duas">
                <div className="kit-est__bloco">
                  <h4>O que a pessoa faz no fim</h4>
                  <p>{estrutura.faz}</p>
                </div>
                <div className="kit-est__bloco">
                  <h4>Quando usar</h4>
                  <p>{estrutura.quando}</p>
                </div>
              </div>

              <h4 className="kit-est__titulo">A estrutura em vídeo</h4>
              <ol className="kit-passos">
                {estrutura.video.map((v, i) => (
                  <li key={i} className="kit-passo">
                    <span className="kit-passo__tempo">{v.tempo}</span>
                    <div>
                      <strong>{v.titulo}</strong>
                      <p>{v.texto}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="kit-est__duas">
                <div className="kit-est__bloco">
                  <h4>Estático ou carrossel</h4>
                  <ul>
                    {estrutura.estatico.map((t, i) => <li key={i}>{t}</li>)}
                  </ul>
                </div>
                <div className="kit-est__bloco">
                  <h4>Formatos que cabem aqui</h4>
                  <p>{estrutura.formatos}</p>
                </div>
              </div>

              <div className="kit-check">
                <h4>Antes de publicar</h4>
                <ul>
                  {estrutura.checklist.map((t, i) => <li key={i}>{t}</li>)}
                </ul>
              </div>

              <div className={`kit-prompt ${promptAberto ? 'kit-prompt--aberto' : ''}`}>
                <div className="kit-prompt__head">
                  <div>
                    <h4>Super prompt: {estrutura.title}</h4>
                    <p>Cole a ficha, cole o prompt e responda ao que ele pedir.</p>
                  </div>
                  <div className="kit-prompt__acoes">
                    <button type="button" className="kit-prompt__toggle" onClick={() => setPromptAberto(v => !v)}>
                      {promptAberto ? 'Esconder' : 'Ver o prompt'}
                    </button>
                    <CopyButton text={estrutura.prompt} label="Copiar prompt" />
                  </div>
                </div>
                {promptAberto && <pre className="kit-prompt__texto">{estrutura.prompt}</pre>}
              </div>
            </div>
          </article>
        </section>

        <div className="kit-section__divider" />

        {/* ── Prompt extra ── */}
        <section className="kit-section">
          <h2>Em qual coleção cai o meu anúncio?</h2>
          <p className="kit-section__lead">
            Para quando você já tem um anúncio pronto (seu ou que viu por aí) e quer saber o que ele é, o que falta e como melhorar.
          </p>
          <div className="kit-prompt kit-prompt--aberto">
            <div className="kit-prompt__head">
              <div>
                <h4>Prompt de classificação e revisão</h4>
                <p>Cole o prompt e, no fim, o roteiro, a transcrição ou a descrição das telas.</p>
              </div>
              <div className="kit-prompt__acoes">
                <CopyButton text={PROMPT_CLASSIFICAR} label="Copiar prompt" />
              </div>
            </div>
            <pre className="kit-prompt__texto">{PROMPT_CLASSIFICAR}</pre>
          </div>
        </section>

        {hasSections && <div className="kit-section__divider" />}
        {hasSections && (
          <h2 className="kit-pecas__titulo">Peças avulsas: ganchos, narrativas e ângulos</h2>
        )}

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

      </div>
    </div>
  )
}
