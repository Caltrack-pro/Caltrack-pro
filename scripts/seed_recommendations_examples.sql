-- ========================================================
-- Demo seed — Smart Recommendations showcase
-- --------------------------------------------------------
-- Reshapes the calibration history of 6 Riverdale demo instruments so
-- that the /app/diagnostics Recommendations tab surfaces at least one
-- example of every rule type for the public demo account.
--
-- Run AFTER seed_riverdale_demo.sql. Idempotent: deletes then rewrites
-- the calibration history of each touched instrument.
--
-- Covers rule fire-events:
--   CRIT_SAFETY_OVERDUE     — already fires from base seed (FT-101 etc.)
--   CRIT_CANNOT_CALIBRATE   — LS-202 (safety-critical switch left OOT)
--   CRIT_LAST_CAL_OOT       — AT-101 (7.8% as-found error last cal)
--   CRIT_EST_OOT_NOW        — AT-103 (drift history projects current error over tol)
--   CRIT_REPEAT_FAILURE     — AT-102 (3 consecutive as-found failures)
--   ADV_DRIFT_MARGINAL      — already fires from base seed (PT-102, FT-103, etc.)
--   ADV_OVERDUE_NONCRITICAL — already fires from base seed
--   ADV_EST_OOT_30_DAYS     — LT-103 (drift projects OOT within 30 days)
--   OPT_EXTEND_INTERVAL     — PT-105 (3 stable passes under 20% tolerance usage)
-- ========================================================

BEGIN;

-- Helper: reset an instrument's calibration history
CREATE OR REPLACE FUNCTION _demo_clear_cals(p_tag TEXT) RETURNS UUID AS $$
DECLARE
  v_inst_id UUID;
BEGIN
  SELECT id INTO v_inst_id FROM instruments WHERE tag_number = p_tag AND created_by = 'Demo';
  IF v_inst_id IS NULL THEN
    RAISE EXCEPTION 'Demo instrument % not found — run seed_riverdale_demo.sql first', p_tag;
  END IF;
  DELETE FROM cal_test_points WHERE calibration_record_id IN (
    SELECT id FROM calibration_records WHERE instrument_id = v_inst_id
  );
  DELETE FROM calibration_records WHERE instrument_id = v_inst_id;
  RETURN v_inst_id;
END;
$$ LANGUAGE plpgsql;

-- Helper: simple 3-point test-point insert (just for data completeness — the
-- recommendations engine only reads the record-level max_*_error_pct fields).
CREATE OR REPLACE FUNCTION _demo_tp(p_rec UUID, p_err NUMERIC, p_asleft_err NUMERIC, p_asfound_result TEXT, p_asleft_result TEXT, p_lrv NUMERIC, p_urv NUMERIC) RETURNS VOID AS $$
DECLARE
  v_span NUMERIC := p_urv - p_lrv;
  v_err_abs NUMERIC := (p_err / 100.0) * v_span;
  v_left_abs NUMERIC := (p_asleft_err / 100.0) * v_span;
  v_af as_found_result_enum := p_asfound_result::as_found_result_enum;
  v_al as_left_result_enum  := p_asleft_result::as_left_result_enum;
BEGIN
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (p_rec, 1, p_lrv,                   p_lrv,                   p_lrv + v_err_abs,                   p_lrv + v_left_abs,                   v_err_abs, p_err, v_left_abs, p_asleft_err, v_af, v_al);
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (p_rec, 2, p_lrv + v_span/2,        p_lrv + v_span/2,        p_lrv + v_span/2 + v_err_abs,        p_lrv + v_span/2 + v_left_abs,        v_err_abs, p_err, v_left_abs, p_asleft_err, v_af, v_al);
  INSERT INTO cal_test_points (calibration_record_id, point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result)
  VALUES (p_rec, 3, p_urv,                   p_urv,                   p_urv + v_err_abs,                   p_urv + v_left_abs,                   v_err_abs, p_err, v_left_abs, p_asleft_err, v_af, v_al);
END;
$$ LANGUAGE plpgsql;


-- ========================================================
-- 1. LS-202 — "Instrument left out of tolerance — advised to replace"
--    Safety-critical high-level switch. Last calibration could not be
--    brought back in tolerance (as-left FAIL) — instrument needs replacing.
-- ========================================================
DO $$
DECLARE
  v_inst UUID;
  v_rec  UUID;
