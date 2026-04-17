import enum
from sqlalchemy import (
    Boolean, Column, Date, DateTime, Float, ForeignKey,
    Integer, String, Text,
)
from sqlalchemy import Enum as SAEnum
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.sql import func, text

from database import Base


# ---------------------------------------------------------------------------
# Python enums (also used in Pydantic schemas)
# ---------------------------------------------------------------------------

class InstrumentType(str, enum.Enum):
    PRESSURE    = "pressure"
    TEMPERATURE = "temperature"
    FLOW        = "flow"
    LEVEL       = "level"
    ANALYSER    = "analyser"
    SWITCH      = "switch"
    VALVE       = "valve"
    OTHER       = "other"


class ToleranceType(str, enum.Enum):
    PERCENT_SPAN    = "percent_span"
    PERCENT_READING = "percent_reading"
    ABSOLUTE        = "absolute"


class Criticality(str, enum.Enum):
    SAFETY_CRITICAL  = "safety_critical"
    PROCESS_CRITICAL = "process_critical"
    STANDARD         = "standard"
    NON_CRITICAL     = "non_critical"


class InstrumentStatus(str, enum.Enum):
    ACTIVE         = "active"
    SPARE          = "spare"
    OUT_OF_SERVICE = "out_of_service"
    DECOMMISSIONED = "decommissioned"


class CalibrationResultStatus(str, enum.Enum):
    PASS           = "pass"
    FAIL           = "fail"
    MARGINAL       = "marginal"
    NOT_CALIBRATED = "not_calibrated"


class CalibrationType(str, enum.Enum):
    ROUTINE     = "routine"
    CORRECTIVE  = "corrective"
    POST_REPAIR = "post_repair"
    INITIAL     = "initial"


class AsFoundResult(str, enum.Enum):
    PASS     = "pass"
    FAIL     = "fail"
    MARGINAL = "marginal"


class AsLeftResult(str, enum.Enum):
    PASS         = "pass"
    FAIL         = "fail"
    MARGINAL     = "marginal"
    NOT_REQUIRED = "not_required"


class RecordStatus(str, enum.Enum):
    DRAFT     = "draft"
    SUBMITTED = "submitted"
    APPROVED  = "approved"
    REJECTED  = "rejected"


# ---------------------------------------------------------------------------
# ORM Models
# ---------------------------------------------------------------------------

class Instrument(Base):
    __tablename__ = "instruments"

    id = Column(
        UUID(as_uuid=True), primary_key=True,
        server_default=text("gen_random_uuid()")
    )
    tag_number    = Column(String(50),  nullable=False, unique=True, index=True)
    description   = Column(String(255))
    area          = Column(String(100))
    unit          = Column(String(100))
    instrument_type = Column(
        SAEnum(InstrumentType, name="instrument_type_enum", values_callable=lambda obj: [e.value for e in obj]),
        nullable=False
    )
    manufacturer      = Column(String(100))
    model             = Column(String(100))
    serial_number     = Column(String(100))
    measurement_lrv   = Column(Float)
    measurement_urv   = Column(Float)
    engineering_units = Column(String(20))
    output_type       = Column(String(50))

    calibration_interval_days = Column(Integer)
    tolerance_type = Column(SAEnum(ToleranceType, name="tolerance_type_enum", values_callable=lambda obj: [e.value for e in obj]))
    tolerance_value  = Column(Float)
    num_test_points  = Column(Integer, nullable=False, server_default="5")
    test_point_values = Column(JSONB)   # array of floats, e.g. [0.0, 25.0, 50.0, 75.0, 100.0]

    criticality = Column(SAEnum(Criticality, name="criticality_enum", values_callable=lambda obj: [e.value for e in obj]))
    status = Column(
        SAEnum(InstrumentStatus, name="instrument_status_enum", values_callable=lambda obj: [e.value for e in obj]),
        nullable=False, server_default="active"
    )

    procedure_reference     = Column(String(100))
    last_calibration_date   = Column(Date)
    last_calibration_result = Column(
        SAEnum(CalibrationResultStatus, name="calibration_result_status_enum", values_callable=lambda obj: [e.value for e in obj]),
        nullable=False, server_default="not_calibrated"
    )
    calibration_due_date = Column(Date)

    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), nullable=False,
        server_default=func.now(), onupdate=func.now()
    )
    created_by = Column(String(100))


