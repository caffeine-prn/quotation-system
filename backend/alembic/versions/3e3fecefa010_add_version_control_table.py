"""add_version_control_table

Revision ID: 3e3fecefa010
Revises: 583cc63020bf
Create Date: 2024-10-31 14:28:20.074195

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3e3fecefa010'
down_revision: Union[str, None] = '583cc63020bf'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 버전 관리 테이블 생성
    op.create_table(
        'quotation_versions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('quotation_id', sa.Integer(), nullable=False),
        sa.Column('version_number', sa.Integer(), nullable=False),
        sa.Column('changes', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('created_by', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['quotation_id'], ['quotations.id'], ),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # 인덱스 생성
    op.create_index(
        'ix_quotation_versions_quotation_id',
        'quotation_versions',
        ['quotation_id']
    )

def downgrade() -> None:
    # 인덱스 삭제
    op.drop_index('ix_quotation_versions_quotation_id')
    
    # 테이블 삭제
    op.drop_table('quotation_versions')
