/**
 * Calcheq — Calibrator CSV Parser
 *
 * Parses CSV files exported from Beamex (MC6, MC4, MC2) and Fluke
 * (754, 729, 726) documenting calibrators into a structured object
 * that can be submitted as a Calcheq calibration record.
 *
 * Exports:
 *   parseCalibratorkCSV(text)  → { format, tag, date, technician,
 *                                   referenceStandard, testPoints, overallResult, raw }
 *
 * Test point shape:
 *   { pointNumber, nominalInput, asFoundOutput, asLeftOutput,
 *     asFoundErrorPct, asLeftErrorPct, asFoundResult, asLeftResult }
 */

// ─── CSV tokeniser ────────────────────────────────────────────────────────────

/**
 * Splits a CSV line into tokens, respecting quoted fields.
 */
function parseCsvLine(line) {
  const result = []
  let cur = ''
  let inQuote = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuote && line[i + 1] === '"') { cur += '"'; i++ }
      else inQuote = !inQuote
    } else if (ch === ',' && !inQuote) {
      result.push(cur.trim())
      cur = ''
    } else {
      cur += ch
    }
  }
  result.push(cur.trim())
  return result
}

/**
 * Parse full CSV text into an array of token arrays.
 */
function parseCsv(text) {
  return text
    .split(/\r?\n/)
    .map(l => parseCsvLine(l))
}

// ─── Format detection ─────────────────────────────────────────────────────────

/**
 * Heuristically detect whether a CSV is from Beamex, Fluke, or unknown.
 */
function detectFormat(rows) {
  const flat = rows.flat().join(' ').toLowerCase()
  if (flat.includes('beamex') || flat.includes('mc6') || flat.includes('mc4') || flat.includes('mc2')) return 'beamex'
  if (flat.includes('fluke') || flat.includes('754') || flat.includes('729') || flat.includes('726')) return 'fluke'
  // Structural heuristics: Beamex tends to use "As Found" / "As Left" labels
  if (flat.includes('as found') || flat.includes('as-found') || flat.includes('asfound')) return 'beamex'
  if (flat.includes('job id') || flat.includes('jobid')) return 'fluke'
  return 'generic'
}

// ─── Field extractors ─────────────────────────────────────────────────────────

/**
 * Find a value in rows by searching for a label in any cell.
 * e.g. findValue(rows, 'Tag:') returns the cell immediately after "Tag:" in any row.
 */
function findValue(rows, ...labels) {
  const lowerLabels = labels.map(l => l.toLowerCase().replace(/:$/, '').trim())
  for (const row of rows) {
    for (let i = 0; i < row.length; i++) {
      const cell = row[i].toLowerCase().replace(/:$/, '').trim()
      if (lowerLabels.includes(cell) && row[i + 1] !== undefined) {
        const val = row[i + 1].trim()
        if (val) return val
      }
    }
  }
  return null
}

/**
 * Try to parse a date from a variety of formats into ISO yyyy-mm-dd.
 */
function parseDate(str) {
  if (!str) return null
  // Handle DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD, DD-MMM-YYYY, etc.
  const clean = str.trim()

  // Already ISO
  if (/^\d{4}-\d{2}-\d{2}/.test(clean)) return clean.slice(0, 10)

  // DD/MM/YYYY or MM/DD/YYYY
  const slashMatch = clean.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (slashMatch) {
    const [, a, b, y] = slashMatch
    // Assume DD/MM/YYYY (Australian convention)
    const d = parseInt(a), m = parseInt(b)
    if (d > 12) return `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`
    return `${y}-${String(a).padStart(2,'0')}-${String(b).padStart(2,'0')}`
  }

  // DD-MMM-YYYY or DD MMM YYYY
  const monthNames = { jan:1, feb:2, mar:3, apr:4, may:5, jun:6, jul:7, aug:8, sep:9, oct:10, nov:11, dec:12 }
  const textMatch = clean.match(/(\d{1,2})[-\s]([a-zA-Z]{3,})[-\s](\d{4})/)
  if (textMatch) {
    const [, d, mon, y] = textMatch
    const m = monthNames[mon.slice(0,3).toLowerCase()]
    if (m) return `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`
  }

  // Try native Date parse as last resort
  const parsed = new Date(clean)
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10)
  }

  return null
}

