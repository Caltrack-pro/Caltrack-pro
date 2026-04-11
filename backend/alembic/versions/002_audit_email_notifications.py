"""Add audit_log, site_members.email, notification_preferences

Revision ID: 002_audit_email_notifications
Revises: 001_initial
Create Date: 2026-04-10
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "002_audit_email_notifications"
down_revision: Union[str, None] = "001_initial"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. audit_log table
    op.create_table(
        "audit_log",
        sa.Column("id",             postgresql.UUID(as_uuid=True), primary_key=True,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column("site_id",        postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("entity_type",    sa.Text(), nullable=False),
        sa.Column("entity_id",      postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id",        sa.String(100), nullable=False),
        sa.Column("user_name",      sa.String(100), nullable=False),
        sa.Column("action",         sa.String(50),  nullable=False),
        sa.Column("changed_fields", postgresql.JSONB()),
        sa.Column("created_at",     sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text("now()")),
    )
    op.create_index("idx_audit_log_entity", "audit_log", ["entity_type", "entity_id"])
    op.create_index("idx_audit_log_site",   "audit_log", ["site_id", "created_at"])

    # 2. email column on site_members
    op.add_column("site_members", sa.Column("email", sa.String(255)))

    # 3. notification_preferences table
    op.create_table(
        "notification_preferences",
        sa.Column("id",                     postgresql.UUID(as_uuid=True), primary_key=True,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column("site_member_id",         postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("notify_overdue_digest",  sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("notify_due_soon_digest", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("notify_submission",      sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("notify_approval",        sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("created_at",             sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text("now()")),
        sa.Column("updated_at",             sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(["site_member_id"], ["site_members.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("site_member_id"),
    )


def downgrade() -> None:
    op.drop_table("notification_preferences")
    op.drop_column("site_members", "email")
    op.drop_index("idx_audit_log_site",   table_name="audit_log")
    op.drop_index("idx_audit_log_entity", table_name="audit_log")
    op.drop_table("audit_log")
