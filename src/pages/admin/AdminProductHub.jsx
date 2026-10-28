import { Link, Navigate, Outlet, useParams } from 'react-router-dom'
import { PRODUCTS } from '../../lib/adminProducts'
import './AdminProductHub.css'

export default function AdminProductHub() {
  const { slug } = useParams()
  const product = PRODUCTS[slug]
  if (!product) return <Navigate to="/admin/produtos" replace />

  return (
    <div className="adm-hub">
      <Link to="/admin/produtos" className="adm-hub__back">← Todos os produtos</Link>

      <header className="adm-hub__head">
        <div className="adm-hub__visual" style={{ background: product.gradient }}>
          {product.image && <img src={product.image} alt="" />}
        </div>
        <div className="adm-hub__text">
          <span className="adm-eyebrow">{product.type}</span>
          <h1>{product.title}</h1>
          <p>{product.description}</p>
        </div>
      </header>

      <div className="adm-hub__body">
        <Outlet />
      </div>
    </div>
  )
}

// Entrar no produto cai na primeira aba
export function AdminProductIndex() {
  const { slug } = useParams()
  const product = PRODUCTS[slug]
  return <Navigate to={product ? product.tabs[0].to : '/admin/produtos'} replace />
}
