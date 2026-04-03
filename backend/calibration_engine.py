"""
Calibration Pass/Fail Calculation Engine
=========================================
Implements the exact formulas from CLAUDE.md.

This module is pure Python — no FastAPI, no SQLAlchemy dependencies.
All inputs and outputs are plain dataclasses so it can be tested in isolation.

Formulas (from CLAUDE.md):
  span = measurement_urv - measurement_lrv

  tolerance_abs:
    percent_span    → (tolerance_value / 100) * output_span
    percent_reading → (tolerance_value / 100) * expected_output
    absolute        → tolerance_value

  per-point:
    error_abs         = actual_output - expected_output
    error_pct         = (error_abs / output_span) * 100
    marginal_threshold = tolerance_abs * 0.8
    result:
      abs(error_abs) > tolerance_abs          → fail
      abs(error_abs) > marginal_threshold     → marginal
      else                                    → pass

  overall:
    any fail    → fail
    any marginal → marginal
    else        → pass
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import List, Optional


# ---------------------------------------------------------------------------
# Engine error
# ---------------------------------------------------------------------------

class CalibrationEngineError(ValueError):
    """Raised when the engine cannot run due to invalid / missing config."""


# ---------------------------------------------------------------------------
# Input / output dataclasses
# ---------------------------------------------------------------------------

@dataclass
class TestPointData:
    """One test-point reading supplied by the caller."""
    point_number:    int
    nominal_input:   float
    expected_output: float
    as_found_output: float
    as_left_output:  Optional[float] = None


@dataclass
class TestPointResult:
    """Calculated result for a single test point."""
    point_number:    int
    nominal_input:   float
    expected_output: float
    as_found_output: float
    as_left_output:  Optional[float]

    as_found_error_abs: float
    as_found_error_pct: float
    as_found_result:    str          # "pass" | "marginal" | "fail"

    as_left_error_abs:  Optional[float]
    as_left_error_pct:  Optional[float]
    as_left_result:     str          # "pass" | "marginal" | "fail" | "not_required"


@dataclass
class EngineResult:
    """Full result returned by the engine."""
    test_points:            List[TestPointResult]
    as_found_result:        str          # overall as-found
    as_left_result:         str          # overall as-left
    max_as_found_error_pct: float
    max_as_left_error_pct:  Optional[float]


# ---------------------------------------------------------------------------
# Private helpers
# ---------------------------------------------------------------------------

def _tolerance_abs(
    tolerance_type: str,
    tolerance_value: float,
    output_span: float,
    expected_output: float,
) -> float:
    """Return absolute tolerance in output engineering units.

    Implements the three tolerance modes from CLAUDE.md exactly.
    """
    t = tolerance_type.lower() if isinstance(tolerance_type, str) else tolerance_type

    if t in ("percent_span",):
        return (tolerance_value / 100.0) * output_span

    if t in ("percent_reading",):
        # CLAUDE.md: (tolerance_value / 100) * expected_output
        # Use abs() so instruments with negative expected outputs (e.g. vacuum gauges)
        # still produce a positive tolerance band.
        return (tolerance_value / 100.0) * abs(expected_output)

    if t in ("absolute",):
        return float(tolerance_value)

    raise CalibrationEngineError(
        f"Unknown tolerance_type {tolerance_type!r}. "
        "Expected 'percent_span', 'percent_reading', or 'absolute'."
    )


def _point_result(error_abs: float, tolerance_abs: float) -> str:
    """Classify one measurement against tolerance. Returns 'pass'/'marginal'/'fail'."""
    marginal_threshold = tolerance_abs * 0.8
    if abs(error_abs) > tolerance_abs:
        return "fail"
    if abs(error_abs) > marginal_threshold:
        return "marginal"
    return "pass"


def _overall_as_found(results: List[str]) -> str:
    """Aggregate per-point as-found results per CLAUDE.md rules."""
    if "fail" in results:
        return "fail"
    if "marginal" in results:
        return "marginal"
    return "pass"


def _overall_as_left(results: List[str]) -> str:
    """Aggregate per-point as-left results.

    Points where no adjustment was made carry "not_required". If ALL points are
    "not_required" the overall is also "not_required". Otherwise, consider only
    the evaluated points.
    """
    evaluated = [r for r in results if r != "not_required"]
    if not evaluated:
        return "not_required"
    if "fail" in evaluated:
        return "fail"
    if "marginal" in evaluated:
        return "marginal"
    return "pass"


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def run(
    *,
    tolerance_type:  str,
    tolerance_value: float,
    measurement_lrv: float,
    measurement_urv: float,
    test_points:     List[TestPointData],
) -> EngineResult:
    """
    Execute pass/fail calculations for a calibration event.

    Parameters
    ----------
    tolerance_type   : 'percent_span' | 'percent_reading' | 'absolute'
    tolerance_value  : numeric value of the tolerance (e.g. 0.5 for 0.5 %)
    measurement_lrv  : instrument lower range value
    measurement_urv  : instrument upper range value
    test_points      : list of TestPointData with actual readings

    Returns
    -------
    EngineResult containing per-point results and overall pass/fail summary.

    Raises
    ------
    CalibrationEngineError if instrument config is invalid or inputs are empty.
    """
    # --- input validation ---
    if measurement_urv <= measurement_lrv:
        raise CalibrationEngineError(
            f"measurement_urv ({measurement_urv}) must be greater than "
            f"measurement_lrv ({measurement_lrv})."
        )
    if tolerance_value is None or tolerance_value <= 0:
        raise CalibrationEngineError(
            "tolerance_value must be a positive number."
        )
    if not test_points:
        raise CalibrationEngineError(
            "At least one test point reading is required to run the engine."
        )

    output_span = measurement_urv - measurement_lrv

    point_results: List[TestPointResult] = []

    for tp in test_points:
        tol_abs = _tolerance_abs(tolerance_type, tolerance_value, output_span, tp.expected_output)

        # --- as-found ---
        af_error_abs = tp.as_found_output - tp.expected_output
        af_error_pct = (af_error_abs / output_span) * 100.0
        af_result    = _point_result(af_error_abs, tol_abs)

        # --- as-left (only when an adjusted reading was provided) ---
        if tp.as_left_output is not None:
            al_error_abs = tp.as_left_output - tp.expected_output
            al_error_pct = (al_error_abs / output_span) * 100.0
            al_result    = _point_result(al_error_abs, tol_abs)
        else:
            al_error_abs = None
            al_error_pct = None
            al_result    = "not_required"

        point_results.append(TestPointResult(
            point_number=tp.point_number,
            nominal_input=tp.nominal_input,
            expected_output=tp.expected_output,
            as_found_output=tp.as_found_output,
            as_left_output=tp.as_left_output,
            as_found_error_abs=round(af_error_abs, 6),
            as_found_error_pct=round(af_error_pct, 4),
            as_found_result=af_result,
            as_left_error_abs=round(al_error_abs, 6) if al_error_abs is not None else None,
            as_left_error_pct=round(al_error_pct, 4) if al_error_pct is not None else None,
            as_left_result=al_result,
        ))

    # --- overall results ---
    overall_af = _overall_as_found([r.as_found_result for r in point_results])
    overall_al = _overall_as_left([r.as_left_result for r in point_results])

    max_af_pct = max(abs(r.as_found_error_pct) for r in point_results)
    al_pcts    = [abs(r.as_left_error_pct) for r in point_results if r.as_left_error_pct is not None]
    max_al_pct = max(al_pcts) if al_pcts else None

    return EngineResult(
        test_points=point_results,
        as_found_result=overall_af,
        as_left_result=overall_al,
        max_as_found_error_pct=round(max_af_pct, 4),
        max_as_left_error_pct=round(max_al_pct, 4) if max_al_pct is not None else None,
    )


def calculate_calibration_result(
    instrument,          # models.Instrument ORM object
    test_point_readings: List[TestPointData],
) -> EngineResult:
    """
    Convenience wrapper: extract calibration config from an Instrument ORM
    object and run the engine.

    Raises CalibrationEngineError if required instrument fields are not set.
    """
    missing = [
        attr for attr in ("measurement_lrv", "measurement_urv", "tolerance_type", "tolerance_value")
        if getattr(instrument, attr) is None
    ]
    if missing:
        raise CalibrationEngineError(
            f"Instrument '{instrument.tag_number}' is missing required calibration "
            f"configuration: {', '.join(missing)}."
        )

    # Enum values arrive as enum instances; extract the string value for the engine.
    t_type = (
        instrument.tolerance_type.value
        if hasattr(instrument.tolerance_type, "value")
        else instrument.tolerance_type
    )

    return run(
        tolerance_type=t_type,
        tolerance_value=instrument.tolerance_value,
        measurement_lrv=instrument.measurement_lrv,
        measurement_urv=instrument.measurement_urv,
        test_points=test_point_readings,
    )
