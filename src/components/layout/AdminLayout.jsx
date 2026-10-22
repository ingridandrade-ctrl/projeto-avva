import { NavLink, Outlet, useLocation } from 'react-router-dom'
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

const NAV = [
  {
    section: 'Geral',
    items: [
      { to: '/admin', label: 'Painel', icon: 'painel', match: p => p === '/admin' },
    ],
  },
  {
    section: 'Produtos',
    items: [
      { to: '/admin/produtos', label: 'Todos os produtos', icon: 'produtos', match: p => p === '/admin/produtos' },
      { to: '/admin/ads', label: 'Acervo de Anúncios', icon: 'anuncios', match: p => p.startsWith('/admin/ads') },
      { to: '/admin/colecoes', label: 'Coleções e capas', icon: 'colecoes', match: p => p.startsWith('/admin/colecoes') },
      { to: '/admin/kit', label: 'Kit de Execução', icon: 'kit', match: p => p.startsWith('/admin/kit') },
    ],
  },
  {
    section: 'Mentoria',
    items: [
      { to: '/admin/mentoria', label: 'Aplicações', icon: 'mentoria', match: p => p.startsWith('/admin/mentoria') },
    ],
  },
]

export default function AdminLayout() {
  const { profile, signOut } = useAuth()
  const { pathname } = useLocation()

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
          {NAV.map(group => (
            <div key={group.section} className="adm-side__group">
              <span className="adm-side__group-label">{group.section}</span>
              {group.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`adm-side__link ${item.match(pathname) ? 'is-active' : ''}`}
                >
                  {ICONS[item.icon]}
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
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
