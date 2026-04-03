"""Create initial tables: instruments, calibration_records, cal_test_points

Revision ID: 001_initial
Revises:
Create Date: 2026-04-02
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# ---------------------------------------------------------------------------
# Helpers — reusable ENUM references (create_type=False because we create
# them explicitly before the tables, avoiding double-CREATE errors)
# ---------------------------------------------------------------------------

def _enum(name: str, *values: str) -> postgresql.ENUM:
    """Return a pg ENUM that will NOT auto-create its type on table creation."""
    return postgresql.ENUM(*values, name=name, create_type=False)


# Column-type objects used in create_table (create_type=False)
instrument_type_col        = _enum("instrument_type_enum",
    "pressure", "temperature", "flow", "level", "analyser", "switch", "valve", "other")
tolerance_type_col         = _enum("tolerance_type_enum",
    "percent_span", "percent_reading", "absolute")
criticality_col            = _enum("criticality_enum",
    "safety_critical", "process_critical", "standard", "non_critical")
instrument_status_col      = _enum("instrument_status_enum",
    "active", "spare", "out_of_service", "decommissioned")
cal_result_status_col      = _enum("calibration_result_status_enum",
    "pass", "fail", "marginal", "not_calibrated")
calibration_type_col       = _enum("calibration_type_enum",
    "routine", "corrective", "post_repair", "initial")
as_found_result_col        = _enum("as_found_result_enum",
    "pass", "fail", "marginal")
as_left_result_col         = _enum("as_left_result_enum",
    "pass", "fail", "marginal", "not_required")
record_status_col          = _enum("record_status_enum",
    "draft", "submitted", "approved", "rejected")


def upgrade() -> None:
    bind = op.get_bind()

    # ------------------------------------------------------------------
    # 1. Create all PostgreSQL enum types first
    # ------------------------------------------------------------------
    postgresql.ENUM("pressure", "temperature", "flow", "level",
                    "analyser", "switch", "valve", "other",
                    name="instrument_type_enum").create(bind, checkfirst=True)

    postgresql.ENUM("percent_span", "percent_reading", "absolute",
                    name="tolerance_type_enum").create(bind, checkfirst=True)

    postgresql.ENUM("safety_critical", "process_critical", "standard", "non_critical",
                    name="criticality_enum").create(bind, checkfirst=True)

    postgresql.ENUM("active", "spare", "out_of_service", "decommissioned",
                    name="instrument_status_enum").create(bind, checkfirst=True)

    postgresql.ENUM("pass", "fail", "marginal", "not_calibrated",
                    name="calibration_result_status_enum").create(bind, checkfirst=True)

    postgresql.ENUM("routine", "corrective", "post_repair", "initial",
                    name="calibration_type_enum").create(bind, checkfirst=True)

    postgresql.ENUM("pass", "fail", "marginal",
                    name="as_found_result_enum").create(bind, checkfirst=True)

    postgresql.ENUM("pass", "fail", "marginal", "not_required",
                    name="as_left_result_enum").create(bind, checkfirst=True)

    postgresql.ENUM("draft", "submitted", "approved", "rejected",
                    name="record_status_enum").create(bind, checkfirst=True)

    # ------------------------------------------------------------------
    # 2. instruments
    # ------------------------------------------------------------------
    op.create_table(
        "instruments",
        sa.Column("id", postgresql.UUID(as_uuid=True),
                  server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("tag_number",    sa.String(50),  nullable=False),
        sa.Column("description",   sa.String(255)),
        sa.Column("area",          sa.String(100)),
        sa.Column("unit",          sa.String(100)),
        sa.Column("instrument_type", instrument_type_col, nullable=False),
        sa.Column("manufacturer",  sa.String(100)),
        sa.Column("model",         sa.String(100)),
        sa.Column("serial_number", sa.String(100)),
        sa.Column("measurement_lrv",   sa.Float()),
        sa.Column("measurement_urv",   sa.Float()),
        sa.Column("engineering_units", sa.String(20)),
        sa.Column("output_type",       sa.String(50)),
        sa.Column("calibration_interval_days", sa.Integer()),
        sa.Column("tolerance_type",  tolerance_type_col),
        sa.Column("tolerance_value", sa.Float()),
        sa.Column("num_test_points", sa.Integer(), nullable=False, server_default="5"),
        sa.Column("test_point_values", postgresql.JSONB(astext_type=sa.Text())),
        sa.Column("criticality", criticality_col),
        sa.Column("status", instrument_status_col, nullable=False, server_default="active"),
        sa.Column("procedure_reference",    sa.String(100)),
        sa.Column("last_calibration_date",  sa.Date()),
        sa.Column("last_calibration_result", cal_result_status_col,
                  nullable=False, server_default="not_calibrated"),
        sa.Column("calibration_due_date", sa.Date()),
        sa.Column("created_at", sa.DateTime(timezone=True),
                  nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True),
                  nullable=False, server_default=sa.text("now()")),
        sa.Column("created_by", sa.String(100)),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("tag_number", name="uq_instruments_tag_number"),
    )
    op.create_index("ix_instruments_tag_number", "instruments", ["tag_number"])

    # ------------------------------------------------------------------
    # 3. calibration_records
    # ------------------------------------------------------------------
    op.create_table(
        "calibration_records",
        sa.Column("id", postgresql.UUID(as_uuid=True),
                  server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("instrument_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("calibration_date", sa.Date(), nullable=False),
        sa.Column("calibration_type", calibration_type_col, nullable=False),
        sa.Column("technician_name", sa.String(100)),
        sa.Column("technician_id",   postgresql.UUID(as_uuid=True)),
        sa.Column("reference_standard_description", sa.String(255)),
        sa.Column("reference_standard_serial",       sa.String(100)),
        sa.Column("reference_standard_cert_number",  sa.String(100)),
        sa.Column("reference_standard_cert_expiry",  sa.Date()),
        sa.Column("procedure_used",    sa.String(100)),
        sa.Column("adjustment_made",   sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("adjustment_type",   sa.String(100)),
        sa.Column("adjustment_notes",  sa.Text()),
        sa.Column("technician_notes",  sa.Text()),
        sa.Column("defect_found",       sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("defect_description", sa.Text()),
        sa.Column("return_to_service",  sa.Boolean()),
        sa.Column("as_found_result", as_found_result_col),
        sa.Column("as_left_result",  as_left_result_col),
        sa.Column("max_as_found_error_pct", sa.Float()),
        sa.Column("max_as_left_error_pct",  sa.Float()),
        sa.Column("record_status", record_status_col, nullable=False, server_default="draft"),
        sa.Column("work_order_reference", sa.String(100)),
        sa.Column("created_at",  sa.DateTime(timezone=True),
                  nullable=False, server_default=sa.text("now()")),
        sa.Column("approved_by", sa.String(100)),
        sa.Column("approved_at", sa.DateTime(timezone=True)),
        sa.ForeignKeyConstraint(
            ["instrument_id"], ["instruments.id"],
            name="fk_cal_records_instrument", ondelete="RESTRICT"
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_calibration_records_instrument_id",
                    "calibration_records", ["instrument_id"])

    # ------------------------------------------------------------------
    # 4. cal_test_points
    # ------------------------------------------------------------------
    op.create_table(
        "cal_test_points",
        sa.Column("id", postgresql.UUID(as_uuid=True),
                  server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("calibration_record_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("point_number",    sa.Integer(), nullable=False),
        sa.Column("nominal_input",   sa.Float(),   nullable=False),
        sa.Column("expected_output", sa.Float(),   nullable=False),
        sa.Column("as_found_output", sa.Float()),
        sa.Column("as_left_output",  sa.Float()),
        sa.Column("as_found_error_abs", sa.Float()),
        sa.Column("as_found_error_pct", sa.Float()),
        sa.Column("as_left_error_abs",  sa.Float()),
        sa.Column("as_left_error_pct",  sa.Float()),
        sa.Column("as_found_result", as_found_result_col),
        sa.Column("as_left_result",  as_left_result_col),
        sa.ForeignKeyConstraint(
            ["calibration_record_id"], ["calibration_records.id"],
            name="fk_test_points_cal_record", ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_cal_test_points_record_id",
                    "cal_test_points", ["calibration_record_id"])


def downgrade() -> None:
    bind = op.get_bind()

    op.drop_table("cal_test_points")
    op.drop_table("calibration_records")
    op.drop_table("instruments")

    for name in (
        "record_status_enum",
        "as_left_result_enum",
        "as_found_result_enum",
        "calibration_type_enum",
        "calibration_result_status_enum",
        "instrument_status_enum",
        "criticality_enum",
        "tolerance_type_enum",
        "instrument_type_enum",
    ):
        postgresql.ENUM(name=name).drop(bind, checkfirst=True)
