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
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'))
const AdminAlunas = lazy(() => import('./pages/admin/AdminAlunas'))
const AdminAdsList = lazy(() => import('./pages/admin/AdminAdsList'))
const AdminAdForm = lazy(() => import('./pages/admin/AdminAdForm'))
const AdminKit = lazy(() => import('./pages/admin/AdminKit'))
const AdminLogin = lazy(() => import('./pages/AdminLogin'))
const ProductPage = lazy(() => import('./pages/product/ProductPage'))
const CollectionPage = lazy(() => import('./pages/collections/CollectionPage'))
const KitPage = lazy(() => import('./pages/kit/KitPage'))
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage'))
const SearchPage = lazy(() => import('./pages/search/SearchPage'))
const FavoritesPage = lazy(() => import('./pages/favorites/FavoritesPage'))
const AdminCollections = lazy(() => import('./pages/admin/AdminCollections'))
const FormIngrid = lazy(() => import('./pages/FormIngrid'))
const Confirmacao = lazy(() => import('./pages/Confirmacao'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const AcervoPage = lazy(() => import('./pages/acervo/AcervoPage'))

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
            {/* ── Mentoria (formulários de aplicação) ── */}
            <Route path="/mentoria" element={<FormFlora />} />
            <Route path="/mentoria/flora" element={<FormFlora />} />
            <Route path="/mentoria/ingrid" element={<FormIngrid />} />
            <Route path="/mentoria/confirmacao" element={<Confirmacao />} />

            {/* Endereços antigos continuam funcionando */}
            <Route path="/aplicacao" element={<Navigate to="/mentoria" replace />} />
            <Route path="/aplicacao/flora" element={<Navigate to="/mentoria/flora" replace />} />
            <Route path="/aplicacao/ingrid" element={<Navigate to="/mentoria/ingrid" replace />} />
            <Route path="/aplicacao/confirmacao" element={<Navigate to="/mentoria/confirmacao" replace />} />
            <Route path="/aplicacao/login" element={<Navigate to="/admin/login" replace />} />
            <Route path="/aplicacao/dashboard" element={<Navigate to="/admin/mentoria" replace />} />

            {/* ── Página de vendas do Acervo de Anúncios (pública) ── */}
            <Route path="/acervo-de-anuncios" element={<AcervoPage />} />
            <Route path="/acervo" element={<Navigate to="/acervo-de-anuncios" replace />} />
            {/* Endereço digitado com acento também chega na página */}
            <Route path="/acervo-de-anúncios" element={<Navigate to="/acervo-de-anuncios" replace />} />

            {/* ── Área de membros — alunas ── */}
            <Route path="/login" element={<LoginPage />} />

            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/alunas" element={<MemberDashboard />} />
              <Route path="/dashboard" element={<Navigate to="/alunas" replace />} />
              <Route path="/produto/:slug" element={<ProductPage />} />
              <Route path="/colecao/:slug" element={<CollectionPage />} />
              <Route path="/kit" element={<KitPage />} />
              <Route path="/perfil" element={<ProfilePage />} />
              <Route path="/busca" element={<SearchPage />} />
              <Route path="/favoritos" element={<FavoritesPage />} />
            </Route>

            {/* ── Admin geral: Produtos + Mentoria ── */}
            <Route path="/admin/login" element={<AdminLogin />} />

            <Route
              element={
                <AdminRoute loginPath="/admin/login" deniedPath="/alunas">
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/alunas" element={<AdminAlunas />} />
              <Route path="/admin/produtos" element={<AdminProducts />} />
              <Route path="/admin/colecoes" element={<AdminCollections />} />
              <Route path="/admin/ads" element={<AdminAdsList />} />
              <Route path="/admin/ads/new" element={<AdminAdForm />} />
              <Route path="/admin/ads/:id/edit" element={<AdminAdForm />} />
              <Route path="/admin/kit" element={<AdminKit />} />
              <Route path="/admin/mentoria" element={<Dashboard embedded />} />
            </Route>

            {/* Raiz: por enquanto leva pro formulário da mentoria */}
            <Route path="/" element={<Navigate to="/mentoria" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}
