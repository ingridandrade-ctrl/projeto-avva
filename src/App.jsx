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
const AdminProductHub = lazy(() => import('./pages/admin/AdminProductHub'))
const AdminProductIndex = lazy(() => import('./pages/admin/AdminProductHub').then(m => ({ default: m.AdminProductIndex })))
const AdminAdsList = lazy(() => import('./pages/admin/AdminAdsList'))
const AdminAdForm = lazy(() => import('./pages/admin/AdminAdForm'))
const AdminAdImport = lazy(() => import('./pages/admin/AdminAdImport'))
const AdminKit = lazy(() => import('./pages/admin/AdminKit'))
const AdminLogin = lazy(() => import('./pages/AdminLogin'))
const AdminSenha = lazy(() => import('./pages/AdminSenha'))
const ProductPage = lazy(() => import('./pages/product/ProductPage'))
const CollectionPage = lazy(() => import('./pages/collections/CollectionPage'))
const KitPage = lazy(() => import('./pages/kit/KitPage'))
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage'))
const SearchPage = lazy(() => import('./pages/search/SearchPage'))
const FavoritesPage = lazy(() => import('./pages/favorites/FavoritesPage'))
const AdminCollections = lazy(() => import('./pages/admin/AdminCollections'))
const AdminSugestoes = lazy(() => import('./pages/admin/AdminSugestoes'))
const FormIngrid = lazy(() => import('./pages/FormIngrid'))
const Confirmacao = lazy(() => import('./pages/Confirmacao'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const AcervoPage = lazy(() => import('./pages/acervo/AcervoPage'))
const HubPage = lazy(() => import('./pages/hub/HubPage'))

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
            <Route path="/admin/senha" element={<AdminSenha />} />

            <Route
              element={
                <AdminRoute loginPath="/admin/login" deniedPath="/alunas">
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/produtos" element={<AdminProducts />} />

              {/* Cada produto tem a própria casa: alunas, conteúdo e capas */}
              <Route path="/admin/produtos/:slug" element={<AdminProductHub />}>
                <Route index element={<AdminProductIndex />} />
                <Route path="alunas" element={<AdminAlunas />} />
                <Route path="anuncios" element={<AdminAdsList />} />
                <Route path="anuncios/novo" element={<AdminAdForm />} />
                <Route path="anuncios/importar" element={<AdminAdImport />} />
                <Route path="anuncios/:id/editar" element={<AdminAdForm />} />
                <Route path="colecoes" element={<AdminCollections />} />
                <Route path="sugestoes" element={<AdminSugestoes />} />
                <Route path="itens" element={<AdminKit />} />
              </Route>

              {/* Endereços antigos */}
              <Route path="/admin/alunas" element={<Navigate to="/admin/produtos/acervo/alunas" replace />} />
              <Route path="/admin/ads" element={<Navigate to="/admin/produtos/acervo/anuncios" replace />} />
              <Route path="/admin/ads/new" element={<Navigate to="/admin/produtos/acervo/anuncios/novo" replace />} />
              <Route path="/admin/colecoes" element={<Navigate to="/admin/produtos/acervo/colecoes" replace />} />
              <Route path="/admin/kit" element={<Navigate to="/admin/produtos/kit/itens" replace />} />
              <Route path="/admin/mentoria" element={<Dashboard embedded />} />
            </Route>

            {/* Raiz: página inicial do AVVA Hub (área de alunas, mentoria e suporte) */}
            <Route path="/" element={<HubPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}
