import { BrowserRouter, Routes, Route } from 'react-router-dom'
import FormFlora from './pages/FormFlora'
import FormIngrid from './pages/FormIngrid'
import Confirmacao from './pages/Confirmacao'
import Dashboard from './pages/Dashboard'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<FormFlora />} />
        <Route path="/flora" element={<FormFlora />} />
        <Route path="/ingrid" element={<FormIngrid />} />
        <Route path="/confirmacao" element={<Confirmacao />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  )
}
