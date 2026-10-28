import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { PRODUCTS } from '../../lib/adminProducts'
import { useAuth } from '../../hooks/useAuth'
import './AdminLayout.css'

const ICONS = {
  painel: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>,
  produtos: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/></svg>,
  anuncios: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="14" rx="2"/><path d="M10 9l5 3-5 3V9z"/></svg>,
  colecoes: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>,
  kit: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>,
  mentoria: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  site: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
  sair: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
}

export default function AdminLayout() {
  const { profile, signOut } = useAuth()
  const { pathname } = useLocation()
  const [open, setOpen] = useState({}) // produtos abertos no menu (além do atual)

  return (
    <div className="adm">
      <aside className="adm-side">
        <div className="adm-side__brand">
          <span className="adm-side__logo">A</span>
          <div>
            <strong>Método AVVA</strong>
            <span>Administração</span>
          </div>
        </div>

        <nav className="adm-side__nav">
          <div className="adm-side__group">
            <span className="adm-side__group-label">Geral</span>
            <NavLink to="/admin" end className={({ isActive }) => `adm-side__link ${isActive ? 'is-active' : ''}`}>
              {ICONS.painel}
              <span>Painel</span>
            </NavLink>
          </div>

          {/* Produtos: cada um abre as próprias seções embaixo, como subcategorias */}
          <div className="adm-side__group">
            <span className="adm-side__group-label">Produtos</span>
            <NavLink to="/admin/produtos" end className={({ isActive }) => `adm-side__link ${isActive ? 'is-active' : ''}`}>
              {ICONS.produtos}
              <span>Todos os produtos</span>
            </NavLink>
            {Object.values(PRODUCTS).map(product => {
              const base = `/admin/produtos/${product.slug}`
              const inside = pathname.startsWith(base) || (product.slug === 'acervo' && pathname.startsWith('/admin/ads'))
              const isOpen = open[product.slug] ?? inside
              return (
                <div key={product.slug} className={`adm-side__product ${isOpen ? 'is-open' : ''}`}>
                  <button
                    type="button"
                    className={`adm-side__link adm-side__product-btn ${inside ? 'is-inside' : ''}`}
                    onClick={() => setOpen(o => ({ ...o, [product.slug]: !isOpen }))}
                    aria-expanded={isOpen}
                  >
                    <span className="adm-side__dot" style={{ background: product.gradient }} />
                    <span>{product.title}</span>
                    <i className="adm-side__chevron">{ICONS.chevron}</i>
                  </button>
                  {isOpen && (
                    <div className="adm-side__sub">
                      {product.tabs.map(t => (
                        <NavLink
                          key={t.to}
                          to={`${base}/${t.to}`}
                          className={({ isActive }) => `adm-side__sublink ${isActive ? 'is-active' : ''}`}
                        >
                          {t.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="adm-side__group">
            <span className="adm-side__group-label">Mentoria</span>
            <NavLink to="/admin/mentoria" className={({ isActive }) => `adm-side__link ${isActive ? 'is-active' : ''}`}>
              {ICONS.mentoria}
              <span>Aplicações</span>
            </NavLink>
          </div>
        </nav>

        <div className="adm-side__footer">
          <NavLink to="/alunas" className="adm-side__link adm-side__link--muted">
            {ICONS.site}
            <span>Ver área das alunas</span>
          </NavLink>
          <div className="adm-side__user">
            <span className="adm-side__avatar">{profile?.name?.[0]?.toUpperCase() || 'A'}</span>
            <div className="adm-side__user-text">
              <strong>{profile?.name || 'Admin'}</strong>
              <span>{profile?.email}</span>
            </div>
            <button className="adm-side__signout" onClick={signOut} title="Sair" aria-label="Sair">
              {ICONS.sair}
            </button>
          </div>
        </div>
      </aside>

      <main className="adm-main">
        <div className="adm-content">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
