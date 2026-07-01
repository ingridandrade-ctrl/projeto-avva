import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import './AppLayout.css'

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  function handleSearchChange(value) {
    setSearch(value)
    if (value.length >= 2) {
      navigate(`/busca?q=${encodeURIComponent(value)}`)
    }
  }

  return (
    <div className="app-layout">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Header
        onMenuToggle={() => setSidebarOpen(o => !o)}
        searchValue={search}
        onSearchChange={handleSearchChange}
      />
      <main className="app-layout__main">
        <Outlet context={{ search }} />
      </main>
    </div>
  )
}
