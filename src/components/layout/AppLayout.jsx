import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import BottomNav from './BottomNav'
import './AppLayout.css'

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const timer = useRef(null)

  // Mantém o campo sincronizado com ?q= ao voltar para a busca
  useEffect(() => {
    if (location.pathname === '/busca') {
      const q = new URLSearchParams(location.search).get('q') || ''
      setSearch(q)
    }
  }, [location.pathname, location.search])

  // Só navega depois de uma pausa na digitação (não rouba a tela a cada tecla)
  function handleSearchChange(value) {
    setSearch(value)
    clearTimeout(timer.current)
    if (value.trim().length < 2) return
    timer.current = setTimeout(() => {
      navigate(`/busca?q=${encodeURIComponent(value.trim())}`)
    }, 450)
  }

  return (
    <div className="app-layout">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Header
        onMenuToggle={() => setSidebarOpen(o => !o)}
        sidebarOpen={sidebarOpen}
        searchValue={search}
        onSearchChange={handleSearchChange}
      />
      <main className="app-layout__main">
        <div className="app-layout__content">
          <Outlet context={{ search }} />
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
