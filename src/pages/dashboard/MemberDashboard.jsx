import { useAuth } from '../../hooks/useAuth'
import { Link } from 'react-router-dom'
import './MemberDashboard.css'

export default function MemberDashboard() {
  const { profile } = useAuth()
  const firstName = profile?.name?.split(' ')[0] || 'Aluna'

  const products = [
    {
      id: 'acervo-criativos',
      title: 'Acervo de Criativos',
      description: 'Sua biblioteca completa de anúncios analisados, organizados por nicho e momento de funil.',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
          <line x1="8" y1="21" x2="16" y2="21"/>
          <line x1="12" y1="17" x2="12" y2="21"/>
        </svg>
      ),
      link: '/modulos/boas-vindas',
      tag: 'Disponível',
      gradient: 'linear-gradient(135deg, #A85C35 0%, #D4B99A 100%)',
    },
    {
      id: 'kit-execucao',
      title: 'Kit de Execução',
      description: 'Ganchos, estruturas narrativas e prompts de IA prontos para você usar nos seus criativos.',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9"/>
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
        </svg>
      ),
      link: '/kit',
      tag: profile?.has_order_bump ? 'Disponível' : 'Premium',
      gradient: 'linear-gradient(135deg, #4C362D 0%, #A85C35 100%)',
      locked: !profile?.has_order_bump,
    },
  ]

  return (
    <div className="member-dashboard">
      {/* Banner */}
      <div className="dashboard-banner">
        <div className="dashboard-banner__bg">
          <div className="dashboard-banner__orb dashboard-banner__orb--1" />
          <div className="dashboard-banner__orb dashboard-banner__orb--2" />
        </div>
        <div className="dashboard-banner__content">
          <p className="dashboard-banner__greeting">Olá, {firstName} ✦</p>
          <h1 className="dashboard-banner__title">Bem-vinda à sua<br />área de membros</h1>
          <p className="dashboard-banner__subtitle">Escolha um produto para começar</p>
        </div>
      </div>

      {/* Product Cards */}
      <section className="dashboard-products">
        <h2 className="dashboard-products__title">Seus produtos</h2>
        <div className="dashboard-products__grid">
          {products.map((product, index) => (
            <Link
              key={product.id}
              to={product.locked ? '#' : product.link}
              className={`product-card ${product.locked ? 'product-card--locked' : ''}`}
              style={{ animationDelay: `${index * 0.12}s` }}
              onClick={e => product.locked && e.preventDefault()}
            >
              <div className="product-card__visual" style={{ background: product.gradient }}>
                <div className="product-card__icon">
                  {product.icon}
                </div>
                <span className={`product-card__tag ${product.locked ? 'product-card__tag--premium' : ''}`}>
                  {product.tag}
                </span>
              </div>
              <div className="product-card__info">
                <h3 className="product-card__name">{product.title}</h3>
                <p className="product-card__desc">{product.description}</p>
                <div className="product-card__action">
                  {product.locked ? (
                    <span className="product-card__lock">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      Faça upgrade para acessar
                    </span>
                  ) : (
                    <span className="product-card__enter">
                      Acessar
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
