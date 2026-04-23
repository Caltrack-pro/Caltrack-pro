import { BrowserRouter, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom'
import { useEffect } from 'react'
import Layout from './components/Layout'
import AuthGuard from './components/AuthGuard'

const SITE_BASE = 'https://calcheq.com'

function CanonicalManager() {
  const { pathname } = useLocation()
  useEffect(() => {
    const url = `${SITE_BASE}${pathname}`
    let link = document.querySelector("link[rel='canonical']")
    if (!link) {
      link = document.createElement('link')
      link.rel = 'canonical'
      document.head.appendChild(link)
    }
    link.href = url
    const ogUrl = document.querySelector("meta[property='og:url']")
    if (ogUrl) ogUrl.setAttribute('content', url)
  }, [pathname])
  return null
}

// 404 page rendered inside the authenticated layout (sidebar stays visible)
function AppNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <p className="text-7xl font-bold text-slate-200 mb-4">404</p>
      <h1 className="text-xl font-semibold text-slate-700 mb-2">Page not found</h1>
      <p className="text-slate-500 mb-6 text-sm">This URL doesn't exist in the app.</p>
      <Link to="/app"
        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
        Go to Dashboard
      </Link>
    </div>
  )
}

// Auth pages
import SignIn        from './pages/auth/SignIn'
import SignUp        from './pages/auth/SignUp'
import AuthCallback  from './pages/auth/AuthCallback'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword  from './pages/auth/ResetPassword'

// Marketing pages (no sidebar)
import Landing     from './pages/marketing/Landing'
import Pricing     from './pages/marketing/Pricing'
import HowItWorks  from './pages/marketing/HowItWorks'
import Resources   from './pages/marketing/Resources'
import FAQ         from './pages/marketing/FAQ'
import Contact     from './pages/marketing/Contact'
import BlogPost    from './pages/marketing/BlogPost'
import DemoPage    from './pages/marketing/DemoPage'

// App pages (sidebar + header)
import Dashboard           from './pages/Dashboard'
import InstrumentList      from './pages/InstrumentList'
import InstrumentDetail    from './pages/InstrumentDetail'
import InstrumentForm      from './pages/InstrumentForm'
import CalibrationForm     from './pages/CalibrationForm'
import Schedule            from './pages/Schedule'
import Calibrations        from './pages/Calibrations'
import AppSettings         from './pages/AppSettings'
import Reports             from './pages/Reports'
import SmartDiagnostics    from './pages/SmartDiagnostics'
import Documents           from './pages/Documents'
import ImportInstruments   from './pages/ImportInstruments'
import ImportCalibratorCSV from './pages/ImportCalibratorCSV'
import Support             from './pages/Support'
import Onboarding          from './pages/Onboarding'
import SuperAdmin          from './pages/SuperAdmin'

// Gate an element behind the super-admin check. Renders 404 (AppNotFound) if
// the current user isn't a super-admin, so the route's existence isn't
// advertised. Reads the module cache from userContext directly (not a hook)
// since getUser() is synchronous — AuthGuard has already awaited init.
import { getUser as _getUser } from './utils/userContext'
function SuperadminOnly({ children }) {
  const u = _getUser()
  if (!u?.isSuperadmin) return <AppNotFound />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <CanonicalManager />
      <Routes>

        {/* ── Auth pages (no app chrome) ──────────────────────────────── */}
        <Route path="/auth/signin"          element={<SignIn />} />
        <Route path="/auth/sign-in"         element={<Navigate to="/auth/signin" replace />} />
        <Route path="/auth/signup"          element={<SignUp />} />
        <Route path="/auth/callback"        element={<AuthCallback />} />
        <Route path="/auth/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/reset-password"  element={<ResetPassword />} />

        {/* ── Marketing pages (no app chrome) ─────────────────────────── */}
        <Route path="/"             element={<Landing />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/pricing"      element={<Pricing />} />
        <Route path="/resources"       element={<Resources />} />
        <Route path="/resources/:slug" element={<BlogPost />} />
        <Route path="/faq"             element={<FAQ />} />
        <Route path="/contact"         element={<Contact />} />
        <Route path="/demo"            element={<DemoPage />} />
        {/* /blog is now an alias for /resources; /blog/:slug still serves articles */}
        <Route path="/blog"            element={<Navigate to="/resources" replace />} />
        <Route path="/blog/:slug"      element={<BlogPost />} />

        {/* ── Onboarding wizard (auth required, no sidebar) ─────────── */}
        <Route path="/app/onboarding" element={<AuthGuard><Onboarding /></AuthGuard>} />

        {/* ── App pages (gated by AuthGuard, then inside Layout) ──────── */}
        <Route path="/app" element={<AuthGuard><Layout /></AuthGuard>}>
          <Route index element={<Dashboard />} />

          {/* Instruments */}
          <Route path="instruments"              element={<InstrumentList />} />
          <Route path="instruments/new"          element={<InstrumentForm />} />
          <Route path="instruments/:id/edit"     element={<InstrumentForm />} />
          <Route path="instruments/:id"          element={<InstrumentDetail />} />

          {/* Schedule — overdue, due-soon, repeat failures */}
          <Route path="schedule"                 element={<Schedule />} />

          {/* Calibrations — pending approvals + activity log */}
          <Route path="calibrations"             element={<Calibrations />} />
          <Route path="calibrations/new/:instrumentId" element={<CalibrationForm />} />
          <Route path="calibrations/import-csv"  element={<ImportCalibratorCSV />} />

          {/* Reports */}
          <Route path="reports"                  element={<Reports />} />

          {/* Smart Diagnostics — recommendations, drift, repeat failures */}
          <Route path="diagnostics"              element={<SmartDiagnostics />} />

          {/* Documents — procedures, manuals, certificates */}
          <Route path="documents"                element={<Documents />} />

          {/* Settings — profile, password, team members */}
          <Route path="settings"                 element={<AppSettings />} />

          {/* Instruments CSV bulk import */}
          <Route path="import"                   element={<ImportInstruments />} />

          {/* Support */}
          <Route path="support"                  element={<Support />} />

          {/* Platform Admin — super-admin only, 404 otherwise (no advertise) */}
          <Route path="admin"                    element={<SuperadminOnly><SuperAdmin /></SuperadminOnly>} />

          {/* /app/* catch-all — shows 404 within the app shell instead of bouncing to marketing homepage */}
          <Route path="*" element={<AppNotFound />} />

          {/* Legacy in-app redirects — old bookmarks still work */}
          <Route path="alerts"                   element={<Navigate to="/app/schedule"      replace />} />
          <Route path="approvals"                element={<Navigate to="/app/calibrations"  replace />} />
          <Route path="bad-actors"               element={<Navigate to="/app/schedule"      replace />} />
          <Route path="profile"                  element={<Navigate to="/app/settings"      replace />} />
        </Route>

        {/* Legacy redirects — old bookmarks still work */}
        <Route path="/dashboard"   element={<Navigate to="/app"             replace />} />
        <Route path="/instruments" element={<Navigate to="/app/instruments" replace />} />
        <Route path="/alerts"      element={<Navigate to="/app/schedule"    replace />} />
        <Route path="/reports"     element={<Navigate to="/app/reports"     replace />} />
        <Route path="/approvals"   element={<Navigate to="/app/calibrations" replace />} />

        {/* Catch-all → landing */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  )
}