/**
 * Normalise a result string to 'pass' | 'fail' | 'marginal'
 */
function normaliseResult(str) {
  if (!str) return null
  const s = str.toLowerCase().trim()
  if (s === 'pass' || s === 'ok' || s === 'p' || s === 'passed') return 'pass'
  if (s === 'fail' || s === 'failed' || s === 'f') return 'fail'
  if (s === 'marginal' || s === 'warning' || s === 'warn' || s === 'w') return 'marginal'
  return null
}

// ─── Test point table detection ───────────────────────────────────────────────

const NUMERIC_RE = /^-?\d+(\.\d+)?$/

/**
 * Find the header row that contains test point column identifiers.
 * Returns { headerRowIndex, columnMap } or null.
 *
 * columnMap: { pointNum, nominalInput, asFoundOutput, asLeftOutput,
 *              errorAfPct, errorAlPct, resultAf, resultAl }
 */
function findTestPointHeader(rows) {
  const candidates = [
    { key: 'pointNum',       terms: ['point', 'pt', 'no', '#', 'step', 'test point', 'seq'] },
    { key: 'nominalInput',   terms: ['nominal', 'ref', 'target', 'set', 'input', 'applied', 'stimulus'] },
    { key: 'asFoundOutput',  terms: ['as found', 'as-found', 'asfound', 'before', 'initial', 'meas af', 'reading af', 'found'] },
    { key: 'asLeftOutput',   terms: ['as left', 'as-left', 'asleft', 'after', 'adjusted', 'meas al', 'reading al', 'left'] },
    { key: 'errorAfPct',     terms: ['error af', 'err af', 'error %', 'error% af', '% error af', 'deviation af', 'dev af'] },
    { key: 'errorAlPct',     terms: ['error al', 'err al', 'error% al', '% error al', 'deviation al'] },
    { key: 'resultAf',       terms: ['result af', 'status af', 'pass/fail af', 'result a/f', 'af result', 'as-found result', 'as found result'] },
    { key: 'resultAl',       terms: ['result al', 'status al', 'pass/fail al', 'result a/l', 'al result', 'as-left result', 'as left result'] },
  ]

  for (let ri = 0; ri < rows.length; ri++) {
    const row = rows[ri]
    const lowerRow = row.map(c => c.toLowerCase().trim())

    // Score this row — how many candidate terms match?
    const columnMap = {}
    let matches = 0

    for (const { key, terms } of candidates) {
      for (let ci = 0; ci < lowerRow.length; ci++) {
        const cell = lowerRow[ci]
        if (terms.some(t => cell.includes(t))) {
          columnMap[key] = ci
          matches++
          break
        }
      }
    }

    // Require at least nominal + asFound to be identifiable
    if (matches >= 2 && columnMap.nominalInput !== undefined && columnMap.asFoundOutput !== undefined) {
      return { headerRowIndex: ri, columnMap }
    }
  }

  return null
}

/**
 * Extract test point rows starting after the header row.
 */
