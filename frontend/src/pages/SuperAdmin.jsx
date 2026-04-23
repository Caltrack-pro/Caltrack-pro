/**
 * Platform Admin console — /app/admin
 *
 * Visible only to super-admins (email in SUPERADMIN_EMAILS env var, surfaced
 * via /api/auth/me → user.isSuperadmin). The route is gated inline in App.jsx
 * and renders 404 to non-super-admins rather than a friendly redirect, so the
 * URL doesn't advertise its existence.
 *
 * Actions: Extend trial, Override plan, Pause / Resume, Impersonate, Delete.
 * Impersonation wiring lives in Phase 3 — this file exposes the button and a
 * stub handler that's filled in when the header + banner land.
 */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { admin } from '../utils/api'
import { startImpersonation } from '../utils/userContext'

// Brand colours from CLAUDE.md
const NAVY   = '#0B1F3A'
const RED    = '#EF4444'
const AMBER  = '#F59E0B'
const GREEN  = '#22C55E'
const BLUE   = '#3B82F6'

function statusBadge(status) {
  const map = {
    trialing:   { bg: '#FEF3C7', fg: '#92400E', label: 'Trial'     },
    active:     { bg: '#DCFCE7', fg: '#166534', label: 'Active'    },
    past_due:   { bg: '#FEE2E2', fg: '#991B1B', label: 'Past due'  },
    cancelled:  { bg: '#F3F4F6', fg: '#374151', label: 'Cancelled' },
    incomplete: { bg: '#E0E7FF', fg: '#3730A3', label: 'Incomplete'},
  }
  const s = map[status] ?? { bg: '#F3F4F6', fg: '#374151', label: status ?? '—' }
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: 6,
      fontSize: '0.7rem',
      fontWeight: 600,
      background: s.bg,
      color: s.fg,
    }}>{s.label}</span>
  )
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' })
}

function daysUntil(iso) {
  if (!iso) return null
  const ms = new Date(iso).getTime() - Date.now()
  return Math.ceil(ms / 86_400_000)
}

// ---------------------------------------------------------------------------
// Modals — extend trial, override plan, delete confirm
// ---------------------------------------------------------------------------

function ModalShell({ title, onClose, children }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 12, width: '100%', maxWidth: 460,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)', overflow: 'hidden',
        }}
      >
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #E5E7EB',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: NAVY }}>{title}</h3>
          <button onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer',
                     fontSize: '1.2rem', color: '#6B7280', padding: 0 }}
          >×</button>
        </div>
        <div style={{ padding: 20 }}>{children}</div>
      </div>
    </div>
  )
}

