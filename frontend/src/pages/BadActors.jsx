import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { dashboard as dashApi } from '../utils/api'
import { getUser } from '../utils/userContext'

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function fmtDate(iso) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${+d} ${MONTHS[+m - 1]} ${y}`
}

function resultBadge(result) {
  if (!result) return null
  const map = {
    fail:     'bg-red-100 text-red-700',
    marginal: 'bg-amber-100 text-amber-700',
    pass:     'bg-green-100 text-green-700',
  }
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${map[result] ?? 'bg-slate-100 text-slate-600'}`}>
      {result.charAt(0).toUpperCase() + result.slice(1)}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────

export default function BadActors() {
  const [actors,  setActors]  = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    const site = getUser()?.siteName ?? null
    setLoading(true)
    dashApi.badActors(site)
      .then(data => {
        // API returns an array of bad actor objects
        const list = Array.isArray(data) ? data : (data?.results ?? [])
        setActors(list)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

      {/* ── Header ── */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Link to="/app" className="text-sm text-slate-400 hover:text-slate-600 transition-colors">
            Dashboard
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-sm text-slate-600 font-medium">Bad Actors</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Bad Actors</h1>
        <p className="text-sm text-slate-500 mt-1">
          Instruments ranked by number of as-found failures in the last 12 months.
          These instruments are deviating most from their calibrated set points and warrant priority attention.
        </p>
      </div>

      {/* ── Explainer callout ── */}
      <div className="bg-red-50 border border-red-100 rounded-xl px-5 py-4 mb-6 flex items-start gap-3">
        <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
        <div>
          <p className="text-sm font-semibold text-red-800 mb-0.5">What is a bad actor?</p>
          <p className="text-sm text-red-700 leading-relaxed">
            A bad actor is any instrument that has recorded two or more as-found failures in the last 12 months.
            Repeated failures indicate the instrument is drifting beyond tolerance before its next scheduled calibration —
            it may need a shorter calibration interval, maintenance, or replacement.
          </p>
        </div>
      </div>

      {/* ── Content ── */}
      {loading && (
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse bg-slate-100 rounded-xl h-20" />
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-red-700 text-sm">
          Failed to load bad actors: {error}
        </div>
      )}

      {!loading && !error && actors.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-xl px-8 py-14 text-center">
          <svg className="w-12 h-12 text-green-400 mx-auto mb-3" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.5">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
            <path d="M22 4L12 14.01l-3-3" />
          </svg>
          <p className="text-slate-700 font-semibold mb-1">No bad actors found</p>
          <p className="text-sm text-slate-400">No instruments have recorded 2+ as-found failures in the last 12 months.</p>
        </div>
      )}

      {!loading && !error && actors.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
          {/* Table header */}
          <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wide min-w-[600px]">
            <div className="col-span-1 text-center">Rank</div>
            <div className="col-span-2">Tag</div>
            <div className="col-span-3">Description</div>
            <div className="col-span-2">Area</div>
            <div className="col-span-2">Last Failure</div>
            <div className="col-span-1 text-center">Failures</div>
            <div className="col-span-1 text-center">Last Result</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-slate-100 min-w-[600px]">
            {actors.map((actor, i) => (
              <Link
                key={actor.instrument_id}
                to={`/app/instruments/${actor.instrument_id}`}
                className="grid grid-cols-12 gap-4 px-5 py-4 hover:bg-slate-50 transition-colors items-center"
              >
                {/* Rank */}
                <div className="col-span-1 flex justify-center">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                    ${i === 0 ? 'bg-red-500 text-white' :
                      i === 1 ? 'bg-red-300 text-red-900' :
                      i === 2 ? 'bg-amber-300 text-amber-900' :
                      'bg-slate-100 text-slate-500'}`}>
                    {i + 1}
                  </span>
                </div>

                {/* Tag */}
                <div className="col-span-2">
                  <span className="font-mono font-bold text-sm text-slate-800">{actor.tag_number}</span>
                </div>

                {/* Description */}
                <div className="col-span-3">
                  <span className="text-sm text-slate-600 truncate block">{actor.description || '—'}</span>
                </div>

                {/* Area */}
                <div className="col-span-2">
                  <span className="text-sm text-slate-500">{actor.area || '—'}</span>
                </div>

                {/* Last failure date */}
                <div className="col-span-2">
                  <span className="text-sm text-slate-500 tabular-nums">{fmtDate(actor.last_failure_date)}</span>
                </div>

                {/* Failure count */}
                <div className="col-span-1 flex justify-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-700 text-sm font-bold">
                    {actor.failure_count}
                  </span>
                </div>

                {/* Last result badge */}
                <div className="col-span-1 flex justify-center">
                  {resultBadge(actor.last_as_found_result ?? 'fail')}
                </div>
              </Link>
            ))}
          </div>

          </div>{/* end overflow-x-auto */}
          {/* Footer */}
          <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-400">
            Showing {actors.length} instrument{actors.length !== 1 ? 's' : ''} with repeated as-found failures.
            Click any row to view the full calibration history for that instrument.
          </div>
        </div>
      )}

      {/* ── Recommendations ── */}
      {!loading && !error && actors.length > 0 && (
        <div className="mt-6 bg-amber-50 border border-amber-100 rounded-xl px-5 py-5">
          <h3 className="text-sm font-semibold text-amber-800 mb-3">Recommended actions for bad actors</h3>
          <ul className="space-y-2 text-sm text-amber-700">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 w-4 h-4 rounded-full bg-amber-200 flex items-center justify-center text-amber-800 font-bold text-xs flex-shrink-0">1</span>
              <span>Review the full calibration history for each instrument to identify drift patterns over time.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 w-4 h-4 rounded-full bg-amber-200 flex items-center justify-center text-amber-800 font-bold text-xs flex-shrink-0">2</span>
              <span>Consider shortening the calibration interval for repeat offenders — if a 12-month interval yields consistent failures, try 6 months.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 w-4 h-4 rounded-full bg-amber-200 flex items-center justify-center text-amber-800 font-bold text-xs flex-shrink-0">3</span>
              <span>Inspect the physical installation: impulse lines, ambient temperature, vibration, and process conditions all affect long-term stability.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 w-4 h-4 rounded-full bg-amber-200 flex items-center justify-center text-amber-800 font-bold text-xs flex-shrink-0">4</span>
              <span>If failures persist after re-calibration, raise a corrective maintenance work order to inspect, repair, or replace the instrument.</span>
            </li>
          </ul>
        </div>
      )}

    </div>
  )
}
