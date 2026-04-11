"""
Calcheq — MEX Instrument Import Script
==========================================
Reads a prepared CSV file and creates instruments via the Calcheq API.

Usage:
    python import_instruments.py
    python import_instruments.py --csv my_file.csv
    python import_instruments.py --csv my_file.csv --dry-run

Configuration:
    Edit API_URL and SITE_NAME below before running.
"""

import csv
import json
import sys
import argparse
import urllib.request
import urllib.error
import urllib.parse
from datetime import datetime

# ─────────────────────────────────────────────────────────────────────────────
# CONFIGURATION — edit these before running
# ─────────────────────────────────────────────────────────────────────────────

API_URL   = "http://localhost:8000"   # Your Calcheq backend URL
                                       # e.g. "https://caltrack-backend.up.railway.app"

SITE_NAME = "Admin"                    # Your site name — must match exactly what you
                                       # used when signing into Calcheq

# ─────────────────────────────────────────────────────────────────────────────
# VALID VALUES — do not change these
# ─────────────────────────────────────────────────────────────────────────────

VALID_INSTRUMENT_TYPES = {
    "pressure", "temperature", "flow", "level",
    "analyser", "switch", "valve", "other"
}

VALID_TOLERANCE_TYPES = {
    "percent_span", "percent_reading", "absolute"
}

VALID_CRITICALITY = {
    "safety_critical", "process_critical", "standard", "non_critical"
}

VALID_STATUS = {
    "active", "spare", "out_of_service", "decommissioned"
}

VALID_CAL_RESULTS = {
    "pass", "fail", "marginal", "not_calibrated"
}

# Common MEX → Calcheq type mappings (extend as needed)
INSTRUMENT_TYPE_MAP = {
    # pressure
    "pressure transmitter": "pressure",
    "pressure indicator": "pressure",
    "pressure gauge": "pressure",
    "pt": "pressure",
    "pit": "pressure",
    "pic": "pressure",
    # temperature
    "temperature transmitter": "temperature",
    "temperature element": "temperature",
    "thermocouple": "temperature",
    "tt": "temperature",
    "te": "temperature",
    # flow
    "flow transmitter": "flow",
    "flow meter": "flow",
    "flow indicator": "flow",
    "ft": "flow",
    "fit": "flow",
    # level
    "level transmitter": "level",
    "level indicator": "level",
    "lt": "level",
    "lit": "level",
    # analyser
    "analyser": "analyser",
    "analyzer": "analyser",
    "at": "analyser",
    # switch
    "pressure switch": "switch",
    "level switch": "switch",
    "temperature switch": "switch",
    "flow switch": "switch",
    "psh": "switch",
    "psl": "switch",
    "lsh": "switch",
    "lsl": "switch",
    "tsh": "switch",
    # valve
    "control valve": "valve",
    "valve": "valve",
    "cv": "valve",
    "pcv": "valve",
    "lcv": "valve",
    "tcv": "valve",
}

# Common MEX status → Calcheq status mappings
STATUS_MAP = {
    "active":          "active",
    "in service":      "active",
    "operational":     "active",
    "spare":           "spare",
    "standby":         "spare",
    "inactive":        "out_of_service",
    "out of service":  "out_of_service",
    "shutdown":        "out_of_service",
    "decommissioned":  "decommissioned",
    "retired":         "decommissioned",
    "scrapped":        "decommissioned",
    "archived":        "decommissioned",
}

# ─────────────────────────────────────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────────────────────────────────────

def clean(val):
    """Strip whitespace, return None if empty."""
    if val is None:
        return None
    v = str(val).strip()
    return v if v else None


def map_instrument_type(raw):
    """Map a free-text MEX type to a CalTrack instrument_type value."""
    if not raw:
        return "other"
    lower = raw.strip().lower()
    # Direct match
    if lower in VALID_INSTRUMENT_TYPES:
        return lower
    # Map via lookup table
    if lower in INSTRUMENT_TYPE_MAP:
        return INSTRUMENT_TYPE_MAP[lower]
    # Partial match
    for key, val in INSTRUMENT_TYPE_MAP.items():
        if key in lower or lower in key:
            return val
    return "other"


