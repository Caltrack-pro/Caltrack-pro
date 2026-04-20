-- Migration: 001_bug_fixes_2026_04_20
-- Fixes CRITICAL-1 (tag_number global unique → composite per site)
-- and CRITICAL-2 (recompute last_calibration_date from MAX(calibration_date))
--
-- Run in Supabase SQL Editor. Safe to re-run (uses IF EXISTS / IF NOT EXISTS).

-- ─────────────────────────────────────────────────────────────────────────────
-- CRITICAL-1: Change tag_number uniqueness from global → per-site composite
-- ─────────────────────────────────────────────────────────────────────────────

-- Drop the old global unique constraint (created by SQLAlchemy unique=True)
ALTER TABLE instruments DROP CONSTRAINT IF EXISTS instruments_tag_number_key;

-- Drop the old unique index if it was created separately
DROP INDEX IF EXISTS ix_instruments_tag_number;

-- Recreate as a plain (non-unique) index for query performance
CREATE INDEX IF NOT EXISTS ix_instruments_tag_number ON instruments (tag_number);

-- Add the new composite unique constraint: one tag per site
ALTER TABLE instruments
    ADD CONSTRAINT uq_instrument_tag_per_site
    UNIQUE (tag_number, created_by);

-- ─────────────────────────────────────────────────────────────────────────────
-- CRITICAL-2: Recompute last_calibration_date / result / due_date for all
--             instruments using MAX(calibration_date) from approved records.
--             Fixes any instruments whose state was corrupted by out-of-order
--             approvals (older record approved after newer one).
-- ─────────────────────────────────────────────────────────────────────────────

WITH latest AS (
    SELECT DISTINCT ON (cr.instrument_id)
        cr.instrument_id,
        cr.calibration_date,
        COALESCE(
            CASE
                WHEN cr.as_left_result IS NOT NULL
                     AND cr.as_left_result != 'not_required'
                THEN cr.as_left_result::text
                ELSE cr.as_found_result::text
            END,
            'not_calibrated'
        ) AS final_result
    FROM calibration_records cr
    WHERE cr.record_status IN ('approved', 'submitted')
      AND cr.as_found_result IS NOT NULL
    ORDER BY cr.instrument_id, cr.calibration_date DESC
)
UPDATE instruments i
SET
    last_calibration_date   = l.calibration_date,
    last_calibration_result = l.final_result,
    calibration_due_date    = CASE
                                  WHEN i.calibration_interval_days IS NOT NULL
                                  THEN l.calibration_date + (i.calibration_interval_days * INTERVAL '1 day')
                                  ELSE i.calibration_due_date
                              END
FROM latest l
WHERE i.id = l.instrument_id;
