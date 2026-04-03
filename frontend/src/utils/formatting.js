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

/** Capitalise + replace underscores */
export function humanise(str) {
  if (!str) return '—'
  return str.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}
