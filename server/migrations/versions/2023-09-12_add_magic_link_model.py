"""Add MagicLink model and case-insensitive index to User.email column

Revision ID: 7ace57bba3b7
Revises: c26ca9e26647
Create Date: 2023-09-12 15:20:12.580741

"""
from alembic import op
import sqlalchemy as sa


# Polar Custom Imports
from polar.kit.extensions.sqlalchemy import PostgresUUID

# revision identifiers, used by Alembic.
revision = "7ace57bba3b7"
down_revision = "c26ca9e26647"
branch_labels: tuple[str] | None = None
depends_on: tuple[str] | None = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        "magic_links",
        sa.Column("token_hash", sa.String(), nullable=False),
        sa.Column("expires_at", sa.TIMESTAMP(timezone=True), nullable=False),
        sa.Column("user_email", sa.String(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=True),
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), nullable=False),
        sa.Column("modified_at", sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column("deleted_at", sa.TIMESTAMP(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            name=op.f("magic_links_user_id_fkey"),
            ondelete="cascade",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("magic_links_pkey")),
    )
    op.create_index(
        op.f("ix_magic_links_token_hash"), "magic_links", ["token_hash"], unique=False
    )
    op.drop_constraint("users_email_key", "users", type_="unique")
    op.create_index(
        "ix_users_email_case_insensitive",
        "users",
        [sa.text("lower(email)")],
        unique=True,
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index("ix_users_email_case_insensitive", table_name="users")
    op.create_unique_constraint("users_email_key", "users", ["email"])
    op.drop_index(op.f("ix_magic_links_token_hash"), table_name="magic_links")
    op.drop_table("magic_links")
    # ### end Alembic commands ###
