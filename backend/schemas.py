"""
Pydantic v2 request / response schemas for Calcheq.
"""
from __future__ import annotations

from datetime import date, datetime
from typing import List, Literal, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, model_validator

from models import (
    AsFoundResult,
    AsLeftResult,
    CalibrationResultStatus,
    CalibrationType,
    Criticality,
    InstrumentStatus,
    InstrumentType,
    RecordStatus,
    ToleranceType,
)

# ---------------------------------------------------------------------------
# Shared alias
# ---------------------------------------------------------------------------

AlertStatus = Literal["overdue", "due_soon", "current", "not_calibrated"]


# ===========================================================================
# Instrument schemas
# ===========================================================================

class InstrumentCreate(BaseModel):
    """Fields accepted when creating a new instrument. tag_number and
    instrument_type are required; everything else is optional."""

    tag_number:      str          = Field(..., max_length=50)
    instrument_type: InstrumentType

    description:   Optional[str] = Field(None, max_length=255)
    area:          Optional[str] = Field(None, max_length=100)
    unit:          Optional[str] = Field(None, max_length=100)
    manufacturer:  Optional[str] = Field(None, max_length=100)
    model:         Optional[str] = Field(None, max_length=100)
    serial_number: Optional[str] = Field(None, max_length=100)

    measurement_lrv:   Optional[float] = None
    measurement_urv:   Optional[float] = None
    engineering_units: Optional[str]   = Field(None, max_length=20)
    output_type:       Optional[str]   = Field(None, max_length=50)

    calibration_interval_days: Optional[int]           = Field(None, gt=0)
    tolerance_type:            Optional[ToleranceType] = None
    tolerance_value:           Optional[float]         = Field(None, gt=0)
    num_test_points:           int                     = Field(5, ge=1, le=20)
    test_point_values:         Optional[List[float]]   = None

    criticality: Optional[Criticality]      = None
    status:      InstrumentStatus           = InstrumentStatus.ACTIVE

    procedure_reference:     Optional[str]                     = Field(None, max_length=100)
    last_calibration_date:   Optional[date]                    = None
    last_calibration_result: CalibrationResultStatus           = CalibrationResultStatus.NOT_CALIBRATED
    calibration_due_date:    Optional[date]                    = None
    created_by:              Optional[str]                     = Field(None, max_length=100)

    @model_validator(mode="after")
    def check_range(self) -> "InstrumentCreate":
        lrv = self.measurement_lrv
        urv = self.measurement_urv
        if lrv is not None and urv is not None and urv <= lrv:
            raise ValueError("measurement_urv must be greater than measurement_lrv")
        return self

    @model_validator(mode="after")
    def compute_due_date(self) -> "InstrumentCreate":
        """Auto-calculate calibration_due_date if not explicitly supplied."""
        if (
            self.calibration_due_date is None
            and self.last_calibration_date is not None
            and self.calibration_interval_days is not None
        ):
            from datetime import timedelta
            self.calibration_due_date = (
                self.last_calibration_date
                + timedelta(days=self.calibration_interval_days)
            )
        return self


class InstrumentUpdate(BaseModel):
    """All fields optional — only supplied fields are written to the DB."""

    tag_number:      Optional[str]           = Field(None, max_length=50)
    instrument_type: Optional[InstrumentType] = None

    description:   Optional[str] = Field(None, max_length=255)
    area:          Optional[str] = Field(None, max_length=100)
    unit:          Optional[str] = Field(None, max_length=100)
    manufacturer:  Optional[str] = Field(None, max_length=100)
    model:         Optional[str] = Field(None, max_length=100)
    serial_number: Optional[str] = Field(None, max_length=100)

    measurement_lrv:   Optional[float] = None
    measurement_urv:   Optional[float] = None
    engineering_units: Optional[str]   = Field(None, max_length=20)
    output_type:       Optional[str]   = Field(None, max_length=50)

    calibration_interval_days: Optional[int]           = Field(None, gt=0)
    tolerance_type:            Optional[ToleranceType] = None
    tolerance_value:           Optional[float]         = Field(None, gt=0)
    num_test_points:           Optional[int]           = Field(None, ge=1, le=20)
    test_point_values:         Optional[List[float]]   = None

    criticality: Optional[Criticality]     = None
    status:      Optional[InstrumentStatus] = None

    procedure_reference:     Optional[str]                = Field(None, max_length=100)
    last_calibration_date:   Optional[date]               = None
    last_calibration_result: Optional[CalibrationResultStatus] = None
    calibration_due_date:    Optional[date]               = None
    created_by:              Optional[str]                = Field(None, max_length=100)

    @model_validator(mode="after")
    def check_range(self) -> "InstrumentUpdate":
        lrv = self.measurement_lrv
        urv = self.measurement_urv
        if lrv is not None and urv is not None and urv <= lrv:
            raise ValueError("measurement_urv must be greater than measurement_lrv")
        return self


