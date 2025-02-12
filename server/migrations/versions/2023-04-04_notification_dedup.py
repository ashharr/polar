"""notification_dedup

Revision ID: de3f20107650
Revises: f5b7b34484d9
Create Date: 2023-04-04 15:58:04.931730

"""
from alembic import op
import sqlalchemy as sa


# Polar Custom Imports

# revision identifiers, used by Alembic.
revision = "de3f20107650"
down_revision = "f5b7b34484d9"
branch_labels: tuple[str] | None = None
depends_on: tuple[str] | None = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.execute("truncate table notifications")

    op.add_column(
        "notifications", sa.Column("pull_request_id", sa.UUID(), nullable=True)
    )
    op.add_column("notifications", sa.Column("dedup_key", sa.String(), nullable=False))
    op.create_unique_constraint(
        op.f("notifications_dedup_key_key"), "notifications", ["dedup_key"]
    )
    op.create_foreign_key(
        op.f("notifications_pull_request_id_fkey"),
        "notifications",
        "pull_requests",
        ["pull_request_id"],
        ["id"],
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(
        op.f("notifications_pull_request_id_fkey"), "notifications", type_="foreignkey"
    )
    op.drop_constraint(
        op.f("notifications_dedup_key_key"), "notifications", type_="unique"
    )
    op.drop_column("notifications", "dedup_key")
    op.drop_column("notifications", "pull_request_id")
    # ### end Alembic commands ###
