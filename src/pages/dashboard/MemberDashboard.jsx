import { useAuth } from '../../hooks/useAuth'
import { Link } from 'react-router-dom'
import './MemberDashboard.css'

export default function MemberDashboard() {
  const { profile } = useAuth()
  const firstName = profile?.name?.split(' ')[0] || 'Aluna'

  const products = [
    {
      id: 'acervo-anuncios',
      number: '01',
      title: 'Acervo de Anúncios',
      description: 'Sua biblioteca de anúncios que funcionam, organizados por objetivo — do primeiro contato até a venda.',
      meta: '6 coleções',
      link: '/produto/acervo-anuncios',
    },
    {
      id: 'kit-execucao',
      number: '02',
      title: 'Kit de Execução',
      description: 'Ganchos, estruturas narrativas e prompts de IA prontos para você usar nos seus criativos.',
      meta: profile?.has_order_bump ? 'Disponível' : 'Upgrade',
      link: '/produto/kit-execucao',
      locked: !profile?.has_order_bump,
    },
  ]

  return (
    <div className="member-dashboard">
      {/* Cabeçalho editorial */}
      <header className="dash-hero">
        <span className="dash-hero__eyebrow">Olá, {firstName} ✦</span>
        <h1 className="dash-hero__title">
          Sua área<br />de <em>membros</em>
        </h1>
        <div className="dash-hero__rule">
          <span>Método AVVA</span>
          <span>{new Date().getFullYear()}</span>
        </div>
      </header>

      {/* Produtos em linhas editoriais */}
      <section className="dash-products">
        <span className="dash-products__label">Seus produtos</span>

        {products.map(product => (
          <Link
            key={product.id}
            to={product.locked ? '#' : product.link}
            className={`dash-row ${product.locked ? 'dash-row--locked' : ''}`}
            onClick={e => product.locked && e.preventDefault()}
          >
            <span className="dash-row__number">{product.number}</span>
            <div className="dash-row__info">
              <h2 className="dash-row__title">{product.title}</h2>
              <p className="dash-row__desc">{product.description}</p>
            </div>
            <span className="dash-row__meta">
              {product.locked && (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              )}
              {product.meta}
            </span>
            <span className="dash-row__arrow" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
            </span>
          </Link>
        ))}
      </section>
    </div>
  )
}