def map_status(raw):
    """Map a MEX status string to a CalTrack status value."""
    if not raw:
        return "active"
    lower = raw.strip().lower()
    if lower in VALID_STATUS:
        return lower
    if lower in STATUS_MAP:
        return STATUS_MAP[lower]
    return "active"


def parse_float(val, field_name):
    """Parse a float from a string. Returns (float_val, error_string)."""
    if not val or str(val).strip() == "":
        return None, None
    try:
        # Strip any trailing unit text (e.g. "1000 kPa" -> 1000.0)
        numeric = ""
        for ch in str(val).strip():
            if ch.isdigit() or ch in ".-":
                numeric += ch
            elif numeric:
                break
        return float(numeric), None
    except (ValueError, TypeError):
        return None, f"{field_name} is not a valid number (got: '{val}')"


def parse_int(val, field_name):
    """Parse a positive integer. Returns (int_val, error_string)."""
    if not val or str(val).strip() == "":
        return None, None
    try:
        # Handle strings like "12 months" or "365 days"
        numeric = ""
        for ch in str(val).strip():
            if ch.isdigit():
                numeric += ch
            elif numeric:
                break
        n = int(numeric)
        if n <= 0:
            return None, f"{field_name} must be a positive integer (got: '{val}')"
        return n, None
    except (ValueError, TypeError):
        return None, f"{field_name} must be a positive integer (got: '{val}')"


def parse_date(val, field_name):
    """Parse a date. Accepts YYYY-MM-DD. Returns (date_str, error_string)."""
    if not val or str(val).strip() == "":
        return None, None
    v = str(val).strip()
    # Already in correct format
    for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%m/%d/%Y", "%d-%m-%Y"):
        try:
            dt = datetime.strptime(v, fmt)
            return dt.strftime("%Y-%m-%d"), None
        except ValueError:
            continue
    return None, f"{field_name} is not a recognisable date (got: '{val}') — use YYYY-MM-DD"


def api_post(endpoint, payload):
    """POST JSON to the API. Returns (response_dict, error_string)."""
    url  = f"{API_URL.rstrip('/')}{endpoint}"
    data = json.dumps(payload).encode("utf-8")
    req  = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            body = resp.read().decode("utf-8")
            return json.loads(body), None
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        try:
            detail = json.loads(body).get("detail", body)
        except Exception:
            detail = body
        return None, f"HTTP {e.code}: {detail}"
    except urllib.error.URLError as e:
        return None, f"Cannot connect to {url} — {e.reason}"
    except Exception as e:
        return None, str(e)


def api_get_tags():
    """Fetch existing tag numbers to detect duplicates. Returns set of tags."""
    url = f"{API_URL.rstrip('/')}/instruments/?limit=9999&site={urllib.parse.quote(SITE_NAME)}"
    req = urllib.request.Request(url, method="GET")
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            body = resp.read().decode("utf-8")
            data = json.loads(body)
            items = data if isinstance(data, list) else data.get("items", data.get("results", []))
            return {i.get("tag_number", "") for i in items if i.get("tag_number")}
    except Exception:
        return set()  # If we can't fetch, just proceed (duplicates will get API errors)


# ─────────────────────────────────────────────────────────────────────────────
# ROW PROCESSING
# ─────────────────────────────────────────────────────────────────────────────