function extractTestPoints(rows, headerRowIndex, columnMap) {
  const points = []
  const { pointNum, nominalInput, asFoundOutput, asLeftOutput, errorAfPct, errorAlPct, resultAf, resultAl } = columnMap

  for (let ri = headerRowIndex + 1; ri < rows.length; ri++) {
    const row = rows[ri]
    if (!row || row.length < 2) break

    // Stop if we hit a non-numeric first meaningful column
    const nominalCell = row[nominalInput]
    if (!nominalCell || !NUMERIC_RE.test(nominalCell.replace(/\s/g, ''))) break

    const nominal = parseFloat(nominalCell)
    if (isNaN(nominal)) break

    const asFound = asFoundOutput !== undefined ? parseFloat(row[asFoundOutput]) : null
    const asLeft  = asLeftOutput  !== undefined ? parseFloat(row[asLeftOutput])  : null

    points.push({
      pointNumber:      pointNum !== undefined ? parseInt(row[pointNum]) || (points.length + 1) : (points.length + 1),
      nominalInput:     nominal,
      asFoundOutput:    isNaN(asFound) ? null : asFound,
      asLeftOutput:     isNaN(asLeft)  ? null : asLeft,
      asFoundErrorPct:  errorAfPct  !== undefined ? parseFloat(row[errorAfPct])  || null : null,
      asLeftErrorPct:   errorAlPct  !== undefined ? parseFloat(row[errorAlPct])  || null : null,
      asFoundResult:    resultAf    !== undefined ? normaliseResult(row[resultAf])  : null,
      asLeftResult:     resultAl    !== undefined ? normaliseResult(row[resultAl])  : null,
    })
  }

  return points
}

// ─── Beamex-specific parser ───────────────────────────────────────────────────

function parseBeamex(rows) {
  const tag         = findValue(rows, 'Tag:', 'Tag', 'Instrument Tag:', 'ID:', 'Position:')
  const rawDate     = findValue(rows, 'Date:', 'Calibration Date:')
  const technician  = findValue(rows, 'Technician:', 'Operator:', 'Performed by:')
  const refStd      = findValue(rows, 'Reference Standard:', 'Ref Standard:', 'Standard:', 'Master:')
  const certNo      = findValue(rows, 'Cert No:', 'Certificate No:', 'Cert Number:', 'Calibration Cert:')
  const serial      = findValue(rows, 'Serial:', 'Serial No:', 'S/N:', 'Ref Serial:')

  const headerInfo = findTestPointHeader(rows)
  let testPoints = []
  let overallResult = null

  if (headerInfo) {
    testPoints = extractTestPoints(rows, headerInfo.headerRowIndex, headerInfo.columnMap)
  }

  // Find overall result
  const overallRow = rows.find(r => r.join(' ').toLowerCase().includes('overall result'))
  if (overallRow) {
    const idx = overallRow.findIndex(c => c.toLowerCase().includes('overall result'))
    if (idx !== -1 && overallRow[idx + 1]) overallResult = normaliseResult(overallRow[idx + 1])
  }

  return {
    format: 'beamex',
    tag,
    date: parseDate(rawDate),
    technician,
    referenceStandard: refStd || null,
    referenceStandardSerial: serial || certNo || null,
    testPoints,
    overallResult: overallResult || deriveOverallResult(testPoints),
  }
}

// ─── Fluke-specific parser ────────────────────────────────────────────────────

function parseFluke(rows) {
  const tag        = findValue(rows, 'Tag:', 'Tag', 'Job ID:', 'Loop Tag:', 'ID:')
  const rawDate    = findValue(rows, 'Date:', 'Test Date:', 'Cal Date:')
  const technician = findValue(rows, 'Technician:', 'Tech:', 'Operator:', 'Performed By:')
  const refStd     = findValue(rows, 'Reference:', 'Reference Standard:', 'Std Desc:')
  const certNo     = findValue(rows, 'Cert No:', 'Certificate:', 'Std Cert:')

  const headerInfo = findTestPointHeader(rows)
  let testPoints = []

  if (headerInfo) {
    testPoints = extractTestPoints(rows, headerInfo.headerRowIndex, headerInfo.columnMap)
  }

  // Fluke stores overall result as "Result:" or "Overall:"
  let overallResult = findValue(rows, 'Result:', 'Overall Result:', 'Overall:', 'Final Result:')
  overallResult = normaliseResult(overallResult) || deriveOverallResult(testPoints)

  return {
    format: 'fluke',
    tag,
    date: parseDate(rawDate),
    technician,
    referenceStandard: refStd || null,
    referenceStandardSerial: certNo || null,
    testPoints,
    overallResult,
  }
}

