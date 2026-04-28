/** Shared formatting helpers used across pages. */

export function fmtDate(iso) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  const M = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${+d} ${M[+m - 1]} ${y}`
}

export function fmtDateShort(iso) {
  if (!iso) return '—'
  const [, m, d] = iso.split('-')
  const M = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${+d} ${M[+m - 1]}`
}

export function todayISO() {
  return new Date().toISOString().split('T')[0]
}

export function fmtPct(val, dp = 2) {
  if (val == null) return '—'
  return `${Number(val).toFixed(dp)}%`
}

export function fmtNum(val, dp = 3) {
  if (val == null) return '—'
  return Number(val).toFixed(dp)
}

/** Display-name overrides for tokens whose default title-case form is wrong
 *  (e.g. "ph" → "pH" not "Ph"). Lookup is case-insensitive on the raw key. */
const LABEL_OVERRIDES = {
  ph: 'pH',
  conductivity: 'Conductivity',
}

/** Capitalise + replace underscores. Honours LABEL_OVERRIDES first. */
export function humanise(str) {
  if (!str) return '—'
  const key = String(str).toLowerCase()
  if (LABEL_OVERRIDES[key]) return LABEL_OVERRIDES[key]
  return str.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}
