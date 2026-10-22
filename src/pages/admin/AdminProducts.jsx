import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import './AdminProducts.css'

export default function AdminProducts() {
  const [adsCount, setAdsCount] = useState(null)
  const [kitCount, setKitCount] = useState(null)

  useEffect(() => {
    async function load() {
      const [{ count: ads }, { count: kit }] = await Promise.all([
        supabase.from('ads').select('id', { count: 'exact', head: true }),
        supabase.from('kit_items').select('id', { count: 'exact', head: true }),
      ])
      setAdsCount(ads || 0)
      setKitCount(kit || 0)
    }
    load()
  }, [])

  const products = [
    {
      id: 'acervo-anuncios',
      title: 'Acervo de Anúncios',
      type: 'Produto principal',
      description: 'Anúncios organizados nas 6 Coleções por objetivo, com tags de nicho e tipo de mídia.',
      count: adsCount,
      countLabel: 'anúncios',
      link: '/admin/ads',
      action: 'Gerenciar anúncios',
      secondary: { link: '/admin/colecoes', label: 'Coleções e capas' },
      gradient: 'linear-gradient(135deg, #1A6868 0%, #3F7A66 40%, #C98A5E 100%)',
    },
    {
      id: 'kit-execucao',
      title: 'Kit de Execução',
      type: 'Order bump',
      description: 'Ganchos prontos, estruturas narrativas e ângulos com prompts de IA.',
      count: kitCount,
      countLabel: 'itens',
      link: '/admin/kit',
      action: 'Gerenciar kit',
      gradient: 'linear-gradient(135deg, #A85C35 0%, #C98A5E 55%, #D4B99A 100%)',
    },
  ]

  return (
    <div className="admin-products">
      <div className="adm-page-header">
        <div>
          <span className="adm-eyebrow">Produtos</span>
          <h1>Todos os produtos</h1>
          <p>Cada produto da área de membros e o conteúdo que as alunas veem.</p>
        </div>
      </div>

      <div className="admin-products__grid">
        {products.map(p => (
          <Link key={p.id} to={p.link} className="admin-product">
            <div className="admin-product__visual" style={{ background: p.gradient }}>
              <span className="admin-product__type">{p.type}</span>
            </div>
            <div className="admin-product__body">
              <h2>{p.title}</h2>
              <p>{p.description}</p>
              <div className="admin-product__footer">
                <span className="admin-product__count">
                  {p.count === null ? '…' : `${p.count} ${p.countLabel}`}
                </span>
                <span className="admin-product__action">{p.action} →</span>
                {p.secondary && (
                  <Link to={p.secondary.link} className="admin-product__secondary" onClick={e => e.stopPropagation()}>
                    {p.secondary.label} →
                  </Link>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <p className="admin-products__hint">
        Novos produtos entram aqui conforme forem criados.
      </p>
    </div>
  )
}