BEGIN
  v_inst := _demo_clear_cals('LS-202');

  -- Single recent as-left FAIL record
  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type,
    technician_name, reference_standard_description, reference_standard_serial,
    reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    defect_found, defect_description, return_to_service,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst, '2026-03-23', 'routine',
    'James Nguyen', 'Fluke 754 HART Calibrator', 'FL754-22019',
    'NATA-2024-001', '2026-12-31',
    'CAL-WTP-TRE-LS202', true, 'zero_span_trim',
    'Unable to bring switch back within tolerance. Hysteresis exceeds ±2% at both trip points. Recommend replacement.',
    'fail', 'fail',
    3.50, 2.80,
    true, 'Excessive hysteresis / sticky diaphragm', false,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec;
  PERFORM _demo_tp(v_rec, 3.50, 2.80, 'fail', 'fail', 0.0, 1.0);

  -- Update instrument to reflect this most recent cal
  UPDATE instruments SET
    last_calibration_date = '2026-03-23',
    last_calibration_result = 'fail',
    calibration_due_date = '2026-09-19',
    updated_at = NOW()
  WHERE id = v_inst;
END $$;


-- ========================================================
-- 2. AT-101 — "Last calibration >5% out of tolerance"
--    Process-critical turbidity analyser. Recent cal had 7.8% as-found
--    error (major drift), adjusted back to pass as-left.
-- ========================================================
DO $$
DECLARE
  v_inst UUID;
  v_rec  UUID;
BEGIN
  v_inst := _demo_clear_cals('AT-101');

  -- Older pass record (for history)
  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type, technician_name,
    reference_standard_description, reference_standard_serial,
    reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst, '2025-10-15', 'routine', 'Sarah Mitchell',
    'Hach 2100AN Turbidimeter Reference', 'HC-2100-4401',
    'NATA-2025-009', '2027-05-31',
    'CAL-WTP-INT-AT101', false,
    'pass', 'pass', 0.55, 0.55,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec;
  PERFORM _demo_tp(v_rec, 0.55, 0.55, 'pass', 'pass', 0.0, 100.0);

  -- Recent cal — 7.8% as-found error, adjusted to pass
  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type, technician_name,
    reference_standard_description, reference_standard_serial,
    reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    defect_found, defect_description, return_to_service,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst, '2026-04-12', 'routine', 'Tom Barker',
    'Hach 2100AN Turbidimeter Reference', 'HC-2100-4401',
    'NATA-2025-009', '2027-05-31',
    'CAL-WTP-INT-AT101', true, 'zero_span_trim',
    'Significant drift discovered — as-found error 7.8% of span. Sensor fouling suspected; cleaned, re-ranged, now within tolerance.',
    'fail', 'pass',
    7.80, 0.45,
    true, 'Sensor fouling / biofilm buildup', true,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec;
  PERFORM _demo_tp(v_rec, 7.80, 0.45, 'fail', 'pass', 0.0, 100.0);

  UPDATE instruments SET
    last_calibration_date = '2026-04-12',
    last_calibration_result = 'pass',
    calibration_due_date = '2026-07-11',
    updated_at = NOW()
  WHERE id = v_inst;
END $$;


-- ========================================================
-- 3. AT-103 — "Estimated to be out of tolerance now"
--    Standard DO analyser, tol ±2.0%, 180-day interval.
--    Drift history 0.2% → 1.9% across 5 records; 143 days since last cal
--    projects current error ≈ 2.24% (over tolerance).
-- ========================================================
DO $$
DECLARE
  v_inst UUID;
  v_rec  UUID;
BEGIN
  v_inst := _demo_clear_cals('AT-103');

  -- 5 records showing clear upward drift trajectory
  FOR i IN 0..4 LOOP
    INSERT INTO calibration_records (
      instrument_id, calibration_date, calibration_type, technician_name,
      reference_standard_description, reference_standard_serial,
      reference_standard_cert_number, reference_standard_cert_expiry,
      procedure_used, adjustment_made,
      as_found_result, as_left_result,
      max_as_found_error_pct, max_as_left_error_pct,
      record_status, approved_by, approved_at
    ) VALUES (
      v_inst,
      (DATE '2023-12-01' + (i * INTERVAL '180 days'))::date,
      'routine', 'Sarah Mitchell',
      'WTW IQ SensorNet DO Reference', 'WT-IQ-7702',
      'NATA-2024-003', '2026-12-31',
      'CAL-WTP-INT-AT103', false,
      (CASE WHEN i < 4 THEN 'pass' ELSE 'marginal' END)::as_found_result_enum,
      'pass'::as_left_result_enum,
      (0.20 + i * 0.425)::numeric(6,3),
      (0.18 + i * 0.400)::numeric(6,3),
      'approved', 'Emily Walsh', NOW()
    ) RETURNING id INTO v_rec;
    PERFORM _demo_tp(v_rec,
      (0.20 + i * 0.425)::numeric(6,3),
      (0.18 + i * 0.400)::numeric(6,3),
      CASE WHEN i < 4 THEN 'pass' ELSE 'marginal' END,
      'pass',
      0.0, 20.0);
  END LOOP;

  UPDATE instruments SET
    last_calibration_date = '2025-11-30',
    last_calibration_result = 'marginal',
    calibration_due_date = '2026-05-29',
    updated_at = NOW()
  WHERE id = v_inst;