def process_row(row, row_num, existing_tags, dry_run=False):
    """
    Process a single CSV row.
    Returns (status, tag_number, message)
    where status is 'created', 'skipped', or 'failed'
    """
    errors = []

    # ── Required fields ────────────────────────────────────────────────────
    tag = clean(row.get("tag_number") or row.get("Tag Number") or row.get("TAG") or "")
    if not tag:
        return "failed", "(no tag)", "tag_number is required but was blank"

    description = clean(row.get("description") or row.get("Description") or "")
    if not description:
        errors.append("description is required")

    area = clean(row.get("area") or row.get("Area") or row.get("Location") or "")
    if not area:
        area = "Unassigned"  # Default rather than fail

    cal_interval_raw = clean(
        row.get("calibration_interval_days") or
        row.get("Cal Interval") or
        row.get("Calibration Interval") or ""
    )
    cal_interval, err = parse_int(cal_interval_raw, "calibration_interval_days")
    if err:
        errors.append(err)
    if not cal_interval:
        cal_interval = 365  # Sensible default

    # ── Skip duplicates ────────────────────────────────────────────────────
    if tag in existing_tags:
        return "skipped", tag, "already exists in Calcheq"

    if errors:
        return "failed", tag, "; ".join(errors)

    # ── Optional fields ────────────────────────────────────────────────────
    raw_type  = clean(row.get("instrument_type") or row.get("Equipment Type") or row.get("Type") or "")
    instr_type = map_instrument_type(raw_type) if raw_type else "other"

    raw_status = clean(row.get("status") or row.get("Status") or "")
    status = map_status(raw_status)

    raw_crit = clean(row.get("criticality") or row.get("Criticality") or "")
    if raw_crit and raw_crit.lower() in VALID_CRITICALITY:
        criticality = raw_crit.lower()
    else:
        criticality = "standard"

    raw_tol_type = clean(row.get("tolerance_type") or row.get("Tolerance Type") or "")
    if raw_tol_type and raw_tol_type.lower() in VALID_TOLERANCE_TYPES:
        tol_type = raw_tol_type.lower()
    else:
        tol_type = "percent_span"

    tol_val, _ = parse_float(
        row.get("tolerance_value") or row.get("Tolerance") or "", "tolerance_value"
    )

    lrv, _ = parse_float(
        row.get("measurement_lrv") or row.get("LRV") or row.get("Range Low") or "", "measurement_lrv"
    )
    urv, _ = parse_float(
        row.get("measurement_urv") or row.get("URV") or row.get("Range High") or "", "measurement_urv"
    )

    num_pts, _ = parse_int(
        row.get("num_test_points") or row.get("Test Points") or "5", "num_test_points"
    )
    if not num_pts:
        num_pts = 5

    last_cal_date, date_err = parse_date(
        row.get("last_calibration_date") or row.get("Last Cal Date") or row.get("Last Service Date") or "",
        "last_calibration_date"
    )
    if date_err:
        print(f"  Warning on {tag}: {date_err} — date will be left blank")

    raw_result = clean(
        row.get("last_calibration_result") or row.get("Last Result") or row.get("Cal Result") or ""
    )
    last_result = raw_result.lower() if raw_result and raw_result.lower() in VALID_CAL_RESULTS else None

    # ── Build payload ──────────────────────────────────────────────────────
    payload = {
        "tag_number":              tag,
        "description":             description or tag,
        "area":                    area,
        "instrument_type":         instr_type,
        "status":                  status,
        "criticality":             criticality,
        "calibration_interval_days": cal_interval,
        "num_test_points":         num_pts,
        "created_by":              SITE_NAME,
    }

    # Optional string fields
    for src_key, dst_key in [
        ("unit",                "unit"),
        ("manufacturer",        "manufacturer"),
        ("model",               "model"),
        ("serial_number",       "serial_number"),
        ("engineering_units",   "engineering_units"),
        ("output_type",         "output_type"),
        ("procedure_reference", "procedure_reference"),
    ]:
        val = clean(row.get(src_key) or "")
        if val:
            payload[dst_key] = val

    if lrv is not None:
        payload["measurement_lrv"] = lrv
    if urv is not None:
        payload["measurement_urv"] = urv
    if tol_val is not None:
        payload["tolerance_value"] = tol_val
        payload["tolerance_type"]  = tol_type
    if last_cal_date:
        payload["last_calibration_date"]   = last_cal_date
    if last_result:
        payload["last_calibration_result"] = last_result

    # ── Dry run ────────────────────────────────────────────────────────────
    if dry_run:
        return "created", tag, f"DRY RUN — would create with {len(payload)} fields"

    # ── Post to API ────────────────────────────────────────────────────────
    _, err = api_post("/instruments/", payload)
    if err:
        return "failed", tag, err

    existing_tags.add(tag)  # Prevent duplicate within same run
    return "created", tag, "OK"