class CalibrationRecord(Base):
    __tablename__ = "calibration_records"

    id = Column(
        UUID(as_uuid=True), primary_key=True,
        server_default=text("gen_random_uuid()")
    )
    instrument_id = Column(
        UUID(as_uuid=True),
        ForeignKey("instruments.id", ondelete="RESTRICT"),
        nullable=False, index=True
    )
    calibration_date = Column(Date, nullable=False)
    calibration_type = Column(
        SAEnum(CalibrationType, name="calibration_type_enum", values_callable=lambda obj: [e.value for e in obj]),
        nullable=False
    )
    technician_name = Column(String(100))
    # References Supabase auth.users — stored as UUID, no DB-level FK
    technician_id   = Column(UUID(as_uuid=True))

    reference_standard_description = Column(String(255))
    reference_standard_serial       = Column(String(100))
    reference_standard_cert_number  = Column(String(100))
    reference_standard_cert_expiry  = Column(Date)
    procedure_used                  = Column(String(100))

    adjustment_made  = Column(Boolean, nullable=False, server_default="false")
    adjustment_type  = Column(String(100))
    adjustment_notes = Column(Text)
    technician_notes = Column(Text)

    defect_found       = Column(Boolean, nullable=False, server_default="false")
    defect_description = Column(Text)
    return_to_service  = Column(Boolean)

    as_found_result = Column(SAEnum(AsFoundResult, name="as_found_result_enum", values_callable=lambda obj: [e.value for e in obj]))
    as_left_result  = Column(SAEnum(AsLeftResult,  name="as_left_result_enum",  values_callable=lambda obj: [e.value for e in obj]))

    max_as_found_error_pct = Column(Float)
    max_as_left_error_pct  = Column(Float)

    record_status = Column(
        SAEnum(RecordStatus, name="record_status_enum", values_callable=lambda obj: [e.value for e in obj]),
        nullable=False, server_default="draft"
    )
    work_order_reference = Column(String(100))

    created_at   = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    approved_by  = Column(String(100))
    approved_at  = Column(DateTime(timezone=True))


# ---------------------------------------------------------------------------
# Auth / tenancy models
# ---------------------------------------------------------------------------

class Site(Base):
    __tablename__ = "sites"

    id = Column(
        UUID(as_uuid=True), primary_key=True,
        server_default=text("gen_random_uuid()")
    )
    name                = Column(String(100), nullable=False, unique=True)
    subscription_status = Column(String(50),  nullable=False, server_default=text("'trialing'"))
    plan                = Column(String(50),  nullable=False, server_default=text("'starter'"))
    created_at          = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

    # Stripe integration fields
    stripe_customer_id              = Column(String(255))
    stripe_subscription_id          = Column(String(255))
    subscription_plan               = Column(String(50))   # starter / professional / enterprise
    subscription_interval           = Column(String(20))   # month / year
    trial_ends_at                   = Column(DateTime(timezone=True))
    subscription_current_period_end = Column(DateTime(timezone=True))


class SiteMember(Base):
    __tablename__ = "site_members"

    id           = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    site_id      = Column(UUID(as_uuid=True), ForeignKey("sites.id", ondelete="CASCADE"), nullable=False)
    user_id      = Column(UUID(as_uuid=True), nullable=False, unique=True)  # one site per user
    role         = Column(String(50),  nullable=False, server_default=text("'technician'"))
    display_name = Column(String(100))
    email        = Column(String(255))
    created_at   = Column(DateTime(timezone=True), nullable=False, server_default=func.now())


class AuditLog(Base):
    __tablename__ = "audit_log"

    id           = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    site_id      = Column(UUID(as_uuid=True), nullable=False, index=True)
    entity_type  = Column(String(50),  nullable=False)    # 'instrument' | 'calibration_record'
    entity_id    = Column(UUID(as_uuid=True), nullable=False)
    user_id      = Column(String(100), nullable=False)
    user_name    = Column(String(100), nullable=False)
    action       = Column(String(50),  nullable=False)    # create | update | delete | submit | approve | reject | bulk_import
    changed_fields = Column(JSONB)
    created_at   = Column(DateTime(timezone=True), nullable=False, server_default=func.now())


