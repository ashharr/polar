"""empty message

Revision ID: 2b9e32f55fab
Revises: 4add676cc1fe, a26480d30322
Create Date: 2023-05-30 10:21:36.893004

"""
from alembic import op
import sqlalchemy as sa


# Polar Custom Imports
from polar.kit.extensions.sqlalchemy import PostgresUUID

# revision identifiers, used by Alembic.
revision = '2b9e32f55fab'
down_revision = ('4add676cc1fe', 'a26480d30322')
branch_labels: tuple[str] | None = None
depends_on: tuple[str] | None = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