class InstrumentResponse(BaseModel):
    """Full instrument representation returned by all read endpoints."""

    model_config = ConfigDict(from_attributes=True)

    id:             UUID
    tag_number:     str
    instrument_type: InstrumentType

    description:   Optional[str]
    area:          Optional[str]
    unit:          Optional[str]
    manufacturer:  Optional[str]
    model:         Optional[str]
    serial_number: Optional[str]

    measurement_lrv:   Optional[float]
    measurement_urv:   Optional[float]
    engineering_units: Optional[str]
    output_type:       Optional[str]

    calibration_interval_days: Optional[int]
    tolerance_type:            Optional[ToleranceType]
    tolerance_value:           Optional[float]
    num_test_points:           int
    test_point_values:         Optional[List[float]]

    criticality: Optional[Criticality]
    status:      InstrumentStatus

    procedure_reference:     Optional[str]
    last_calibration_date:   Optional[date]
    last_calibration_result: CalibrationResultStatus
    calibration_due_date:    Optional[date]

    created_at: datetime
    updated_at: datetime
    created_by: Optional[str]

    # Computed / derived fields (not stored, calculated on read)
    days_overdue:   int
    days_until_due: Optional[int]
    alert_status:   AlertStatus


class CalibrationStatusResponse(BaseModel):
    """Returned by GET /api/instruments/{id}/calibration-status."""

    status:               AlertStatus
    days_overdue:         int
    days_until_due:       Optional[int]
    last_result:          Optional[str]
    calibration_due_date: Optional[date]


# ===========================================================================
# Shared list wrapper — instruments
# ===========================================================================

class InstrumentListResponse(BaseModel):
    total:   int
    results: List[InstrumentResponse]


# ---------------------------------------------------------------------------
# Minimal instrument summary — embedded in calibration list items
# ---------------------------------------------------------------------------

class InstrumentSummary(BaseModel):
    """Lightweight instrument fields embedded in calibration list responses."""
    model_config = ConfigDict(from_attributes=True)

    id:          UUID
    tag_number:  str
    description: Optional[str]
    area:        Optional[str]


# ===========================================================================
# Calibration record schemas
# ===========================================================================

class TestPointInput(BaseModel):
    """One test-point reading supplied when creating / updating a calibration."""
    point_number:    int   = Field(..., ge=1)
    nominal_input:   float
    expected_output: float
    as_found_output: Optional[float] = None   # nullable — may be filled in later
    as_left_output:  Optional[float] = None   # nullable — only when adjustment made


class TestPointResponse(BaseModel):
    """Full test-point representation with all calculated fields."""
    model_config = ConfigDict(from_attributes=True)

    id:                     UUID
    calibration_record_id:  UUID
    point_number:           int
    nominal_input:          float
    expected_output:        float
    as_found_output:        Optional[float]
    as_left_output:         Optional[float]
    as_found_error_abs:     Optional[float]
    as_found_error_pct:     Optional[float]
    as_left_error_abs:      Optional[float]
    as_left_error_pct:      Optional[float]
    as_found_result:        Optional[AsFoundResult]
    as_left_result:         Optional[AsLeftResult]


