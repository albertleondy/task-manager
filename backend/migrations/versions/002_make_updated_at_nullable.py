"""Make updated_at nullable and default None for boards and tasks

Revision ID: 002_make_updated_at_nullable
Revises: 001_initial_schema
Create Date: 2026-10-10 21:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "002_make_updated_at_nullable"
down_revision: Union[str, None] = "001_initial_schema"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Alter boards table updated_at to be nullable with no default
    with op.batch_alter_table("boards") as batch_op:
        batch_op.alter_column(
            "updated_at",
            existing_type=sa.DateTime(),
            nullable=True,
            server_default=None,
        )

    # 2. Alter tasks table updated_at to be nullable with no default
    with op.batch_alter_table("tasks") as batch_op:
        batch_op.alter_column(
            "updated_at",
            existing_type=sa.DateTime(),
            nullable=True,
            server_default=None,
        )

    # 3. Clean up historical rows where updated_at == created_at so they show as un-updated
    op.execute("UPDATE boards SET updated_at = NULL WHERE updated_at = created_at")
    op.execute("UPDATE tasks SET updated_at = NULL WHERE updated_at = created_at")


def downgrade() -> None:
    # Set any NULL updated_at back to created_at before enforcing NOT NULL
    op.execute("UPDATE tasks SET updated_at = created_at WHERE updated_at IS NULL")
    op.execute("UPDATE boards SET updated_at = created_at WHERE updated_at IS NULL")

    with op.batch_alter_table("tasks") as batch_op:
        batch_op.alter_column(
            "updated_at",
            existing_type=sa.DateTime(),
            nullable=False,
            server_default=sa.func.now(),
        )

    with op.batch_alter_table("boards") as batch_op:
        batch_op.alter_column(
            "updated_at",
            existing_type=sa.DateTime(),
            nullable=False,
            server_default=sa.func.now(),
        )
