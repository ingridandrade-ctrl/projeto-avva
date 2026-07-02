import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import AppLayout from './components/layout/AppLayout'
import LoginPage from './pages/login/LoginPage'
import MemberDashboard from './pages/dashboard/MemberDashboard'
import FormFlora from './pages/FormFlora'

// Code-splitting: cada área baixa seu código só quando acessada
const AdminLayout = lazy(() => import('./components/layout/AdminLayout'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminAdsList = lazy(() => import('./pages/admin/AdminAdsList'))
const AdminAdForm = lazy(() => import('./pages/admin/AdminAdForm'))
const AdminKit = lazy(() => import('./pages/admin/AdminKit'))
const ProductPage = lazy(() => import('./pages/product/ProductPage'))
const CollectionPage = lazy(() => import('./pages/collections/CollectionPage'))
const KitPage = lazy(() => import('./pages/kit/KitPage'))
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage'))
const SearchPage = lazy(() => import('./pages/search/SearchPage'))
const FormIngrid = lazy(() => import('./pages/FormIngrid'))
const Confirmacao = lazy(() => import('./pages/Confirmacao'))
const Dashboard = lazy(() => import('./pages/Dashboard'))

function PageLoader() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '40vh',
      color: 'var(--teal-medio)',
      fontFamily: 'var(--font-corpo)',
      fontSize: '0.9rem',
    }}>
      Carregando...
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
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
              <Route path="/colecao/:slug" element={<CollectionPage />} />
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
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}
