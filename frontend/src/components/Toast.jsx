/**
 * Toast notification system.
 * Usage:
 *   import { useToast, ToastContainer } from '../components/Toast'
 *   const { toasts, showToast } = useToast()
 *   showToast('Saved!', 'success')
 *   <ToastContainer toasts={toasts} onDismiss={dismissToast} />
 */

import { useState, useCallback } from 'react'

let _nextId = 1

// ── Icons ──────────────────────────────────────────────────────────────────────

function IconCheck() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

function IconX() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}

function IconInfo() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  )
}

function IconWarn() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  )
}

// ── Style maps ────────────────────────────────────────────────────────────────

const STYLES = {
  success: {
    container: 'bg-green-600 text-white',
    icon:      <IconCheck />,
  },
  error: {
    container: 'bg-red-600 text-white',
    icon:      <IconX />,
  },
  warning: {
    container: 'bg-amber-500 text-white',
    icon:      <IconWarn />,
  },
  info: {
    container: 'bg-slate-800 text-white',
    icon:      <IconInfo />,
  },
}

// ── Single toast item ─────────────────────────────────────────────────────────

function Toast({ id, message, type = 'info', onDismiss }) {
  const { container, icon } = STYLES[type] ?? STYLES.info
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg min-w-[260px] max-w-sm
                  text-sm font-medium cursor-pointer select-none
                  animate-fade-in-up ${container}`}
      onClick={() => onDismiss(id)}
      role="alert"
    >
      <span className="flex-shrink-0 opacity-90">{icon}</span>
      <span className="flex-1">{message}</span>
      <button
        onClick={e => { e.stopPropagation(); onDismiss(id) }}
        className="ml-1 opacity-60 hover:opacity-100 transition-opacity flex-shrink-0"
        aria-label="Dismiss"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

// ── Container ─────────────────────────────────────────────────────────────────

export function ToastContainer({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className="pointer-events-auto">
          <Toast {...t} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  )
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useToast(autoHideMs = 4000) {
  const [toasts, setToasts] = useState([])

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const showToast = useCallback((message, type = 'info') => {
    const id = _nextId++
    setToasts(prev => [...prev, { id, message, type }])
    if (autoHideMs > 0) {
      setTimeout(() => dismissToast(id), autoHideMs)
    }
    return id
  }, [autoHideMs, dismissToast])

  return { toasts, showToast, dismissToast }
}
