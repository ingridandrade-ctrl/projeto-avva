import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import './AppLayout.css'

const KEY = 'avva.menu-recolhido'

function readCollapsed() {
  try { return localStorage.getItem(KEY) === '1' } catch { return false }
}

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)      // celular: gaveta aberta
  const [collapsed, setCollapsed] = useState(readCollapsed)  // computador: só ícones

  // Um botão só: no computador recolhe/expande, no celular abre/fecha
  function toggleMenu() {
    if (window.matchMedia('(max-width: 768px)').matches) {
      setSidebarOpen(o => !o)
      return
    }
    setCollapsed(c => {
      try { localStorage.setItem(KEY, c ? '0' : '1') } catch { /* sem armazenamento, sem problema */ }
      return !c
    })
  }

  return (
    <div className={`app-layout ${collapsed ? 'app-layout--collapsed' : ''}`}>
      <Sidebar open={sidebarOpen} collapsed={collapsed} onClose={() => setSidebarOpen(false)} />
      <Header onMenuToggle={toggleMenu} sidebarOpen={sidebarOpen} />
      <main className="app-layout__main">
        <div className="app-layout__content">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