END $$;


-- ========================================================
-- 4. AT-102 — "3+ consecutive as-found failures"
--    Process-critical pH analyser, 90-day interval. 3 consecutive failures
--    across the last 9 months — a genuine bad actor.
-- ========================================================
DO $$
DECLARE
  v_inst UUID;
  v_rec  UUID;
BEGIN
  v_inst := _demo_clear_cals('AT-102');

  -- One earlier pass (establishes that failures are a recent trend)
  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type, technician_name,
    reference_standard_description, reference_standard_serial,
    reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst, '2025-04-18', 'routine', 'James Nguyen',
    'YSI pH Calibration Buffer Kit', 'YSI-BK-3021',
    'NATA-2024-004', '2026-12-31',
    'CAL-WTP-INT-AT102', false,
    'pass', 'pass', 0.32, 0.32,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec;
  PERFORM _demo_tp(v_rec, 0.32, 0.32, 'pass', 'pass', 4.0, 10.0);

  -- Three consecutive as-found FAIL records
  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type, technician_name,
    reference_standard_description, reference_standard_serial,
    reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    defect_found, defect_description,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst, '2025-07-20', 'routine', 'Tom Barker',
    'YSI pH Calibration Buffer Kit', 'YSI-BK-3021',
    'NATA-2024-004', '2026-12-31',
    'CAL-WTP-INT-AT102', true, 'zero_span_trim',
    'Failed as-found at 1.35%. Electrode re-slope performed.',
    'fail', 'pass', 1.35, 0.45,
    true, 'Ageing pH electrode',
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec;
  PERFORM _demo_tp(v_rec, 1.35, 0.45, 'fail', 'pass', 4.0, 10.0);

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type, technician_name,
    reference_standard_description, reference_standard_serial,
    reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    defect_found, defect_description,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst, '2025-10-19', 'routine', 'Sarah Mitchell',
    'YSI pH Calibration Buffer Kit', 'YSI-BK-3021',
    'NATA-2024-004', '2026-12-31',
    'CAL-WTP-INT-AT102', true, 'zero_span_trim',
    'Failed as-found again at 1.82%. Electrode replaced, re-calibrated.',
    'fail', 'pass', 1.82, 0.38,
    true, 'pH electrode replaced (2nd failure in a row)',
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec;
  PERFORM _demo_tp(v_rec, 1.82, 0.38, 'fail', 'pass', 4.0, 10.0);

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type, technician_name,
    reference_standard_description, reference_standard_serial,
    reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made, adjustment_type, adjustment_notes,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    defect_found, defect_description,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst, '2026-01-17', 'routine', 'Tom Barker',
    'YSI pH Calibration Buffer Kit', 'YSI-BK-3021',
    'NATA-2025-002', '2027-02-28',
    'CAL-WTP-INT-AT102', true, 'zero_span_trim',
    'Third consecutive as-found failure at 2.1%. Installation inspection recommended (process wash routine may be damaging the sensor).',
    'fail', 'pass', 2.10, 0.55,
    true, 'Chronic failure pattern — escalate to process team',
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec;
  PERFORM _demo_tp(v_rec, 2.10, 0.55, 'fail', 'pass', 4.0, 10.0);

  UPDATE instruments SET
    last_calibration_date = '2026-01-17',
    last_calibration_result = 'pass',
    calibration_due_date = '2026-04-17',
    updated_at = NOW()
  WHERE id = v_inst;
END $$;


-- ========================================================
-- 5. LT-103 — "Projected to exceed tolerance in <30 days"
--    Process-critical level transmitter, tol ±0.5%, 180-day interval.
--    3-point drift history: projected current error 0.495% with ~10 days
--    until it crosses 0.5% tolerance.
-- ========================================================
DO $$
DECLARE
  v_inst UUID;
  v_rec  UUID;
