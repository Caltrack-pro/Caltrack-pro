import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import InstrumentList from './pages/InstrumentList'
import InstrumentDetail from './pages/InstrumentDetail'
import InstrumentForm from './pages/InstrumentForm'
import CalibrationForm from './pages/CalibrationForm'
import Alerts from './pages/Alerts'
import Reports from './pages/Reports'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="instruments" element={<InstrumentList />} />
          {/* /new must come before /:id so the literal "new" is not treated as a UUID */}
          <Route path="instruments/new" element={<InstrumentForm />} />
          <Route path="instruments/:id" element={<InstrumentDetail />} />
          <Route path="calibrations/new/:instrumentId" element={<CalibrationForm />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="reports" element={<Reports />} />
          {/* Catch-all → home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
