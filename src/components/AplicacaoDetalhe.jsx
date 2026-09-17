import { useState, useEffect } from 'react'
import './AplicacaoDetalhe.css'

const PERFIL = [
  ['nicho', 'Nicho / área de atuação'],
  ['tempo_atuacao', 'Tempo de atuação'],
  ['faturamento_atual', 'Faturamento médio mensal'],
  ['objetivo_faturamento', 'Objetivo em 6 meses'],
  ['preco_produto_principal', 'Preço do produto principal'],
  ['tem_equipe', 'Equipe'],
  ['experiencia_mentoria', 'Já fez mentoria?'],
  ['como_chegou', 'Como chegou até aqui'],
  ['momento_atual', 'Momento atual'],
]

const ABERTAS = [
  ['o_que_trava', 'O que está travando o crescimento hoje'],
  ['rotina_ideal', 'Como seria a rotina se não girasse só em torno do negócio'],
  ['visao_futuro', 'Como imagina o negócio daqui a um ano'],
  ['por_que_eu', 'O que a fez pensar em mim para acompanhá-la'],
]

const instagramHandle = (v) => (v || '')
  .trim()
  .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
  .replace(/^@/, '')
  .replace(/[/?#].*$/, '')

const whatsappHref = (v) => {
  const d = (v || '').replace(/\D/g, '')
  if (d.length < 8) return null
  return `https://wa.me/${d.length <= 11 ? '55' + d : d}`
}

export default function AplicacaoDetalhe({ aplicacao, onBack, onUpdateStatus, onUpdateNotas, onDelete, statusOptions, statusLabels }) {
  const [notas, setNotas] = useState(aplicacao.notas_internas || '')
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)
  const [excluindo, setExcluindo] = useState(false)

  useEffect(() => {
    document.title = `${aplicacao.nome} — Mentoria Avva`
    window.scrollTo({ top: 0 })
  }, [aplicacao.id])

  const salvarNotas = async () => {
    setSalvando(true)
    await onUpdateNotas(aplicacao.id, notas)
    setSalvando(false)
    setSalvo(true)
    setTimeout(() => setSalvo(false), 2000)
  }

  const excluir = async () => {
    const ok = window.confirm(`Excluir a aplicação de ${aplicacao.nome}?\n\nEssa ação não pode ser desfeita.`)
    if (!ok) return
    setExcluindo(true)
    const sucesso = await onDelete(aplicacao.id)
    if (!sucesso) setExcluindo(false)
  }

  const wa = whatsappHref(aplicacao.whatsapp)
  const ig = instagramHandle(aplicacao.instagram)
  const email = (aplicacao.email || '').trim()
  const inicial = (aplicacao.nome || '?').trim().charAt(0).toUpperCase()

  return (
    <div className="detalhe">
      <header className="det-top">
        <div className="det-top__inner">
          <button className="det-back" onClick={onBack} type="button">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
            <span>Aplicações</span>
          </button>
          <div className="det-top__meta">
            <span className={`badge badge--${aplicacao.origem}`}>{aplicacao.origem}</span>
            <span className="det-top__date">{new Date(aplicacao.created_at).toLocaleDateString('pt-BR')}</span>
            <select
              className={`status-select status--${aplicacao.status}`}
              value={aplicacao.status}
              onChange={e => onUpdateStatus(aplicacao.id, e.target.value)}
              aria-label="Status da aplicação"
            >
              {statusOptions.map(s => (
                <option key={s} value={s}>{statusLabels[s]}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <main className="det-main">
        <section className="det-hero">
          <span className="det-hero__avatar">{inicial}</span>
          <div className="det-hero__text">
            <h1 className="det-hero__nome">{aplicacao.nome}</h1>
            <p className="det-hero__sub">{aplicacao.nicho}{aplicacao.tempo_atuacao ? ` · ${aplicacao.tempo_atuacao}` : ''}</p>
          </div>
          <div className="det-contacts">
            {wa && (
              <a className="det-contact" href={wa} target="_blank" rel="noopener noreferrer">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <span>{aplicacao.whatsapp}</span>
              </a>
            )}
            {email && (
              <a className="det-contact" href={`mailto:${email}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                <span>{email}</span>
              </a>
            )}
            {ig && (
              <a className="det-contact" href={`https://instagram.com/${encodeURIComponent(ig)}`} target="_blank" rel="noopener noreferrer">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/></svg>
                <span>@{ig}</span>
              </a>
            )}
          </div>
        </section>

        <div className="det-grid">
          <div className="det-col">
            <h2 className="det-section-title">Perfil</h2>
            <section className="det-card det-perfil">
              {PERFIL.map(([key, label]) => (
                <div className="det-perfil__item" key={key}>
                  <span className="det-perfil__label">{label}</span>
                  <span className="det-perfil__value">{aplicacao[key] || '—'}</span>
                </div>
              ))}
            </section>

            <h2 className="det-section-title">Respostas abertas</h2>
            <div className="det-abertas">
              {ABERTAS.map(([key, label]) => (
                <section className="det-card det-aberta" key={key}>
                  <h3 className="det-aberta__label">{label}</h3>
                  <p className="det-aberta__text">{aplicacao[key] || '—'}</p>
                </section>
              ))}
            </div>
          </div>

          <aside className="det-side">
            <h2 className="det-section-title">Anotações internas</h2>
            <section className="det-card det-notas">
              <textarea
                className="det-notas__textarea"
                value={notas}
                onChange={e => setNotas(e.target.value)}
                placeholder="Impressões, próximos passos, o que chamou atenção..."
                rows={7}
              />
              <div className="det-notas__footer">
                <span className="det-notas__hint">{salvo ? 'Salvo' : 'Só você e a equipe veem isso.'}</span>
                <button className="dash-btn dash-btn--primary" onClick={salvarNotas} disabled={salvando}>
                  {salvando ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </section>

            <section className="det-danger">
              <button className="det-delete" onClick={excluir} disabled={excluindo}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                <span>{excluindo ? 'Excluindo...' : 'Excluir aplicação'}</span>
              </button>
              <p className="det-danger__hint">Remove permanentemente todas as respostas desta candidata.</p>
            </section>
          </aside>
        </div>
      </main>
    </div>
  )
}
