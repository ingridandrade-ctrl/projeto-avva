import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import AppLayout from './components/layout/AppLayout'
import AdminLayout from './components/layout/AdminLayout'
import LoginPage from './pages/login/LoginPage'
import MemberDashboard from './pages/dashboard/MemberDashboard'
import ProductPage from './pages/product/ProductPage'
import ModulePage from './pages/modules/ModulePage'
import KitPage from './pages/kit/KitPage'
import ProfilePage from './pages/profile/ProfilePage'
import SearchPage from './pages/search/SearchPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminAdsList from './pages/admin/AdminAdsList'
import AdminAdForm from './pages/admin/AdminAdForm'
import AdminKit from './pages/admin/AdminKit'
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

          {/* Área de membros — Método AVVA */}
          <Route path="/login" element={<LoginPage />} />

          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<MemberDashboard />} />
            <Route path="/produto/:slug" element={<ProductPage />} />
            <Route path="/modulos/:slug" element={<ModulePage />} />
            <Route path="/kit" element={<KitPage />} />
            <Route path="/perfil" element={<ProfilePage />} />
            <Route path="/busca" element={<SearchPage />} />
          </Route>

          {/* Painel Admin (acesso separado, sem botão na área normal) */}
          <Route
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/ads" element={<AdminAdsList />} />
            <Route path="/admin/ads/new" element={<AdminAdForm />} />
            <Route path="/admin/ads/:id/edit" element={<AdminAdForm />} />
            <Route path="/admin/kit" element={<AdminKit />} />
          </Route>

          {/* Raiz vai para o formulário (projeto original) */}
          <Route path="/" element={<FormFlora />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
