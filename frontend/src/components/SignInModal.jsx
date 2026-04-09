/**
 * SignInModal — shared 3-step sign-in modal used by both Header (app) and
 * MarketingNav (marketing site).
 *
 * Props:
 *   current   — current user object { siteName, userName, role } or null
 *   onSave    — called with the new user object after successful sign-in
 *   onClose   — called when the modal should close (cancel or backdrop click)
 */

import { useState } from 'react'
import {
  ROLES, DEMO_SITE,
  findSite, saveSite, verifySitePassword, siteHasNoPassword,
  findMember, saveMember,
} from '../utils/userContext'

// ── Icons ─────────────────────────────────────────────────────────────────────

function IconEye({ visible }) {
  return visible ? (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ) : (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )
}

// ── Input style helper ────────────────────────────────────────────────────────

const inputCls = (err) =>
  `w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    err ? 'border-red-400 bg-red-50' : 'border-slate-200'
  }`

// ── SignInModal ───────────────────────────────────────────────────────────────

export default function SignInModal({ current, onSave, onClose }) {
  const [step,       setStep]       = useState(1)
  const [siteName,   setSiteName]   = useState(current?.siteName ?? '')
  const [siteIsNew,  setSiteIsNew]  = useState(false)
  const [sitePwd,    setSitePwd]    = useState('')
  const [sitePwdCfm, setSitePwdCfm] = useState('')
  const [showPwd,    setShowPwd]    = useState(false)
  const [userName,   setUserName]   = useState(current?.userName ?? '')
  const [role,       setRole]       = useState(current?.role ?? 'technician')
  const [err,        setErr]        = useState('')

  const isDemo = siteName.trim().toLowerCase() === DEMO_SITE.toLowerCase()

  // ── Step 1: site name → Next ────────────────────────────────────────────────
  function handleSiteNext() {
    const trimmed = siteName.trim()
    if (!trimmed) { setErr('Site name is required'); return }
    setErr('')

    // Demo site: skip password step entirely
    if (trimmed.toLowerCase() === DEMO_SITE.toLowerCase()) {
      setStep(3)
      return
    }

    const site = findSite(trimmed)
    setSiteIsNew(!site)

    // If site exists with no password, skip the password step
    if (site && !site.password) {
      const member = findMember(trimmed, current?.userName || '')
      if (member) { setUserName(member.userName); setRole(member.role) }
      setStep(3)
      return
    }

    setStep(2)
  }

  // ── Step 2: site password → Next ────────────────────────────────────────────
  function handlePasswordNext() {
    const trimmedSite = siteName.trim()
    if (siteIsNew) {
      if (!sitePwd) { setErr('A password is required for new sites'); return }
      if (sitePwd !== sitePwdCfm) { setErr('Passwords do not match'); return }
      setErr('')
      saveSite(trimmedSite, sitePwd)
    } else {
      if (!verifySitePassword(trimmedSite, sitePwd)) {
        setErr('Incorrect site password'); return
      }
      setErr('')
    }

    // Pre-fill name + role from remembered member
    const member = findMember(trimmedSite, userName || current?.userName || '')
    if (member) { setUserName(member.userName); setRole(member.role) }
    else if (current?.siteName?.toLowerCase() === trimmedSite.toLowerCase()) {
      setUserName(current.userName); setRole(current.role)
    }

    setStep(3)
  }

  // ── Step 3: personal name + role → Sign In ───────────────────────────────────
  function handleSignIn() {
    const trimmedUser = userName.trim()
    if (!trimmedUser) { setErr('Your name is required'); return }
    setErr('')
    const trimmedSite = siteName.trim()
    saveMember(trimmedSite, trimmedUser, role)
    onSave({ siteName: trimmedSite, userName: trimmedUser, role })
    onClose()
  }

  const stepCount = isDemo ? 2 : 3  // Demo skips password step, show 2 dots

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-50"
        onClick={current ? onClose : undefined}
      />

      {/* Panel */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50
                      w-full max-w-sm bg-white rounded-xl shadow-2xl p-6">

        {/* Progress dots */}
        <div className="flex gap-1.5 mb-5">
          {[1, 2, isDemo ? null : 3].filter(Boolean).map((s, i) => (
            <div key={s} className={`h-1.5 rounded-full flex-1 transition-colors ${
              (isDemo ? step : step) > i ? 'bg-blue-600' : step === s || (isDemo && i === 0 && step >= 1) ? 'bg-blue-600' : 'bg-slate-200'
            }`} />
          ))}
        </div>

        {/* Title */}
        <h2 className="text-base font-semibold text-slate-800 mb-1">
          {step === 1
            ? 'Sign In'
            : step === 2
              ? siteIsNew ? 'Create Site' : 'Site Password'
              : 'Who Are You?'}
        </h2>
        <p className="text-xs text-slate-400 mb-5">
          {step === 1
            ? 'Enter your organisation or site name to continue.'
            : step === 2
              ? siteIsNew
                ? `Set a password to protect the "${siteName.trim()}" site.`
                : `Enter the password for "${siteName.trim()}".`
              : isDemo
                ? 'Enter your name so calibration records show who did the work.'
                : 'Enter your name so calibration records show who did the work.'}
        </p>

        {/* ── Step 1: Site name ── */}
        {step === 1 && (
          <div className="space-y-4">
            {/* Demo shortcut banner */}
            <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500">
              <svg className="w-4 h-4 text-blue-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
              </svg>
              To explore the demo, type <strong className="text-slate-700 mx-1">Demo</strong> as the site name — no password needed.
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Site / Organisation <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={siteName}
                onChange={e => { setSiteName(e.target.value); setErr('') }}
                onKeyDown={e => e.key === 'Enter' && handleSiteNext()}
                placeholder="e.g. IXOM, Chevron, Site A"
                className={inputCls(err)}
                autoFocus
              />
              {err && <p className="text-xs text-red-600 mt-1">{err}</p>}
            </div>
            <div className="flex justify-end gap-3 pt-2">
              {current && (
                <button onClick={onClose}
                  className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
              )}
              <button onClick={handleSiteNext}
                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Site password ── */}
        {step === 2 && (
          <div className="space-y-4">
            {siteIsNew && (
              <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
                </svg>
                <p className="text-xs text-blue-700">
                  This is a new site. Set a password that your whole team will use to access <strong>{siteName.trim()}</strong>.
                </p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Site Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={sitePwd}
                  onChange={e => { setSitePwd(e.target.value); setErr('') }}
                  onKeyDown={e => e.key === 'Enter' && (!siteIsNew || sitePwdCfm) && handlePasswordNext()}
                  placeholder={siteIsNew ? 'Set a site password' : 'Enter site password'}
                  className={inputCls(err && !err.includes('match'))}
                  autoFocus
                />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}>
                  <IconEye visible={showPwd} />
                </button>
              </div>
            </div>
            {siteIsNew && (
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={sitePwdCfm}
                  onChange={e => { setSitePwdCfm(e.target.value); setErr('') }}
                  onKeyDown={e => e.key === 'Enter' && handlePasswordNext()}
                  placeholder="Re-enter password"
                  className={inputCls(err && err.includes('match'))}
                />
              </div>
            )}
            {err && <p className="text-xs text-red-600">{err}</p>}
            <div className="flex justify-between gap-3 pt-2">
              <button onClick={() => { setStep(1); setSitePwd(''); setSitePwdCfm(''); setErr('') }}
                className="px-3 py-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">
                ← Back
              </button>
              <button onClick={handlePasswordNext}
                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Personal name + role ── */}
        {step === 3 && (
          <div className="space-y-4">
            {/* Site badge */}
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
              <svg className="w-4 h-4 text-slate-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              <span className="text-xs font-medium text-slate-600">{siteName.trim()}</span>
              {isDemo && (
                <span className="ml-auto text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full">
                  Demo
                </span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={userName}
                onChange={e => { setUserName(e.target.value); setErr('') }}
                onKeyDown={e => e.key === 'Enter' && handleSignIn()}
                placeholder="e.g. John Smith"
                className={inputCls(err)}
                autoFocus
              />
              {err && <p className="text-xs text-red-600 mt-1">{err}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Role</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {ROLES.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
              {(role === 'admin' || role === 'supervisor') && (
                <p className="text-xs text-blue-600 mt-1">This role can approve calibration records.</p>
              )}
            </div>

            <div className="flex justify-between gap-3 pt-2">
              {!isDemo && (
                <button onClick={() => { setStep(siteIsNew || findSite(siteName.trim())?.password ? 2 : 1); setSitePwd(''); setSitePwdCfm(''); setErr('') }}
                  className="px-3 py-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">
                  ← Back
                </button>
              )}
              {isDemo && (
                <button onClick={() => { setStep(1); setErr('') }}
                  className="px-3 py-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">
                  ← Back
                </button>
              )}
              <button onClick={handleSignIn}
                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ml-auto">
                Sign In
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