class CalibrationRecordCreate(BaseModel):
    """Payload for POST /api/calibrations."""
    instrument_id:    UUID
    calibration_date: date
    calibration_type: CalibrationType

    technician_name:  Optional[str]  = Field(None, max_length=100)
    technician_id:    Optional[UUID] = None

    reference_standard_description: Optional[str]  = Field(None, max_length=255)
    reference_standard_serial:       Optional[str]  = Field(None, max_length=100)
    reference_standard_cert_number:  Optional[str]  = Field(None, max_length=100)
    reference_standard_cert_expiry:  Optional[date] = None
    procedure_used:                  Optional[str]  = Field(None, max_length=100)

    adjustment_made:   bool          = False
    adjustment_type:   Optional[str] = Field(None, max_length=100)
    adjustment_notes:  Optional[str] = None
    technician_notes:  Optional[str] = None

    defect_found:       bool          = False
    defect_description: Optional[str] = None
    return_to_service:  Optional[bool] = None

    work_order_reference: Optional[str] = Field(None, max_length=100)

    # Test points — optional at creation (technician fills these in while draft)
    test_points: Optional[List[TestPointInput]] = None


class CalibrationRecordUpdate(BaseModel):
    """Payload for PUT /api/calibrations/{id}. All fields optional.
    Only allowed while record_status == 'draft'."""
    calibration_date: Optional[date]           = None
    calibration_type: Optional[CalibrationType] = None

    technician_name:  Optional[str]  = Field(None, max_length=100)
    technician_id:    Optional[UUID] = None

    reference_standard_description: Optional[str]  = Field(None, max_length=255)
    reference_standard_serial:       Optional[str]  = Field(None, max_length=100)
    reference_standard_cert_number:  Optional[str]  = Field(None, max_length=100)
    reference_standard_cert_expiry:  Optional[date] = None
    procedure_used:                  Optional[str]  = Field(None, max_length=100)

    adjustment_made:   Optional[bool] = None
    adjustment_type:   Optional[str]  = Field(None, max_length=100)
    adjustment_notes:  Optional[str]  = None
    technician_notes:  Optional[str]  = None

    defect_found:       Optional[bool] = None
    defect_description: Optional[str]  = None
    return_to_service:  Optional[bool] = None

    work_order_reference: Optional[str] = Field(None, max_length=100)

    # Providing test_points replaces ALL existing test points for this record
    test_points: Optional[List[TestPointInput]] = None


class CalibrationRecordResponse(BaseModel):
    """Full calibration record returned by read endpoints, with embedded test points."""
    model_config = ConfigDict(from_attributes=True)

    id:            UUID
    instrument_id: UUID
    calibration_date: date
    calibration_type: CalibrationType
    record_status:    RecordStatus

    technician_name:  Optional[str]
    technician_id:    Optional[UUID]

    reference_standard_description: Optional[str]
    reference_standard_serial:       Optional[str]
    reference_standard_cert_number:  Optional[str]
    reference_standard_cert_expiry:  Optional[date]
    procedure_used:                  Optional[str]

    adjustment_made:   bool
    adjustment_type:   Optional[str]
    adjustment_notes:  Optional[str]
    technician_notes:  Optional[str]

    defect_found:       bool
    defect_description: Optional[str]
    return_to_service:  Optional[bool]

    as_found_result:        Optional[AsFoundResult]
    as_left_result:         Optional[AsLeftResult]
    max_as_found_error_pct: Optional[float]
    max_as_left_error_pct:  Optional[float]

    work_order_reference: Optional[str]
    created_at:           datetime
    approved_by:          Optional[str]
    approved_at:          Optional[datetime]

    test_points: List[TestPointResponse] = []


