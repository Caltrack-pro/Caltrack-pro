import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import AuthGuard from './components/AuthGuard'

// Auth pages
import SignIn         from './pages/auth/SignIn'
import SignUp         from './pages/auth/SignUp'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword  from './pages/auth/ResetPassword'

// Marketing pages (no sidebar)
import Landing     from './pages/marketing/Landing'
import Pricing     from './pages/marketing/Pricing'
import HowItWorks  from './pages/marketing/HowItWorks'
import Resources   from './pages/marketing/Resources'
import Blog        from './pages/marketing/Blog'
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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Auth pages (no app chrome) ──────────────────────────────── */}
        <Route path="/auth/signin"          element={<SignIn />} />
        <Route path="/auth/sign-in"         element={<Navigate to="/auth/signin" replace />} />
        <Route path="/auth/signup"          element={<SignUp />} />
        <Route path="/auth/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/reset-password"  element={<ResetPassword />} />

        {/* ── Marketing pages (no app chrome) ─────────────────────────── */}
        <Route path="/"             element={<Landing />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/pricing"      element={<Pricing />} />
        <Route path="/resources"    element={<Resources />} />
        <Route path="/faq"          element={<FAQ />} />
        <Route path="/contact"      element={<Contact />} />
        <Route path="/demo"         element={<DemoPage />} />
        <Route path="/blog"         element={<Blog />} />
        <Route path="/blog/:slug"   element={<BlogPost />} />

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
