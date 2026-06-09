import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
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
  const [autenticada, setAutenticada] = useState(false)
  const [senha, setSenha] = useState('')
  const [senhaErro, setSenhaErro] = useState(false)
  const [aplicacoes, setAplicacoes] = useState([])
  const [loading, setLoading] = useState(false)
  const [selecionada, setSelecionada] = useState(null)
  const [filtroOrigem, setFiltroOrigem] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('')
  const [filtroFaturamento, setFiltroFaturamento] = useState('')

  const dashPassword = import.meta.env.VITE_DASHBOARD_PASSWORD || 'avva2024'

  const handleLogin = (e) => {
    e.preventDefault()
    if (senha === dashPassword) {
      setAutenticada(true)
      setSenhaErro(false)
    } else {
      setSenhaErro(true)
    }
  }

  useEffect(() => {
    if (!autenticada) return
    fetchAplicacoes()
  }, [autenticada])

  const fetchAplicacoes = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('aplicacoes')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) setAplicacoes(data || [])
    setLoading(false)
  }

  const updateStatus = async (id, status) => {
    await supabase.from('aplicacoes').update({ status }).eq('id', id)
    setAplicacoes(prev => prev.map(a => a.id === id ? { ...a, status } : a))
    if (selecionada?.id === id) setSelecionada(prev => ({ ...prev, status }))
  }

  const updateNotas = async (id, notas_internas) => {
    await supabase.from('aplicacoes').update({ notas_internas }).eq('id', id)
    setAplicacoes(prev => prev.map(a => a.id === id ? { ...a, notas_internas } : a))
  }

  const exportCSV = () => {
    const headers = [
      'Nome', 'WhatsApp', 'Email', 'Instagram', 'Nicho', 'Tempo de Atuação',
      'Faturamento Atual', 'Objetivo Faturamento', 'Preço Produto', 'Tem Equipe',
      'O que trava', 'Experiência Mentoria', 'Como chegou', 'Momento Atual',
      'Visão Futuro', 'Por que eu', 'Origem', 'Status', 'Data', 'Notas'
    ]
    const rows = filtered.map(a => [
      a.nome, a.whatsapp, a.email, a.instagram, a.nicho, a.tempo_atuacao,
      a.faturamento_atual, a.objetivo_faturamento, a.preco_produto_principal,
      a.tem_equipe, a.o_que_trava, a.experiencia_mentoria, a.como_chegou,
      a.momento_atual, a.visao_futuro, a.por_que_eu, a.origem, a.status,
      new Date(a.created_at).toLocaleDateString('pt-BR'), a.notas_internas || ''
    ])

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
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

  if (!autenticada) {
    return (
      <div className="dash-login">
        <form className="dash-login__form" onSubmit={handleLogin}>
          <h1 className="dash-login__title">Dashboard Avva</h1>
          <input
            type="password"
            className="dash-login__input"
            placeholder="Senha de acesso"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            autoFocus
          />
          {senhaErro && <p className="dash-login__erro">Senha incorreta</p>}
          <button type="submit" className="dash-login__btn">Entrar</button>
        </form>
      </div>
    )
  }

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
        <button className="dash-header__export" onClick={exportCSV}>Exportar CSV</button>
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
          <option value="até R$1.000">até R$1.000</option>
          <option value="entre R$2.000 e R$4.000">R$2k–4k</option>
          <option value="entre R$5.000 e R$8.000">R$5k–8k</option>
          <option value="entre R$10.000 e R$17.000">R$10k–17k</option>
          <option value="entre R$17.000 e R$30.000">R$17k–30k</option>
          <option value="mais de R$30.000">+R$30k</option>
        </select>
        <button className="dash-filters__refresh" onClick={fetchAplicacoes}>↻ Atualizar</button>
      </div>

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