class CalibrationRecordListItem(BaseModel):
    """Lighter representation used in list responses."""
    model_config = ConfigDict(from_attributes=True)

    id:               UUID
    instrument_id:    UUID
    calibration_date: date
    calibration_type: CalibrationType
    record_status:    RecordStatus
    technician_name:  Optional[str]
    as_found_result:  Optional[AsFoundResult]
    as_left_result:   Optional[AsLeftResult]
    max_as_found_error_pct: Optional[float]
    max_as_left_error_pct:  Optional[float]
    work_order_reference:   Optional[str]
    adjustment_made:        bool = False
    created_at:             datetime
    approved_by:            Optional[str]

    # Joined instrument summary — populated by the list endpoint
    instrument: Optional[InstrumentSummary] = None


class CalibrationListResponse(BaseModel):
    total:   int
    results: List[CalibrationRecordListItem]


class RejectPayload(BaseModel):
    """Optional body for the reject endpoint."""
    notes: Optional[str] = None


# ===========================================================================
# Dashboard schemas
# ===========================================================================

class DashboardStats(BaseModel):
    total_instruments:    int
    overdue_count:        int
    due_soon_count:       int
    failed_last_30_days:  int
    compliance_rate:      float   # % of scheduled instruments currently in-date & passing
    calibrated_this_week: int


class Alert(BaseModel):
    """One active alert generated from instrument calibration state."""
    id:            str            # deterministic: "{instrument_id}_{alert_type}"
    instrument_id: UUID
    tag_number:    str
    description:   Optional[str]
    area:          Optional[str]
    alert_type:    str            # OVERDUE / DUE_SOON / FAILED / CONSECUTIVE_FAILURES
    priority:      str            # critical / warning / information
    message:       str
    triggered_at:  datetime


class AreaCompliance(BaseModel):
    area:            str
    total:           int
    compliant:       int
    compliance_rate: float        # rounded to 1 dp


class BadActor(BaseModel):
    instrument_id:     UUID
    tag_number:        str
    description:       Optional[str]
    area:              Optional[str]
    failure_count:     int
    last_failure_date: date


# ===========================================================================
# Audit log schemas
# ===========================================================================

class AuditLogEntry(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id:             UUID
    site_id:        UUID
    entity_type:    str
    entity_id:      UUID
    user_id:        str
    user_name:      str
    action:         str
    changed_fields: Optional[dict] = None
    created_at:     datetime


class AuditLogListResponse(BaseModel):
    total:   int
    results: List[AuditLogEntry]


# ===========================================================================
# Bulk import schemas
# ===========================================================================

class ImportRowResult(BaseModel):
    row:     int
    tag:     str
    status:  str   # 'created' | 'skipped' | 'error'
    message: str


class BulkImportResponse(BaseModel):
    dry_run:  bool
    total:    int
    created:  int
    skipped:  int
    errors:   int
    rows:     List[ImportRowResult]


# ===========================================================================
# Calibration Queue schemas
# ===========================================================================

class QueueInstrumentSummary(BaseModel):
    """Instrument fields embedded in each queue item response."""
    model_config = ConfigDict(from_attributes=True)

    id:                        UUID
    tag_number:                str
    description:               Optional[str]
    area:                      Optional[str]
    criticality:               Optional[Criticality]
    status:                    InstrumentStatus
    calibration_due_date:      Optional[date]
    last_calibration_date:     Optional[date]
    last_calibration_result:   CalibrationResultStatus
    calibration_interval_days: Optional[int]
    tolerance_value:           Optional[float]
    days_overdue:              int   # computed — injected by route
    days_until_due:            Optional[int]  # computed — injected by route
    alert_status:              str


class QueueItemResponse(BaseModel):
    """One item in the calibration queue with embedded instrument data."""
    model_config = ConfigDict(from_attributes=True)

    id:            UUID
    instrument_id: UUID
    added_by_name: str
    added_at:      datetime
    priority:      int
    notes:         Optional[str]
    instrument:    QueueInstrumentSummary


class QueueListResponse(BaseModel):
    total: int
    items: List[QueueItemResponse]


class QueueAddPayload(BaseModel):
    instrument_id: UUID
    notes:         Optional[str] = None


class QueuePriorityPayload(BaseModel):
    priority: int