# ─────────────────────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Import instruments from CSV into Calcheq")
    parser.add_argument("--csv",     default="caltrack_import.csv", help="Path to the import CSV file")
    parser.add_argument("--dry-run", action="store_true",           help="Validate CSV without creating instruments")
    args = parser.parse_args()

    csv_path = args.csv
    dry_run  = args.dry_run

    print("=" * 60)
    print("  Calcheq — Instrument Import Script")
    print("=" * 60)
    print(f"  API URL  : {API_URL}")
    print(f"  Site     : {SITE_NAME}")
    print(f"  CSV file : {csv_path}")
    print(f"  Mode     : {'DRY RUN (no changes will be made)' if dry_run else 'LIVE'}")
    print("=" * 60)
    print()

    # ── Read CSV ───────────────────────────────────────────────────────────
    try:
        with open(csv_path, newline="", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            rows = list(reader)
    except FileNotFoundError:
        print(f"ERROR: CSV file not found: {csv_path}")
        print(f"Make sure the file is in the same folder as this script.")
        sys.exit(1)
    except Exception as e:
        print(f"ERROR reading CSV: {e}")
        sys.exit(1)

    if not rows:
        print("ERROR: CSV file is empty or has no data rows.")
        sys.exit(1)

    print(f"Found {len(rows)} rows in CSV.")

    # ── Check API connectivity ─────────────────────────────────────────────
    if not dry_run:
        print("Checking API connection... ", end="", flush=True)
        try:
            with urllib.request.urlopen(f"{API_URL}/health", timeout=10) as r:
                print("OK")
        except Exception:
            # /health may not exist — try /instruments/ instead
            try:
                with urllib.request.urlopen(f"{API_URL}/instruments/?limit=1", timeout=10) as r:
                    print("OK")
            except urllib.error.URLError as e:
                print(f"FAILED\n\nERROR: Cannot connect to {API_URL}\n{e.reason}")
                print("\nCheck that your Calcheq backend is running and API_URL is correct.")
                sys.exit(1)
            except Exception as e:
                print(f"OK (ignoring: {e})")

    # ── Fetch existing tags ────────────────────────────────────────────────
    existing_tags = set()
    if not dry_run:
        print(f"Fetching existing instruments for site '{SITE_NAME}'... ", end="", flush=True)
        existing_tags = api_get_tags()
        print(f"{len(existing_tags)} found.")

    print()

    # ── Process rows ───────────────────────────────────────────────────────
    results  = {"created": [], "skipped": [], "failed": []}
    log_lines = []
    total = len(rows)

    for i, row in enumerate(rows, start=1):
        status, tag, msg = process_row(row, i, existing_tags, dry_run=dry_run)
        results[status].append(tag)

        # Console output
        status_symbol = {"created": "\u2713", "skipped": "\u25E6", "failed": "\u2715"}[status]
        status_label  = {"created": "Created ", "skipped": "Skipped", "failed": "FAILED "}[status]
        print(f"  [{i:>4}/{total}]  {status_symbol}  {tag:<20}  {status_label}  {msg}")

        if status == "failed":
            log_lines.append(f"ROW {i}: {tag} \u2014 FAILED: {msg}")

    # ── Summary ────────────────────────────────────────────────────────────
    print()
    print("=" * 60)
    print(f"  COMPLETE")
    print(f"  Created : {len(results['created'])}")
    print(f"  Skipped : {len(results['skipped'])}  (already existed)")
    print(f"  Failed  : {len(results['failed'])}")
    print("=" * 60)

    if log_lines:
        log_path = "import_errors.log"
        with open(log_path, "w", encoding="utf-8") as f:
            f.write(f"Calcheq Import Errors — {datetime.now().strftime('%Y-%m-%d %H:%M')}\n")
            f.write(f"CSV: {csv_path}\n")
            f.write(f"Site: {SITE_NAME}\n\n")
            f.write("\n".join(log_lines))
        print(f"\n  {len(log_lines)} error(s) written to: {log_path}")
        print("  Fix the rows listed in that file, then re-run this script.")

    if dry_run:
        print("\n  Dry run complete — no instruments were created.")
        print("  Remove --dry-run to perform the actual import.")

    print()


if __name__ == "__main__":
    main()