class NotificationPreference(Base):
    __tablename__ = "notification_preferences"

    id                     = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    site_member_id         = Column(UUID(as_uuid=True), ForeignKey("site_members.id", ondelete="CASCADE"), nullable=False, unique=True)
    notify_overdue_digest  = Column(Boolean, nullable=False, server_default="true")
    notify_due_soon_digest = Column(Boolean, nullable=False, server_default="true")
    notify_submission      = Column(Boolean, nullable=False, server_default="true")
    notify_approval        = Column(Boolean, nullable=False, server_default="true")
    created_at             = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at             = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())


class CalibrationQueue(Base):
    """
    Shared calibration work queue — instruments added by planners/technicians
    to be calibrated. Auto-cleaned when a new calibration is recorded.
    Site-isolated via site_name (matches instruments.created_by).
    """
    __tablename__ = "calibration_queue"

    id            = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    site_name     = Column(String(100), nullable=False, index=True)
    instrument_id = Column(UUID(as_uuid=True), ForeignKey("instruments.id", ondelete="CASCADE"), nullable=False, index=True)
    added_by_name = Column(String(100), nullable=False, server_default="''")
    added_at      = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    priority      = Column(Integer, nullable=False, server_default="0")
    notes         = Column(Text)


class CalTestPoint(Base):
    __tablename__ = "cal_test_points"

    id = Column(
        UUID(as_uuid=True), primary_key=True,
        server_default=text("gen_random_uuid()")
    )
    calibration_record_id = Column(
        UUID(as_uuid=True),
        ForeignKey("calibration_records.id", ondelete="CASCADE"),
        nullable=False, index=True
    )
    point_number    = Column(Integer, nullable=False)
    nominal_input   = Column(Float,   nullable=False)
    expected_output = Column(Float,   nullable=False)

    as_found_output = Column(Float)
    as_left_output  = Column(Float)   # nullable — only set when adjustment made

    as_found_error_abs = Column(Float)
    as_found_error_pct = Column(Float)
    as_left_error_abs  = Column(Float)
    as_left_error_pct  = Column(Float)

    as_found_result = Column(SAEnum(AsFoundResult, name="as_found_result_enum", values_callable=lambda obj: [e.value for e in obj]))
    as_left_result  = Column(SAEnum(AsLeftResult,  name="as_left_result_enum",  values_callable=lambda obj: [e.value for e in obj]))


class Document(Base):
    __tablename__ = "documents"

    id = Column(
        UUID(as_uuid=True), primary_key=True,
        server_default=text("gen_random_uuid()")
    )
    site_name         = Column(String(100), nullable=False, index=True)
    title             = Column(String(255), nullable=False)
    doc_type          = Column(String(50), nullable=False, server_default="'procedure'")
    file_name         = Column(String(255), nullable=False)
    file_size         = Column(Integer)
    file_url          = Column(Text)
    notes             = Column(Text)
    uploaded_by       = Column(String(100), nullable=False, server_default="''")
    created_at        = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at        = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())


class DocumentInstrument(Base):
    __tablename__ = "document_instruments"

    id = Column(
        UUID(as_uuid=True), primary_key=True,
        server_default=text("gen_random_uuid()")
    )
    document_id = Column(
        UUID(as_uuid=True),
        ForeignKey("documents.id", ondelete="CASCADE"),
        nullable=False, index=True
    )
    instrument_id = Column(
        UUID(as_uuid=True),
        ForeignKey("instruments.id", ondelete="CASCADE"),
        nullable=False, index=True
    )


class PilotRequest(Base):
    """
    Inbound pilot/free-trial requests from the marketing site contact form.
    Each row has a unique token used for one-click approve/deny links in the
    notification email sent to the CalCheq team.
    """
    __tablename__ = "pilot_requests"

    id          = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    created_at  = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    first_name  = Column(String(100), nullable=False)
    last_name   = Column(String(100), nullable=False)
    company     = Column(String(255), nullable=False)
    location    = Column(String(255), nullable=False)
    role        = Column(String(100), nullable=False)
    email       = Column(String(255), nullable=False)
    phone       = Column(String(100), nullable=False)
    num_instruments = Column(String(50),  nullable=False)
    current_system  = Column(String(100), nullable=False)
    message     = Column(Text, nullable=False, server_default=text("''"))
    status      = Column(String(50),  nullable=False, server_default=text("'pending'"))   # pending / approved / denied
    token       = Column(UUID(as_uuid=True), nullable=False, unique=True, server_default=text("gen_random_uuid()"))
    actioned_at = Column(DateTime(timezone=True))
