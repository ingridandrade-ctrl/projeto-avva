// Importação em lote de anúncios: lê o texto que a skill de análise gera
// (um bloco por anúncio, separados por "---") e devolve linhas prontas para
// conferir e cadastrar. Tolerante a maiúsculas, acentos e negrito de markdown.

import { OBJECTIVES, NICHES, MEDIA_TYPES } from './catalog'
import { driveId } from './drive'

export const FORMATO_EXEMPLO = `Título: Depoimento que vendeu mais que o anúncio bonito
Coleção: Melhores de Novembro 2026
Objetivos: provar-que-funciona, vender-agora
Nicho: infoproduto
Mídia: video
Drive: https://drive.google.com/file/d/ID_DO_ARQUIVO/view
Análise:
Primeiro parágrafo da análise.

Segundo parágrafo da análise.
---
Título: Próximo anúncio
...`

const norm = (s = '') => s
  .toString()
  .normalize('NFD')
  .replace(/[̀-ͯ]/g, '')
  .toLowerCase()
  .replace(/[*_`"“”']/g, '')
  .replace(/\s+/g, ' ')
  .trim()

const LABELS = {
  title: ['titulo', 'title', 'nome'],
  collection: ['colecao de origem', 'colecao', 'colecao do mes', 'origem'],
  objectives: ['objetivos', 'objetivo', 'colecoes por objetivo'],
  niches: ['nichos', 'nicho'],
  media: ['midia', 'tipo de midia', 'tipo', 'formato'],
  drive: ['drive', 'link do drive', 'link', 'arquivo', 'url'],
  analysis: ['analise', 'analise completa', 'por que funciona'],
  ignore: ['teste do objetivo', 'teste', 'por que', 'porque'],
}

function labelOf(line) {
  const m = line.match(/^\s*[-*]?\s*\**\s*([^:]{2,40}?)\s*\**\s*:\s*(.*)$/)
  if (!m) return null
  const key = norm(m[1])
  for (const [field, names] of Object.entries(LABELS)) {
    if (names.includes(key)) return { field, rest: m[2].replace(/^\*+|\*+$/g, '').trim() }
  }
  return null
}

function splitList(s) {
  return s.split(/[,;|/]| e /).map(x => x.trim()).filter(Boolean)
}

function matchOption(value, options, extras = {}) {
  const v = norm(value)
  if (!v) return null
  const hit = options.find(o => norm(o.value) === v || norm(o.label) === v)
  if (hit) return hit.value
  for (const [k, slug] of Object.entries(extras)) {
    if (v === k || v.includes(k)) return slug
  }
  const partial = options.find(o => norm(o.label).includes(v) || v.includes(norm(o.label)))
  return partial ? partial.value : null
}

const NICHE_EXTRAS = { 'servico': 'servico', 'prestacao de servico': 'servico', 'local': 'negocio-local', 'negocio local': 'negocio-local', 'e-commerce': 'ecommerce', 'ecommerce': 'ecommerce', 'loja online': 'ecommerce', 'info': 'infoproduto' }
const MEDIA_EXTRAS = { 'video': 'video', 'reels': 'video', 'imagem': 'image', 'estatico': 'image', 'estatica': 'image', 'foto': 'image', 'carrossel': 'carousel', 'carousel': 'carousel', 'pdf': 'pdf', 'pagina': 'pdf', 'landing': 'pdf' }
const OBJ_EXTRAS = { 'descoberta': 'ser-descoberta', 'entende': 'mostrar-que-voce-entende', 'autoridade': 'mostrar-que-voce-entende', 'funciona': 'provar-que-funciona', 'prova': 'provar-que-funciona', 'mas': 'quebrar-o-mas', 'objecao': 'quebrar-o-mas', 'vender': 'vender-agora', 'oferta': 'vender-agora' }

function findCollection(value, collections) {
  const v = norm(value)
  if (!v) return null
  return collections.find(c => norm(c.slug) === v || norm(c.title) === v)
    || collections.find(c => norm(c.title).includes(v) || v.includes(norm(c.title)))
    || null
}

// existingByDrive: Map(id do Drive -> { id, title }) dos anúncios já cadastrados
export function parseImport(text, collections = [], existingByDrive = new Map()) {
  const blocks = (text || '')
    .replace(/\r/g, '')
    .split(/\n\s*(?:-{3,}|={3,}|\*{3,})\s*\n/)
    .map(b => b.trim())
    .filter(Boolean)

  return blocks.map((block, index) => {
    const raw = { title: '', collection: '', objectives: '', niches: '', media: '', drive: '', analysis: [] }
    let current = null
    for (const line of block.split('\n')) {
      const l = labelOf(line)
      if (l) {
        current = l.field
        if (current === 'ignore') { current = null; continue }
        if (current === 'analysis') { if (l.rest) raw.analysis.push(l.rest); continue }
        raw[current] = l.rest
        continue
      }
      if (current === 'analysis') raw.analysis.push(line)
      else if (current && current !== 'ignore' && line.trim() && !raw[current]) raw[current] = line.trim()
    }

    // Linha solta "1. Título" ou primeira linha sem rótulo vira título
    if (!raw.title) {
      const first = block.split('\n')[0].replace(/^\s*\d+[.)]\s*/, '').replace(/^#+\s*/, '').replace(/\*/g, '').trim()
      if (first && !labelOf(first)) raw.title = first
    }

    const col = findCollection(raw.collection, collections)
    const objectives = splitList(raw.objectives).map(o => matchOption(o, OBJECTIVES, OBJ_EXTRAS)).filter(Boolean)
    const niches = [...new Set(splitList(raw.niches).map(n => matchOption(n, NICHES, NICHE_EXTRAS)).filter(Boolean))]
    const media_type = matchOption(raw.media, MEDIA_TYPES, MEDIA_EXTRAS) || (raw.media ? null : 'video')
    const drive_url = (raw.drive.match(/https?:\/\/\S+/) || [raw.drive])[0].trim()
    const analysis = raw.analysis.join('\n').replace(/\n{3,}/g, '\n\n').replace(/^\*+|\*+$/g, '').trim()
    const id = driveId(drive_url)

    const errors = []
    const warnings = []
    if (!raw.title.trim()) errors.push('sem título')
    if (!col) errors.push(raw.collection ? `coleção "${raw.collection}" não encontrada` : 'sem coleção de origem')
    if (!id) errors.push(raw.drive ? 'link do Drive inválido' : 'sem link do Drive')
    if (!analysis) errors.push('sem análise')
    if (!niches.length) errors.push('sem nicho')
    if (!media_type) errors.push(`mídia "${raw.media}" não reconhecida`)
    if (!objectives.length) warnings.push('sem objetivo: só aparece na coleção do mês')
    if (raw.objectives && objectives.length < splitList(raw.objectives).length) warnings.push('algum objetivo não foi reconhecido')
    if (raw.niches && niches.length < splitList(raw.niches).length) warnings.push('algum nicho não foi reconhecido')
    const existing = id ? existingByDrive.get(id) || null : null
    if (raw.title.trim().length > 70) warnings.push('título longo (acima de 70 caracteres)')

    return {
      index,
      title: raw.title.trim(),
      collection_id: col?.id || null,
      collectionLabel: col?.title || raw.collection,
      objectives: [...new Set(objectives)],
      niches,
      media_type,
      drive_url,
      analysis,
      existing,
      errors,
      warnings,
    }
  })
}

export function toRow(item) {
  return {
    title: item.title,
    collection_id: item.collection_id,
    objectives: item.objectives,
    niches: item.niches,
    media_type: item.media_type,
    drive_url: item.drive_url,
    analysis: item.analysis,
    active: true,
  }
}
