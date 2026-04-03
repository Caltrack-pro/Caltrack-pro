/**
 * Client-side mirror of backend/calibration_engine.py
 * Implements the exact same formulas so the calibration form
 * shows live pass/fail results as the technician types.
 */

export function toleranceAbs(toleranceType, toleranceValue, outputSpan, expectedOutput) {
  if (toleranceType === 'percent_span')    return (toleranceValue / 100) * outputSpan
  if (toleranceType === 'percent_reading') return (toleranceValue / 100) * Math.abs(expectedOutput)
  if (toleranceType === 'absolute')        return toleranceValue
  return Infinity
}

/** Returns 'pass' | 'marginal' | 'fail' */
export function pointResult(errorAbs, tol) {
  const marginal = tol * 0.8
  if (Math.abs(errorAbs) > tol)     return 'fail'
  if (Math.abs(errorAbs) > marginal) return 'marginal'
  return 'pass'
}

/**
 * Calculate a single test-point result.
 * Returns null if actualOutput is empty / not a number.
 */
export function calcPoint(actualOutput, expectedOutput, toleranceType, toleranceValue, outputSpan) {
  const actual = parseFloat(actualOutput)
  if (isNaN(actual)) return null

  const tol      = toleranceAbs(toleranceType, toleranceValue, outputSpan, expectedOutput)
  const errorAbs = actual - expectedOutput
  const errorPct = (errorAbs / outputSpan) * 100
  const result   = pointResult(errorAbs, tol)

  return { errorAbs, errorPct, result, tol }
}

/** Aggregate per-point results → overall result string */
export function overallResult(pointResults) {
  const valid = pointResults.filter(r => r !== null && r !== undefined)
  if (!valid.length) return null
  if (valid.includes('fail'))     return 'fail'
  if (valid.includes('marginal')) return 'marginal'
  return 'pass'
}

/** Max absolute error_pct across points (null if none calculated) */
export function maxErrorPct(points) {
  const vals = points.filter(p => p?.errorPct != null).map(p => Math.abs(p.errorPct))
  return vals.length ? Math.max(...vals) : null
}

/**
 * Generate default test-point expected values for an instrument.
 * Uses test_point_values if set, otherwise generates n evenly-spaced
 * points across [lrv, urv].
 */
export function generateTestPoints(instrument) {
  const { measurement_lrv: lrv, measurement_urv: urv, num_test_points: n, test_point_values } = instrument
  if (lrv == null || urv == null) return []

  const span = urv - lrv
  const count = n || 5

  if (test_point_values && test_point_values.length === count) {
    return test_point_values.map((v, i) => ({
      point_number:    i + 1,
      nominal_input:   v,
      expected_output: v,  // linear: input value = expected output value (in EU)
    }))
  }

  return Array.from({ length: count }, (_, i) => {
    const pct    = i / (count - 1)
    const val    = lrv + pct * span
    return {
      point_number:    i + 1,
      nominal_input:   parseFloat(val.toFixed(4)),
      expected_output: parseFloat(val.toFixed(4)),
    }
  })
}
