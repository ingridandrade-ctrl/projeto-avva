import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { OBJECTIVE_LABELS, NICHE_LABELS, MEDIA_LABELS } from '../../lib/catalog'
import { driveId } from '../../lib/drive'
import { parseImport, toRow, FORMATO_EXEMPLO } from '../../lib/importAds'
import CopyButton from '../../components/ui/CopyButton'
import './AdminAdImport.css'

// Importar vários anúncios de uma vez: cola o texto gerado pela skill de
// análise (um bloco por anúncio), confere a prévia e cadastra.
export default function AdminAdImport() {
  const navigate = useNavigate()
  const [collections, setCollections] = useState([])
  const [existing, setExisting] = useState(new Map())
  const [atualizar, setAtualizar] = useState(true) // mesmo arquivo do Drive: atualiza em vez de duplicar
  const [text, setText] = useState('')
  const [rows, setRows] = useState(null)
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(null)

  useEffect(() => {
    Promise.resolve().then(async () => {
      const [{ data: cols }, { data: ads }] = await Promise.all([
        supabase.from('collections').select('id, slug, title').order('order'),
        supabase.from('ads').select('id, title, drive_url'),
      ])
      setCollections(cols || [])
      setExisting(new Map((ads || []).map(a => [driveId(a.drive_url), { id: a.id, title: a.title }]).filter(([k]) => k)))
    })
  }, [])

  const ok = useMemo(() => (rows || []).filter(r => !r.errors.length), [rows])
  const bad = useMemo(() => (rows || []).filter(r => r.errors.length), [rows])
  const novos = useMemo(() => ok.filter(r => !r.existing), [ok])
  const repetidos = useMemo(() => ok.filter(r => r.existing), [ok])

  function conferir() {
    setDone(null)
    setRows(parseImport(text, collections, existing))
  }

  async function cadastrar() {
    if (!ok.length) return
    setSaving(true)
    let inseridos = 0
    let atualizados = 0
    if (novos.length) {
      const { data, error } = await supabase.from('ads').insert(novos.map(toRow)).select('id')
      if (error) { setSaving(false); setDone({ type: 'error', msg: `Erro ao cadastrar: ${error.message}` }); return }
      inseridos = data.length
    }
    if (atualizar) {
      for (const r of repetidos) {
        const { active, ...campos } = toRow(r) // eslint-disable-line no-unused-vars
        const { error } = await supabase.from('ads').update(campos).eq('id', r.existing.id)
        if (error) { setSaving(false); setDone({ type: 'error', msg: `Erro ao atualizar "${r.title}": ${error.message}` }); return }
        atualizados++
      }
    }
    setSaving(false)
    const partes = []
    if (inseridos) partes.push(`${inseridos} novo${inseridos === 1 ? '' : 's'}`)
    if (atualizados) partes.push(`${atualizados} atualizado${atualizados === 1 ? '' : 's'}`)
    if (!atualizar && repetidos.length) partes.push(`${repetidos.length} já cadastrado${repetidos.length === 1 ? '' : 's'} (ignorado${repetidos.length === 1 ? '' : 's'})`)
    setDone({ type: 'success', msg: `Pronto: ${partes.join(', ')}.` })
    setRows(null)
    setText('')
  }

  const totalAcao = novos.length + (atualizar ? repetidos.length : 0)

  return (
    <div className="adm-import">
      <Link to="/admin/produtos/acervo/anuncios" className="admin-ad-form__back">← Voltar para anúncios</Link>

      <div className="adm-page-header">
        <div>
          <span className="adm-eyebrow">Acervo de Anúncios</span>
          <h1>Importar anúncios</h1>
          <p>Cole o texto gerado pela skill de análise, um bloco por anúncio separado por <code>---</code>. Confira a prévia e cadastre tudo de uma vez.</p>
        </div>
        <div className="adm-page-header__actions">
          <CopyButton text={FORMATO_EXEMPLO} label="Copiar formato" />
        </div>
      </div>

      {done && <div className={`adm-import__feedback adm-import__feedback--${done.type}`}>{done.msg} {done.type === 'success' && <button type="button" className="adm-btn adm-btn--ghost" onClick={() => navigate('/admin/produtos/acervo/anuncios')}>Ver anúncios</button>}</div>}

      <div className="adm-card adm-import__entrada">
        <label htmlFor="imp-text" className="adm-import__label">Texto para importar</label>
        <textarea
          id="imp-text"
          className="adm-input adm-import__textarea"
          value={text}
          onChange={e => { setText(e.target.value); setRows(null) }}
          placeholder={FORMATO_EXEMPLO}
          spellCheck={false}
        />
        <div className="adm-import__acoes">
          <span className="adm-import__dica">Coleção pode ser o nome ("Melhores de Novembro 2026") ou o identificador. Objetivos, nicho e mídia aceitam o nome ou o valor interno.</span>
          <button type="button" className="adm-btn adm-btn--secondary" onClick={conferir} disabled={!text.trim() || !collections.length}>Conferir</button>
        </div>
      </div>

      {rows && (
        <div className="adm-card adm-import__previa">
          <div className="adm-import__resumo">
            <strong>{rows.length} bloco{rows.length === 1 ? '' : 's'} encontrado{rows.length === 1 ? '' : 's'}</strong>
            <span className="adm-import__ok">{novos.length} novo{novos.length === 1 ? '' : 's'}</span>
            {repetidos.length > 0 && <span className="adm-import__rep">{repetidos.length} já cadastrado{repetidos.length === 1 ? '' : 's'}</span>}
            {bad.length > 0 && <span className="adm-import__bad">{bad.length} com problema</span>}
            <button type="button" className="adm-btn adm-btn--primary" onClick={cadastrar} disabled={saving || !totalAcao}>
              {saving ? 'Salvando…' : `Salvar ${totalAcao} anúncio${totalAcao === 1 ? '' : 's'}`}
            </button>
          </div>
          {repetidos.length > 0 && (
            <label className="adm-import__opcao">
              <input type="checkbox" checked={atualizar} onChange={e => setAtualizar(e.target.checked)} />
              Atualizar os já cadastrados com o texto novo (título, coleção, objetivos, nicho, mídia e análise). Desmarcado, eles ficam como estão.
            </label>
          )}
          {bad.length > 0 && <p className="adm-import__aviso">Os blocos com problema ficam de fora. Corrija no texto e clique em Conferir de novo.</p>}

          <div className="adm-import__lista">
            {rows.map(r => (
              <article key={r.index} className={`adm-import__item ${r.errors.length ? 'adm-import__item--erro' : ''} ${r.existing && !r.errors.length ? 'adm-import__item--rep' : ''}`}>
                <div className="adm-import__item-head">
                  <span className="adm-import__num">{String(r.index + 1).padStart(2, '0')}</span>
                  <div className="adm-import__item-titulo">
                    <strong>{r.title || <em>sem título</em>}</strong>
                    <span>{r.collectionLabel || 'sem coleção'} · {r.media_type ? MEDIA_LABELS[r.media_type] : 'mídia?'}</span>
                  </div>
                  {driveId(r.drive_url) && (
                    <img className="adm-import__capa" src={`https://drive.google.com/thumbnail?id=${driveId(r.drive_url)}&sz=w200`} alt="" loading="lazy" onError={e => { e.currentTarget.style.display = 'none' }} />
                  )}
                </div>
                <div className="adm-import__tags">
                  {r.objectives.map(o => <span key={o} className="adm-import__tag adm-import__tag--obj">{OBJECTIVE_LABELS[o]}</span>)}
                  {r.niches.map(n => <span key={n} className="adm-import__tag">{NICHE_LABELS[n]}</span>)}
                </div>
                {r.analysis && <p className="adm-import__analise">{r.analysis.length > 260 ? r.analysis.slice(0, 260) + '…' : r.analysis}</p>}
                {r.existing && !r.errors.length && (
                  <p className="adm-import__rep-info">
                    {atualizar ? 'Vai atualizar o anúncio já cadastrado' : 'Já cadastrado, vai ficar como está'}: "{r.existing.title}"
                  </p>
                )}
                {r.errors.length > 0 && <p className="adm-import__erros">Problemas: {r.errors.join(' · ')}</p>}
                {r.warnings.length > 0 && <p className="adm-import__avisos">Atenção: {r.warnings.join(' · ')}</p>}
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
