import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { TIPOS_SUGESTAO as TIPOS } from '../../lib/sugestoes'
import './AdminSugestoes.css'

const LABEL = Object.fromEntries(TIPOS.map(t => [t.value, t.label]))

const quando = (iso) => new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

// Sugestões das alunas (caixinha da área de membros)
export default function AdminSugestoes() {
  const [itens, setItens] = useState([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState(null)
  const [filtro, setFiltro] = useState('novas') // novas | todas
  const [tipo, setTipo] = useState('')

  async function load() {
    const { data, error } = await supabase.from('sugestoes').select('*').order('created_at', { ascending: false })
    if (error) setErro(error.message)
    setItens(data || [])
    setLoading(false)
  }

  useEffect(() => { Promise.resolve().then(load) }, [])

  async function marcar(s, lida) {
    const { error } = await supabase.from('sugestoes').update({ lida }).eq('id', s.id)
    if (!error) setItens(xs => xs.map(x => x.id === s.id ? { ...x, lida } : x))
  }

  async function apagar(s) {
    if (!confirm('Apagar essa sugestão? Não dá pra desfazer.')) return
    const { error } = await supabase.from('sugestoes').delete().eq('id', s.id)
    if (!error) setItens(xs => xs.filter(x => x.id !== s.id))
  }

  const lista = useMemo(() => itens
    .filter(s => filtro === 'todas' || !s.lida)
    .filter(s => !tipo || s.tipo === tipo), [itens, filtro, tipo])

  const novas = itens.filter(s => !s.lida).length

  return (
    <div className="adm-sug">
      <div className="adm-page-header">
        <div>
          <span className="adm-eyebrow">Acervo de Anúncios</span>
          <h1>Sugestões</h1>
          <p>O que as alunas pedem pela caixinha da área de membros. {novas ? `${novas} nova${novas === 1 ? '' : 's'}.` : 'Nada novo por enquanto.'}</p>
        </div>
      </div>

      {erro && (
        <div className="adm-card adm-sug__erro">
          Não consegui ler as sugestões: {erro}. Se a tabela ainda não existe, rode <code>supabase-migration-sugestoes.sql</code> no Supabase.
        </div>
      )}

      <div className="adm-sug__filtros">
        <div className="adm-sug__seg">
          <button type="button" className={filtro === 'novas' ? 'is-on' : ''} onClick={() => setFiltro('novas')}>Novas</button>
          <button type="button" className={filtro === 'todas' ? 'is-on' : ''} onClick={() => setFiltro('todas')}>Todas</button>
        </div>
        <select className="adm-input adm-sug__tipo" value={tipo} onChange={e => setTipo(e.target.value)}>
          <option value="">Todos os tipos</option>
          {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="adm-card"><p className="adm-empty">Carregando…</p></div>
      ) : lista.length === 0 ? (
        <div className="adm-card"><p className="adm-empty">{filtro === 'novas' ? 'Nenhuma sugestão nova.' : 'Nenhuma sugestão ainda.'}</p></div>
      ) : (
        <div className="adm-sug__lista">
          {lista.map(s => (
            <article key={s.id} className={`adm-sug__item ${s.lida ? 'adm-sug__item--lida' : ''}`}>
              <div className="adm-sug__meta">
                <span className={`adm-sug__tag adm-sug__tag--${s.tipo}`}>{LABEL[s.tipo] || s.tipo}</span>
                <span className="adm-sug__quem">{s.name || s.email}{s.name && s.email ? ` · ${s.email}` : ''}</span>
                <span className="adm-sug__quando">{quando(s.created_at)}{s.pagina ? ` · em ${s.pagina}` : ''}</span>
              </div>
              <p className="adm-sug__texto">{s.texto}</p>
              <div className="adm-sug__acoes">
                {s.email && <a className="adm-btn adm-btn--ghost adm-btn--sm" href={`mailto:${s.email}?subject=${encodeURIComponent('Sobre a sua sugestão no Acervo de Anúncios')}`}>Responder por e-mail</a>}
                <button type="button" className="adm-btn adm-btn--secondary adm-btn--sm" onClick={() => marcar(s, !s.lida)}>{s.lida ? 'Marcar como nova' : 'Marcar como lida'}</button>
                <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm adm-sug__apagar" onClick={() => apagar(s)}>Apagar</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
