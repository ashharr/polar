"""pledge.paid_at,refunded_at

Revision ID: da8a4e9d4431
Revises: c12e0331363b
Create Date: 2023-06-30 08:59:46.509955

"""
from alembic import op
import sqlalchemy as sa


# Polar Custom Imports
from polar.kit.extensions.sqlalchemy import PostgresUUID

# revision identifiers, used by Alembic.
revision = 'da8a4e9d4431'
down_revision = 'c12e0331363b'
branch_labels: tuple[str] | None = None
depends_on: tuple[str] | None = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('pledges', sa.Column('refunded_at', sa.TIMESTAMP(timezone=True), nullable=True))
    op.add_column('pledges', sa.Column('paid_at', sa.TIMESTAMP(timezone=True), nullable=True))
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('pledges', 'paid_at')
    op.drop_column('pledges', 'refunded_at')
    # ### end Alembic commands ###