// ─── Generic fallback parser ──────────────────────────────────────────────────

function parseGeneric(rows) {
  // Try to find tag, date, technician from common label patterns
  const tag        = findValue(rows, 'Tag:', 'Tag', 'Instrument:', 'ID:', 'Equipment:')
  const rawDate    = findValue(rows, 'Date:', 'Calibration Date:', 'Cal Date:')
  const technician = findValue(rows, 'Technician:', 'Tech:', 'Operator:', 'By:')
  const refStd     = findValue(rows, 'Reference:', 'Std:', 'Standard:')

  const headerInfo = findTestPointHeader(rows)
  let testPoints = []

  if (headerInfo) {
    testPoints = extractTestPoints(rows, headerInfo.headerRowIndex, headerInfo.columnMap)
  }

  return {
    format: 'generic',
    tag,
    date: parseDate(rawDate),
    technician,
    referenceStandard: refStd || null,
    referenceStandardSerial: null,
    testPoints,
    overallResult: deriveOverallResult(testPoints),
  }
}

// ─── Derive overall result from test points ───────────────────────────────────

function deriveOverallResult(testPoints) {
  if (!testPoints || testPoints.length === 0) return null
  const results = testPoints.map(p => p.asFoundResult).filter(Boolean)
  if (results.length === 0) return null
  if (results.includes('fail')) return 'fail'
  if (results.includes('marginal')) return 'marginal'
  return 'pass'
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Parse a calibrator CSV string into a structured calibration data object.
 *
 * @param {string} text — raw CSV file content
 * @returns {{
 *   format: 'beamex'|'fluke'|'generic',
 *   tag: string|null,
 *   date: string|null,           // ISO yyyy-mm-dd
 *   technician: string|null,
 *   referenceStandard: string|null,
 *   referenceStandardSerial: string|null,
 *   testPoints: Array<{
 *     pointNumber: number,
 *     nominalInput: number,
 *     asFoundOutput: number|null,
 *     asLeftOutput: number|null,
 *     asFoundErrorPct: number|null,
 *     asLeftErrorPct: number|null,
 *     asFoundResult: 'pass'|'fail'|'marginal'|null,
 *     asLeftResult: 'pass'|'fail'|'marginal'|null,
 *   }>,
 *   overallResult: 'pass'|'fail'|'marginal'|null,
 *   errors: string[],            // any warnings/issues detected
 * }}
 */
export function parseCalibratorCSV(text) {
  const errors = []

  if (!text || !text.trim()) {
    return { format: 'unknown', tag: null, date: null, technician: null,
             referenceStandard: null, referenceStandardSerial: null,
             testPoints: [], overallResult: null, errors: ['File is empty'] }
  }

  const rows = parseCsv(text)
  const format = detectFormat(rows)

  let result
  try {
    if (format === 'beamex') result = parseBeamex(rows)
    else if (format === 'fluke') result = parseFluke(rows)
    else result = parseGeneric(rows)
  } catch (e) {
    return { format, tag: null, date: null, technician: null,
             referenceStandard: null, referenceStandardSerial: null,
             testPoints: [], overallResult: null, errors: [`Parse error: ${e.message}`] }
  }

  // Validation
  if (!result.tag)            errors.push('Could not detect instrument tag — you can enter it manually below')
  if (!result.date)           errors.push('Could not detect calibration date — you can enter it manually below')
  if (!result.technician)     errors.push('Could not detect technician name — you can enter it manually below')
  if (result.testPoints.length === 0) errors.push('No test point data found — ensure the CSV contains a test point table')

  return { ...result, errors }
}
