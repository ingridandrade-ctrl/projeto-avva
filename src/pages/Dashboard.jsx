import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { FAIXAS_FATURAMENTO } from '../lib/faixas'
import AplicacaoDetalhe from '../components/AplicacaoDetalhe'
import './Dashboard.css'

const STATUS_OPTIONS = ['nova', 'lida', 'em_analise', 'aprovada', 'recusada']
const STATUS_LABELS = {
  nova: 'Nova',
  lida: 'Lida',
  em_analise: 'Em análise',
  aprovada: 'Aprovada',
  recusada: 'Recusada',
}

const formatData = (iso) => new Date(iso).toLocaleDateString('pt-BR')

export default function Dashboard() {
  const { profile, signOut } = useAuth()
  const [aplicacoes, setAplicacoes] = useState([])
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState(null)
  const [selecionada, setSelecionada] = useState(null)
  const [busca, setBusca] = useState('')
  const [filtroOrigem, setFiltroOrigem] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('')
  const [filtroFaturamento, setFiltroFaturamento] = useState('')

  useEffect(() => {
    document.title = 'Dashboard de Aplicações — Mentoria Avva'
    fetchAplicacoes()
  }, [])

  const fetchAplicacoes = async () => {
    setLoading(true)
    setErro(null)
    const { data, error } = await supabase
      .from('aplicacoes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setErro('Erro ao carregar aplicações: ' + error.message)
    } else {
      setAplicacoes(data || [])
    }
    setLoading(false)
  }

  const updateStatus = async (id, status) => {
    const prevAplicacoes = aplicacoes
    const prevSelecionada = selecionada
    setAplicacoes(prev => prev.map(a => a.id === id ? { ...a, status } : a))
    if (selecionada?.id === id) setSelecionada(prev => ({ ...prev, status }))

    const { error } = await supabase.from('aplicacoes').update({ status }).eq('id', id)
    if (error) {
      alert('Erro ao atualizar status: ' + error.message)
      setAplicacoes(prevAplicacoes)
      if (prevSelecionada?.id === id) setSelecionada(prevSelecionada)
    }
  }

  const updateNotas = async (id, notas_internas) => {
    const { error } = await supabase.from('aplicacoes').update({ notas_internas }).eq('id', id)
    if (error) {
      alert('Erro ao salvar notas: ' + error.message)
      return
    }
    setAplicacoes(prev => prev.map(a => a.id === id ? { ...a, notas_internas } : a))
  }

  const deleteAplicacao = async (id) => {
    const { error } = await supabase.from('aplicacoes').delete().eq('id', id)
    if (error) {
      alert('Erro ao excluir: ' + error.message)
      return false
    }
    setAplicacoes(prev => prev.filter(a => a.id !== id))
    setSelecionada(null)
    return true
  }

  const exportCSV = () => {
    const headers = [
      'Nome', 'WhatsApp', 'Email', 'Instagram', 'Nicho', 'Tempo de Atuação',
      'Faturamento Atual', 'Objetivo Faturamento', 'Preço Produto', 'Tem Equipe',
      'O que trava', 'Experiência Mentoria', 'Como chegou', 'Momento Atual',
      'Rotina Ideal', 'Visão Futuro', 'Por que eu', 'Origem', 'Status', 'Data', 'Notas'
    ]
    const rows = filtered.map(a => [
      a.nome, a.whatsapp, a.email, a.instagram, a.nicho, a.tempo_atuacao,
      a.faturamento_atual, a.objetivo_faturamento, a.preco_produto_principal,
      a.tem_equipe, a.o_que_trava, a.experiencia_mentoria, a.como_chegou,
      a.momento_atual, a.rotina_ideal || '', a.visao_futuro, a.por_que_eu, a.origem, a.status,
      formatData(a.created_at), a.notas_internas || ''
    ])

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => {
        let val = String(cell)
        if (/^[=+\-@\t\r]/.test(val)) val = "'" + val
        return `"${val.replace(/"/g, '""')}"`
      }).join(','))
      .join('\n')

    const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `aplicacoes-avva-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const termo = busca.trim().toLowerCase()
  const filtered = aplicacoes.filter(a => {
    if (filtroOrigem && a.origem !== filtroOrigem) return false
    if (filtroStatus && a.status !== filtroStatus) return false
    if (filtroFaturamento && a.faturamento_atual !== filtroFaturamento) return false
    if (termo) {
      const alvo = `${a.nome} ${a.email} ${a.instagram} ${a.nicho}`.toLowerCase()
      if (!alvo.includes(termo)) return false
    }
    return true
  })

  const countByOrigem = (origem) => aplicacoes.filter(a => a.origem === origem).length
  const countByStatus = (status) => aplicacoes.filter(a => a.status === status).length
  const temFiltro = busca || filtroOrigem || filtroStatus || filtroFaturamento

  const limparFiltros = () => {
    setBusca('')
    setFiltroOrigem('')
    setFiltroStatus('')
    setFiltroFaturamento('')
  }

  if (selecionada) {
    return (
      <AplicacaoDetalhe
        aplicacao={selecionada}
        onBack={() => setSelecionada(null)}
        onUpdateStatus={updateStatus}
        onUpdateNotas={updateNotas}
        onDelete={deleteAplicacao}
        statusOptions={STATUS_OPTIONS}
        statusLabels={STATUS_LABELS}
      />
    )
  }

  return (
    <div className="dashboard">
      <header className="dash-top">
        <div className="dash-top__inner">
          <div className="dash-top__brand">
            <span className="dash-top__eyebrow">Mentoria Avva</span>
            <h1 className="dash-top__title">Dashboard de Aplicações</h1>
          </div>
          <div className="dash-top__actions">
            {profile?.email && <span className="dash-top__user">{profile.email}</span>}
            <button className="dash-btn dash-btn--secondary" onClick={exportCSV} disabled={filtered.length === 0}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              <span>Exportar CSV</span>
            </button>
            <button className="dash-btn dash-btn--ghost" onClick={signOut}>Sair</button>
          </div>
        </div>
      </header>

      <main className="dash-main">
        <section className="dash-stats">
          <div className="stat stat--primary">
            <span className="stat__label">Total de aplicações</span>
            <span className="stat__num">{aplicacoes.length}</span>
            <span className="stat__sub">{countByStatus('nova')} {countByStatus('nova') === 1 ? 'nova' : 'novas'} para ler</span>
          </div>
          <div className="stat">
            <span className="stat__label">Via Flora</span>
            <span className="stat__num">{countByOrigem('flora')}</span>
          </div>
          <div className="stat">
            <span className="stat__label">Via Ingrid</span>
            <span className="stat__num">{countByOrigem('ingrid')}</span>
          </div>
          <div className="stat">
            <span className="stat__label">Aprovadas</span>
            <span className="stat__num stat__num--ok">{countByStatus('aprovada')}</span>
          </div>
        </section>

        <section className="dash-toolbar">
          <div className="dash-search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              type="search"
              placeholder="Buscar por nome, e-mail, Instagram ou nicho"
              value={busca}
              onChange={e => setBusca(e.target.value)}
              aria-label="Buscar aplicações"
            />
          </div>

          <div className="dash-selects">
            <select value={filtroOrigem} onChange={e => setFiltroOrigem(e.target.value)} aria-label="Filtrar por origem">
              <option value="">Todas as origens</option>
              <option value="flora">Flora</option>
              <option value="ingrid">Ingrid</option>
            </select>
            <select value={filtroFaturamento} onChange={e => setFiltroFaturamento(e.target.value)} aria-label="Filtrar por faturamento">
              <option value="">Todos os faturamentos</option>
              {FAIXAS_FATURAMENTO.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
            <button className="dash-btn dash-btn--ghost dash-btn--icon" onClick={fetchAplicacoes} title="Atualizar" aria-label="Atualizar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
            </button>
          </div>
        </section>

        <section className="dash-chips" aria-label="Filtrar por status">
          <button className={`chip ${!filtroStatus ? 'chip--on' : ''}`} onClick={() => setFiltroStatus('')}>
            Todas <span className="chip__n">{aplicacoes.length}</span>
          </button>
          {STATUS_OPTIONS.map(s => (
            <button
              key={s}
              className={`chip chip--${s} ${filtroStatus === s ? 'chip--on' : ''}`}
              onClick={() => setFiltroStatus(filtroStatus === s ? '' : s)}
            >
              {STATUS_LABELS[s]} <span className="chip__n">{countByStatus(s)}</span>
            </button>
          ))}
        </section>

        {erro && <p className="dash-erro" role="alert">{erro}</p>}

        {loading ? (
          <div className="dash-skeleton" aria-busy="true">
            <div /><div /><div /><div />
          </div>
        ) : filtered.length === 0 ? (
          <div className="dash-empty">
            <div className="dash-empty__icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h7"/><path d="M3 9h18"/><path d="M16 19l2 2 4-4"/></svg>
            </div>
            <h2 className="dash-empty__title">{temFiltro ? 'Nada encontrado com esses filtros' : 'Nenhuma aplicação ainda'}</h2>
            <p className="dash-empty__text">
              {temFiltro ? 'Tente ajustar a busca ou limpar os filtros.' : 'Quando alguém preencher o formulário, a aplicação aparece aqui.'}
            </p>
            {temFiltro && <button className="dash-btn dash-btn--secondary" onClick={limparFiltros}>Limpar filtros</button>}
          </div>
        ) : (
          <section className="dash-list">
            <div className="dash-list__meta">
              <span>{filtered.length} {filtered.length === 1 ? 'aplicação' : 'aplicações'}</span>
              {temFiltro && <button className="dash-link" onClick={limparFiltros}>Limpar filtros</button>}
            </div>
            <div className="dash-table-wrapper">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Candidata</th>
                    <th>Contato</th>
                    <th>Faturamento</th>
                    <th>Origem</th>
                    <th>Data</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(a => (
                    <tr key={a.id} onClick={() => setSelecionada(a)} className="dash-table__row">
                      <td data-label="Candidata">
                        <div className="cell-person">
                          <span className="cell-person__avatar">{(a.nome || '?').trim().charAt(0).toUpperCase()}</span>
                          <div className="cell-person__text">
                            <span className="cell-person__name">{a.nome}</span>
                            <span className="cell-person__meta">{a.nicho}</span>
                          </div>
                        </div>
                      </td>
                      <td data-label="Contato">
                        <div className="cell-contact">
                          <span>{a.whatsapp}</span>
                          <span className="cell-contact__sub">{a.instagram}</span>
                        </div>
                      </td>
                      <td data-label="Faturamento">{a.faturamento_atual}</td>
                      <td data-label="Origem">
                        <span className={`badge badge--${a.origem}`}>{a.origem}</span>
                      </td>
                      <td data-label="Data" className="cell-date">{formatData(a.created_at)}</td>
                      <td data-label="Status">
                        <select
                          className={`status-select status--${a.status}`}
                          value={a.status}
                          onClick={e => e.stopPropagation()}
                          onChange={e => updateStatus(a.id, e.target.value)}
                          aria-label={`Status de ${a.nome}`}
                        >
                          {STATUS_OPTIONS.map(s => (
                            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
