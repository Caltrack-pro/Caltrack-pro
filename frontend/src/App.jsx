import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import AuthGuard from './components/AuthGuard'

// Auth pages
import SignIn         from './pages/auth/SignIn'
import SignUp         from './pages/auth/SignUp'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword  from './pages/auth/ResetPassword'

// Marketing pages (no sidebar)
import Landing    from './pages/marketing/Landing'
import Pricing    from './pages/marketing/Pricing'
import Blog       from './pages/marketing/Blog'
import FAQ        from './pages/marketing/FAQ'
import Contact    from './pages/marketing/Contact'
import BlogPost   from './pages/marketing/BlogPost'

// App pages (sidebar + header)
import Dashboard        from './pages/Dashboard'
import InstrumentList   from './pages/InstrumentList'
import InstrumentDetail from './pages/InstrumentDetail'
import InstrumentForm   from './pages/InstrumentForm'
import CalibrationForm  from './pages/CalibrationForm'
import Alerts           from './pages/Alerts'
import Reports          from './pages/Reports'
import PendingApprovals from './pages/PendingApprovals'
import BadActors          from './pages/BadActors'
import Profile            from './pages/Profile'
import ImportInstruments  from './pages/ImportInstruments'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Auth pages (no app chrome) ──────────────────────────────── */}
        <Route path="/auth/signin"          element={<SignIn />} />
        <Route path="/auth/signup"          element={<SignUp />} />
        <Route path="/auth/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/reset-password"  element={<ResetPassword />} />

        {/* ── Marketing pages (no app chrome) ─────────────────────────── */}
        <Route path="/"        element={<Landing />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/blog"    element={<Blog />} />
        <Route path="/faq"     element={<FAQ />} />
        <Route path="/contact"    element={<Contact />} />
        <Route path="/blog/:slug" element={<BlogPost />} />

        {/* ── App pages (gated by AuthGuard, then inside Layout) ──────── */}
        <Route path="/app" element={<AuthGuard><Layout /></AuthGuard>}>
          <Route index element={<Dashboard />} />
          <Route path="instruments"              element={<InstrumentList />} />
          <Route path="instruments/new"          element={<InstrumentForm />} />
          <Route path="instruments/:id/edit"     element={<InstrumentForm />} />
          <Route path="instruments/:id"          element={<InstrumentDetail />} />
          <Route path="calibrations/new/:instrumentId" element={<CalibrationForm />} />
          <Route path="alerts"                   element={<Alerts />} />
          <Route path="approvals"                element={<PendingApprovals />} />
          <Route path="reports"                  element={<Reports />} />
          <Route path="bad-actors"               element={<BadActors />} />
          <Route path="profile"                  element={<Profile />} />
          <Route path="import"                   element={<ImportInstruments />} />
        </Route>

        {/* Legacy redirects — old bookmarks still work */}
        <Route path="/dashboard"   element={<Navigate to="/app"             replace />} />
        <Route path="/instruments" element={<Navigate to="/app/instruments" replace />} />
        <Route path="/alerts"      element={<Navigate to="/app/alerts"      replace />} />
        <Route path="/reports"     element={<Navigate to="/app/reports"     replace />} />
        <Route path="/approvals"   element={<Navigate to="/app/approvals"   replace />} />

        {/* Catch-all → landing */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  )
}
