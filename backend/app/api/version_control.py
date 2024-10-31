from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.base import get_db
from app.core.auth import get_current_active_user
from app.models.models import User, QuotationVersion
from app.schemas.quotation import VersionCreate, VersionResponse
from app.services.version_service import VersionService

router = APIRouter()

@router.post("/quotations/{quotation_id}/versions", response_model=VersionResponse)
async def create_version(
    quotation_id: int,
    version_data: VersionCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    version_service = VersionService(db)
    return version_service.create_version(
        quotation_id=quotation_id,
        changes=version_data.changes,
        user_id=current_user.id
    )

@router.get("/quotations/{quotation_id}/versions", response_model=List[VersionResponse])
async def get_version_history(
    quotation_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    version_service = VersionService(db)
    return version_service.get_version_history(quotation_id)