BEGIN
  v_inst := _demo_clear_cals('LT-103');

  -- Three records: 0.30, 0.40, 0.48 spaced 180 days apart ending 30 days ago
  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type, technician_name,
    reference_standard_description, reference_standard_serial,
    reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst, '2025-03-27', 'routine', 'James Nguyen',
    'Rosemount 3300 Reference Calibrator', 'RS-3300-2210',
    'NATA-2024-005', '2026-12-31',
    'CAL-WTP-INT-LT103', false,
    'pass', 'pass', 0.30, 0.30,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec;
  PERFORM _demo_tp(v_rec, 0.30, 0.30, 'pass', 'pass', 0.0, 10.0);

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type, technician_name,
    reference_standard_description, reference_standard_serial,
    reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst, '2025-09-23', 'routine', 'Sarah Mitchell',
    'Rosemount 3300 Reference Calibrator', 'RS-3300-2210',
    'NATA-2024-005', '2026-12-31',
    'CAL-WTP-INT-LT103', false,
    'pass', 'pass', 0.40, 0.40,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec;
  PERFORM _demo_tp(v_rec, 0.40, 0.40, 'pass', 'pass', 0.0, 10.0);

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type, technician_name,
    reference_standard_description, reference_standard_serial,
    reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst, '2026-03-23', 'routine', 'Tom Barker',
    'Rosemount 3300 Reference Calibrator', 'RS-3300-2210',
    'NATA-2025-003', '2027-06-30',
    'CAL-WTP-INT-LT103', false,
    'marginal', 'pass', 0.48, 0.48,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec;
  PERFORM _demo_tp(v_rec, 0.48, 0.48, 'marginal', 'pass', 0.0, 10.0);

  UPDATE instruments SET
    last_calibration_date = '2026-03-23',
    last_calibration_result = 'marginal',
    calibration_due_date = '2026-09-19',
    updated_at = NOW()
  WHERE id = v_inst;
END $$;


-- ========================================================
-- 6. PT-105 — "Consistently stable — consider extending interval"
--    Process-critical pressure transmitter, tol ±0.5%, 180-day interval.
--    Last 3 calibrations all passed with peak 0.06% (12% of tolerance used).
-- ========================================================
DO $$
DECLARE
  v_inst UUID;
  v_rec  UUID;
BEGIN
  v_inst := _demo_clear_cals('PT-105');

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type, technician_name,
    reference_standard_description, reference_standard_serial,
    reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst, '2025-03-07', 'routine', 'James Nguyen',
    'Fluke 754 HART Calibrator', 'FL754-22019',
    'NATA-2024-001', '2026-12-31',
    'CAL-WTP-INT-PT105', false,
    'pass', 'pass', 0.04, 0.04,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec;
  PERFORM _demo_tp(v_rec, 0.04, 0.04, 'pass', 'pass', 0.0, 1000.0);

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type, technician_name,
    reference_standard_description, reference_standard_serial,
    reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst, '2025-09-06', 'routine', 'Sarah Mitchell',
    'Beamex MC6 Multifunction', 'BX-MC6-8812',
    'NATA-2024-002', '2026-09-30',
    'CAL-WTP-INT-PT105', false,
    'pass', 'pass', 0.05, 0.05,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec;
  PERFORM _demo_tp(v_rec, 0.05, 0.05, 'pass', 'pass', 0.0, 1000.0);

  INSERT INTO calibration_records (
    instrument_id, calibration_date, calibration_type, technician_name,
    reference_standard_description, reference_standard_serial,
    reference_standard_cert_number, reference_standard_cert_expiry,
    procedure_used, adjustment_made,
    as_found_result, as_left_result,
    max_as_found_error_pct, max_as_left_error_pct,
    record_status, approved_by, approved_at
  ) VALUES (
    v_inst, '2026-03-07', 'routine', 'Tom Barker',
    'Druck DPI 610', 'DR-6101-5543',
    'NATA-2025-001', '2027-03-31',
    'CAL-WTP-INT-PT105', false,
    'pass', 'pass', 0.06, 0.06,
    'approved', 'Emily Walsh', NOW()
  ) RETURNING id INTO v_rec;
  PERFORM _demo_tp(v_rec, 0.06, 0.06, 'pass', 'pass', 0.0, 1000.0);

  UPDATE instruments SET
    last_calibration_date = '2026-03-07',
    last_calibration_result = 'pass',
    calibration_due_date = '2026-09-03',
    updated_at = NOW()
  WHERE id = v_inst;
END $$;


-- Cleanup helpers so we don't leave demo-only functions in the DB
DROP FUNCTION IF EXISTS _demo_clear_cals(TEXT);
DROP FUNCTION IF EXISTS _demo_tp(UUID, NUMERIC, NUMERIC, TEXT, TEXT, NUMERIC, NUMERIC);

COMMIT;
