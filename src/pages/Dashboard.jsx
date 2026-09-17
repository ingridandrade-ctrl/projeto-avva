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

export default function Dashboard() {
  const { profile, signOut } = useAuth()
  const [aplicacoes, setAplicacoes] = useState([])
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState(null)
  const [selecionada, setSelecionada] = useState(null)
  const [filtroOrigem, setFiltroOrigem] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('')
  const [filtroFaturamento, setFiltroFaturamento] = useState('')

  useEffect(() => {
    document.title = 'Mentoria Avva — Aplicações'
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
      new Date(a.created_at).toLocaleDateString('pt-BR'), a.notas_internas || ''
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

  const filtered = aplicacoes.filter(a => {
    if (filtroOrigem && a.origem !== filtroOrigem) return false
    if (filtroStatus && a.status !== filtroStatus) return false
    if (filtroFaturamento && a.faturamento_atual !== filtroFaturamento) return false
    return true
  })

  const countByOrigem = (origem) => aplicacoes.filter(a => a.origem === origem).length
  const countByStatus = (status) => aplicacoes.filter(a => a.status === status).length

  if (selecionada) {
    return (
      <AplicacaoDetalhe
        aplicacao={selecionada}
        onBack={() => setSelecionada(null)}
        onUpdateStatus={updateStatus}
        onUpdateNotas={updateNotas}
        statusOptions={STATUS_OPTIONS}
        statusLabels={STATUS_LABELS}
      />
    )
  }

  return (
    <div className="dashboard">
      <header className="dash-header">
        <h1 className="dash-header__title">Dashboard Avva</h1>
        <div className="dash-header__actions">
          {profile?.email && <span className="dash-header__user">{profile.email}</span>}
          <button className="dash-header__export" onClick={exportCSV}>Exportar CSV</button>
          <button className="dash-header__logout" onClick={signOut}>Sair</button>
        </div>
      </header>

      <div className="dash-stats">
        <div className="stat-card">
          <span className="stat-card__num">{aplicacoes.length}</span>
          <span className="stat-card__label">Total</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__num">{countByOrigem('flora')}</span>
          <span className="stat-card__label">Flora</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__num">{countByOrigem('ingrid')}</span>
          <span className="stat-card__label">Ingrid</span>
        </div>
        {STATUS_OPTIONS.map(s => (
          <div className="stat-card" key={s}>
            <span className="stat-card__num">{countByStatus(s)}</span>
            <span className="stat-card__label">{STATUS_LABELS[s]}</span>
          </div>
        ))}
      </div>

      <div className="dash-filters">
        <select value={filtroOrigem} onChange={e => setFiltroOrigem(e.target.value)}>
          <option value="">Todas as origens</option>
          <option value="flora">Flora</option>
          <option value="ingrid">Ingrid</option>
        </select>
        <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}>
          <option value="">Todos os status</option>
          {STATUS_OPTIONS.map(s => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
        <select value={filtroFaturamento} onChange={e => setFiltroFaturamento(e.target.value)}>
          <option value="">Todos os faturamentos</option>
          {FAIXAS_FATURAMENTO.map(f => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
        <button className="dash-filters__refresh" onClick={fetchAplicacoes}>↻ Atualizar</button>
      </div>

      {erro && <p className="dash-erro" style={{ color: '#e74c3c', padding: '1rem' }}>{erro}</p>}

      {loading ? (
        <p className="dash-loading">Carregando...</p>
      ) : filtered.length === 0 ? (
        <p className="dash-empty">Nenhuma aplicação encontrada.</p>
      ) : (
        <div className="dash-table-wrapper">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>WhatsApp</th>
                <th>Instagram</th>
                <th>Faturamento</th>
                <th>Origem</th>
                <th>Data</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a.id} onClick={() => setSelecionada(a)} className="dash-table__row">
                  <td>{a.nome}</td>
                  <td>{a.whatsapp}</td>
                  <td>{a.instagram}</td>
                  <td>{a.faturamento_atual}</td>
                  <td>
                    <span className={`badge badge--${a.origem}`}>{a.origem}</span>
                  </td>
                  <td>{new Date(a.created_at).toLocaleDateString('pt-BR')}</td>
                  <td>
                    <select
                      className={`status-select status--${a.status}`}
                      value={a.status}
                      onClick={e => e.stopPropagation()}
                      onChange={e => updateStatus(a.id, e.target.value)}
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
      )}
    </div>
  )
}
