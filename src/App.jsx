import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'
import LoginPage from './pages/login/LoginPage'
import MemberDashboard from './pages/dashboard/MemberDashboard'
import ModulePage from './pages/modules/ModulePage'
import KitPage from './pages/kit/KitPage'
import SearchPage from './pages/search/SearchPage'
import FormFlora from './pages/FormFlora'
import FormIngrid from './pages/FormIngrid'
import Confirmacao from './pages/Confirmacao'
import Dashboard from './pages/Dashboard'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Formulários de aplicação (projeto existente) */}
          <Route path="/aplicacao" element={<FormFlora />} />
          <Route path="/aplicacao/flora" element={<FormFlora />} />
          <Route path="/aplicacao/ingrid" element={<FormIngrid />} />
          <Route path="/aplicacao/confirmacao" element={<Confirmacao />} />
          <Route path="/aplicacao/dashboard" element={<Dashboard />} />

          {/* Área de membros — Acervo de Criativos */}
          <Route path="/login" element={<LoginPage />} />

          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<MemberDashboard />} />
            <Route path="/modulos/:slug" element={<ModulePage />} />
            <Route path="/kit" element={<KitPage />} />
            <Route path="/busca" element={<SearchPage />} />
          </Route>

          {/* Redirect raiz para login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
