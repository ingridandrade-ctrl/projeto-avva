import { useState } from 'react'
import './AplicacaoDetalhe.css'

const FIELD_LABELS = {
  nome: 'Nome',
  whatsapp: 'WhatsApp',
  email: 'E-mail',
  instagram: 'Instagram',
  nicho: 'Nicho / Área de atuação',
  tempo_atuacao: 'Tempo de atuação',
  faturamento_atual: 'Faturamento atual',
  objetivo_faturamento: 'Objetivo de faturamento',
  preco_produto_principal: 'Preço do produto principal',
  tem_equipe: 'Tem equipe',
  o_que_trava: 'O que trava o crescimento',
  experiencia_mentoria: 'Experiência com mentoria',
  como_chegou: 'Como chegou',
  momento_atual: 'Momento atual',
  visao_futuro: 'Visão de futuro',
  por_que_eu: 'Por que eu',
}

const FIELD_ORDER = Object.keys(FIELD_LABELS)

export default function AplicacaoDetalhe({ aplicacao, onBack, onUpdateStatus, onUpdateNotas, statusOptions, statusLabels }) {
  const [notas, setNotas] = useState(aplicacao.notas_internas || '')
  const [salvando, setSalvando] = useState(false)

  const salvarNotas = async () => {
    setSalvando(true)
    await onUpdateNotas(aplicacao.id, notas)
    setSalvando(false)
  }

  return (
    <div className="detalhe">
      <div className="detalhe__header">
        <button className="detalhe__back" onClick={onBack}>← Voltar</button>
        <div className="detalhe__meta">
          <span className={`badge badge--${aplicacao.origem}`}>{aplicacao.origem}</span>
          <span className="detalhe__data">{new Date(aplicacao.created_at).toLocaleDateString('pt-BR')}</span>
          <select
            className={`status-select status--${aplicacao.status}`}
            value={aplicacao.status}
            onChange={e => onUpdateStatus(aplicacao.id, e.target.value)}
          >
            {statusOptions.map(s => (
              <option key={s} value={s}>{statusLabels[s]}</option>
            ))}
          </select>
        </div>
      </div>

      <h1 className="detalhe__nome">{aplicacao.nome}</h1>

      <div className="detalhe__respostas">
        {FIELD_ORDER.map(key => (
          <div className="detalhe__campo" key={key}>
            <h3 className="detalhe__campo-label">{FIELD_LABELS[key]}</h3>
            <p className="detalhe__campo-valor">{aplicacao[key] || '—'}</p>
          </div>
        ))}
      </div>

      <div className="detalhe__notas">
        <h3 className="detalhe__notas-title">Anotações internas</h3>
        <textarea
          className="detalhe__notas-textarea"
          value={notas}
          onChange={e => setNotas(e.target.value)}
          placeholder="Escreva suas observações sobre esta candidata..."
          rows={4}
        />
        <button className="detalhe__notas-btn" onClick={salvarNotas} disabled={salvando}>
          {salvando ? 'Salvando...' : 'Salvar anotações'}
        </button>
      </div>
    </div>
  )
}