function ExtendTrialModal({ site, onClose, onDone }) {
  const [mode, setMode] = useState('days')
  const [days, setDays]   = useState(30)
  const [date, setDate]   = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 30); return d.toISOString().slice(0, 10)
  })
  const [busy, setBusy] = useState(false)
  const [err,  setErr]  = useState(null)

  async function submit() {
    setBusy(true); setErr(null)
    try {
      const body = mode === 'days'
        ? { days: Number(days) }
        : { new_end_date: new Date(date + 'T00:00:00Z').toISOString() }
      await admin.extendTrial(site.id, body)
      onDone()
    } catch (e) {
      setErr(e.detail ?? e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <ModalShell title={`Extend trial — ${site.name}`} onClose={onClose}>
      <p style={{ margin: '0 0 14px', fontSize: '0.85rem', color: '#475569' }}>
        DB-only override. Stripe is not touched. Sets status to <strong>trialing</strong>.
      </p>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <button onClick={() => setMode('days')}
          style={pillBtn(mode === 'days')}>By days</button>
        <button onClick={() => setMode('date')}
          style={pillBtn(mode === 'date')}>To specific date</button>
      </div>
      {mode === 'days' ? (
        <label style={label}>
          <span>Days to add</span>
          <input type="number" min={1} max={3650} value={days}
                 onChange={(e) => setDays(e.target.value)} style={input} />
        </label>
      ) : (
        <label style={label}>
          <span>New trial end date</span>
          <input type="date" value={date}
                 onChange={(e) => setDate(e.target.value)} style={input} />
        </label>
      )}
      {err && <p style={errText}>{err}</p>}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
        <button onClick={onClose} style={btnGhost} disabled={busy}>Cancel</button>
        <button onClick={submit} style={btnPrimary} disabled={busy}>
          {busy ? 'Extending…' : 'Extend trial'}
        </button>
      </div>
    </ModalShell>
  )
}

function OverridePlanModal({ site, onClose, onDone }) {
  const [plan,     setPlan]     = useState(site.subscription_plan     || 'professional')
  const [interval, setInterval] = useState(site.subscription_interval || 'monthly')
  const [busy, setBusy] = useState(false)
  const [err,  setErr]  = useState(null)

  async function submit() {
    setBusy(true); setErr(null)
    try {
      await admin.overridePlan(site.id, plan, interval)
      onDone()
    } catch (e) {
      setErr(e.detail ?? e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <ModalShell title={`Override plan — ${site.name}`} onClose={onClose}>
      <p style={{ margin: '0 0 14px', fontSize: '0.85rem', color: '#475569' }}>
        DB-only — does not charge Stripe. For goodwill upgrades and non-Stripe pilots.
      </p>
      <label style={label}>
        <span>Plan</span>
        <select value={plan} onChange={(e) => setPlan(e.target.value)} style={input}>
          <option value="starter">Starter ($199)</option>
          <option value="professional">Professional ($449)</option>
          <option value="enterprise">Enterprise ($899)</option>
        </select>
      </label>
      <label style={label}>
        <span>Interval</span>
        <select value={interval} onChange={(e) => setInterval(e.target.value)} style={input}>
          <option value="monthly">Monthly</option>
          <option value="annual">Annual</option>
        </select>
      </label>
      {err && <p style={errText}>{err}</p>}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
        <button onClick={onClose} style={btnGhost} disabled={busy}>Cancel</button>
        <button onClick={submit} style={btnPrimary} disabled={busy}>
          {busy ? 'Saving…' : 'Override plan'}
        </button>
      </div>
    </ModalShell>
  )
}

function DeleteSiteModal({ site, onClose, onDone }) {
  const [typed, setTyped] = useState('')
  const [busy, setBusy]   = useState(false)
  const [err,  setErr]    = useState(null)
  const ok = typed === site.name

  async function submit() {
    setBusy(true); setErr(null)
    try {
      await admin.deleteSite(site.id, site.name)
      onDone()
    } catch (e) {
      setErr(e.detail ?? e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <ModalShell title={`Delete site — ${site.name}`} onClose={onClose}>
      <div style={{
        background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8,
        padding: 12, marginBottom: 14, fontSize: '0.82rem', color: '#7F1D1D',
      }}>
        This will permanently delete <strong>{site.instrument_count}</strong> instruments,
        their calibration history, documents, and <strong>{site.member_count}</strong> members.
        Cannot be undone.
      </div>
      <label style={label}>
        <span>Type <strong>{site.name}</strong> to confirm</span>
        <input value={typed} onChange={(e) => setTyped(e.target.value)}
               style={input} placeholder={site.name} autoFocus />
      </label>
      {err && <p style={errText}>{err}</p>}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
        <button onClick={onClose} style={btnGhost} disabled={busy}>Cancel</button>
        <button onClick={submit}
                style={{ ...btnPrimary, background: ok ? RED : '#FCA5A5', cursor: ok ? 'pointer' : 'not-allowed' }}
                disabled={!ok || busy}>
          {busy ? 'Deleting…' : 'Delete permanently'}
        </button>
      </div>
    </ModalShell>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function SuperAdmin() {
  const navigate = useNavigate()
  const [sites, setSites]   = useState([])
  const [loading, setLoad]  = useState(true)
  const [err,  setErr]      = useState(null)
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey]   = useState('last_activity')
  const [sortDir, setSortDir]   = useState('desc')
  const [modal, setModal]       = useState(null) // { kind, site }

  async function load() {
    setLoad(true); setErr(null)
    try {
      const data = await admin.listSites()
      setSites(data?.results ?? [])
    } catch (e) {
      setErr(e.detail ?? e.message)
    } finally {
      setLoad(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const rows = q
      ? sites.filter((s) =>
          s.name?.toLowerCase().includes(q) ||
          (s.subscription_plan   ?? '').toLowerCase().includes(q) ||
          (s.subscription_status ?? '').toLowerCase().includes(q))
      : sites.slice()

    rows.sort((a, b) => {
      const av = a[sortKey]; const bv = b[sortKey]
      if (av == null && bv == null) return 0
      if (av == null) return 1
      if (bv == null) return -1
      const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv))
      return sortDir === 'asc' ? cmp : -cmp
    })
    return rows
  }, [sites, search, sortKey, sortDir])

  function toggleSort(key) {
    if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  async function onPause(site) {
    await admin.pause(site.id); await load()
  }
  async function onResume(site) {
    await admin.resume(site.id); await load()
  }
  async function onImpersonate(site) {
    // Order matters: record the audit marker BEFORE setting the header so the
    // impersonate-start row carries the super-admin's real identity (no
    // X-Impersonate-Site-Id on that call). Only then do we flip sessionStorage,
    // which causes every subsequent API request to send the header and be
    // scoped to the target site. A hard navigate ensures the Dashboard query
    // runs fresh under the impersonated identity.
    try {
      await admin.impersonateStart(site.id)
    } catch (e) {
      alert(`Could not start impersonation: ${e.detail ?? e.message}`)
      return
    }
    startImpersonation(site.id, site.name)
    navigate('/app')
  }

  return (
    <div style={{ padding: '20px 24px', maxWidth: 1400 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: NAVY }}>
            👑 Platform Admin
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748B' }}>
            Every site in CalCheq. Extend trials, override plans, impersonate, delete.
          </p>
        </div>
        <button onClick={load} style={btnGhost} disabled={loading}>
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 14 }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search sites by name, plan, or status…"
          style={{
            width: '100%', maxWidth: 420,
            padding: '8px 12px', borderRadius: 8,
            border: '1px solid #CBD5E1', fontSize: '0.88rem',
          }}
        />
      </div>

      {err && (
        <div style={{
          background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8,
          padding: 12, marginBottom: 14, fontSize: '0.85rem', color: '#7F1D1D',
        }}>{err}</div>
      )}

      {/* Table */}
      <div style={{
        background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10,
        overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
              {th('name',                'Site',         sortKey, sortDir, toggleSort)}
              {th('subscription_status', 'Status',       sortKey, sortDir, toggleSort)}
              {th('subscription_plan',   'Plan',         sortKey, sortDir, toggleSort)}
              {th('trial_ends_at',       'Trial ends',   sortKey, sortDir, toggleSort)}
              {th('instrument_count',    'Instruments',  sortKey, sortDir, toggleSort, 'right')}
              {th('member_count',        'Members',      sortKey, sortDir, toggleSort, 'right')}
              {th('last_activity',       'Last activity',sortKey, sortDir, toggleSort)}
              <th style={{ ...thStyle, textAlign: 'right', cursor: 'default' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={8} style={{ padding: 24, textAlign: 'center', color: '#94A3B8' }}>
                Loading sites…
              </td></tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={8} style={{ padding: 24, textAlign: 'center', color: '#94A3B8' }}>
                No sites match.
              </td></tr>
            )}
            {!loading && filtered.map((s) => {
              const until = daysUntil(s.trial_ends_at)
              return (
                <tr key={s.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={tdStyle}>
                    <div style={{ fontWeight: 600, color: NAVY }}>{s.name}</div>
                    <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{formatDate(s.created_at)}</div>
                  </td>
                  <td style={tdStyle}>{statusBadge(s.subscription_status)}</td>
                  <td style={tdStyle}>
                    <div style={{ textTransform: 'capitalize' }}>{s.subscription_plan ?? '—'}</div>
                    {s.subscription_interval && (
                      <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{s.subscription_interval}</div>
                    )}
                  </td>
                  <td style={tdStyle}>
                    <div>{formatDate(s.trial_ends_at)}</div>
                    {until != null && (
                      <div style={{
                        fontSize: '0.72rem',
                        color: until < 0 ? RED : until < 7 ? AMBER : '#94A3B8',
                      }}>
                        {until < 0 ? `${-until}d ago` : `in ${until}d`}
                      </div>
                    )}
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>{s.instrument_count}</td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>{s.member_count}</td>
                  <td style={tdStyle}>{formatDate(s.last_activity)}</td>
                  <td style={{ ...tdStyle, textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button style={actionBtn} onClick={() => setModal({ kind: 'trial',  site: s })}>Trial</button>
                    <button style={actionBtn} onClick={() => setModal({ kind: 'plan',   site: s })}>Plan</button>
                    {s.subscription_status === 'cancelled'
                      ? <button style={{ ...actionBtn, color: GREEN }} onClick={() => onResume(s)}>Resume</button>
                      : <button style={{ ...actionBtn, color: AMBER }} onClick={() => onPause(s)}>Pause</button>}
                    <button style={{ ...actionBtn, color: BLUE }} onClick={() => onImpersonate(s)}>Impersonate</button>
                    <button style={{ ...actionBtn, color: RED }}  onClick={() => setModal({ kind: 'delete', site: s })}>Delete</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {modal?.kind === 'trial' && (
        <ExtendTrialModal site={modal.site}
          onClose={() => setModal(null)}
          onDone={() => { setModal(null); load() }}
        />
      )}
      {modal?.kind === 'plan' && (
        <OverridePlanModal site={modal.site}
          onClose={() => setModal(null)}
          onDone={() => { setModal(null); load() }}
        />
      )}
      {modal?.kind === 'delete' && (
        <DeleteSiteModal site={modal.site}
          onClose={() => setModal(null)}
          onDone={() => { setModal(null); load() }}
        />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Inline styles
// ---------------------------------------------------------------------------

const thStyle = {
  textAlign: 'left', padding: '10px 14px',
  fontSize: '0.72rem', fontWeight: 700,
  textTransform: 'uppercase', letterSpacing: '0.5px',
  color: '#64748B', cursor: 'pointer', userSelect: 'none',
}
const tdStyle = { padding: '10px 14px', verticalAlign: 'middle', color: '#1E293B' }

function th(key, label, sortKey, sortDir, onClick, align = 'left') {
  const active = sortKey === key
  return (
    <th onClick={() => onClick(key)} style={{ ...thStyle, textAlign: align }}>
      {label}
      {active && <span style={{ marginLeft: 4 }}>{sortDir === 'asc' ? '▲' : '▼'}</span>}
    </th>
  )
}

const label = {
  display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12,
  fontSize: '0.82rem', color: '#334155',
}
const input = {
  padding: '8px 10px', borderRadius: 6, border: '1px solid #CBD5E1',
  fontSize: '0.88rem', width: '100%',
}
const errText = { margin: '8px 0 0', color: RED, fontSize: '0.82rem' }

const btnPrimary = {
  padding: '8px 14px', borderRadius: 6, border: 'none',
  background: BLUE, color: '#fff', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
}
const btnGhost = {
  padding: '8px 14px', borderRadius: 6,
  border: '1px solid #CBD5E1', background: '#fff',
  color: '#334155', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer',
}
const actionBtn = {
  background: 'none', border: 'none', cursor: 'pointer',
  color: NAVY, fontSize: '0.78rem', fontWeight: 600,
  padding: '4px 8px', borderRadius: 4,
}
function pillBtn(active) {
  return {
    padding: '6px 12px', borderRadius: 999,
    border: active ? `1px solid ${BLUE}` : '1px solid #CBD5E1',
    background: active ? 'rgba(59,130,246,0.1)' : '#fff',
    color: active ? BLUE : '#334155',
    fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
  }
}
