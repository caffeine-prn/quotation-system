from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.base import get_db
from app.core.auth import get_current_active_user
from app.core.permissions import require_permissions, Permission
from app.services import quotation as quotation_service
from app.schemas.quotation import Quotation, QuotationCreate, QuotationUpdate
from app.schemas.user import User

router = APIRouter()

@router.get("/", response_model=List[Quotation])
@require_permissions([Permission.VIEW_QUOTATION])
async def read_quotations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100)
) -> Any:
    """견적서 목록 조회"""
    quotations = quotation_service.get_quotations(
        db,
        user_id=current_user.id,
        skip=skip,
        limit=limit,
        is_admin=(current_user.role == "admin")
    )
    return quotations

@router.post("/", response_model=Quotation)
@require_permissions([Permission.CREATE_QUOTATION])
async def create_quotation(
    *,
    db: Session = Depends(get_db),
    quotation_in: QuotationCreate,
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """견적서 생성"""
    if current_user.role not in ["admin", "project_manager"]:
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions to create quotation"
        )
    quotation = quotation_service.create_quotation(
        db,
        quotation=quotation_in,
        user_id=current_user.id
    )
    return quotation

@router.get("/{quotation_id}", response_model=Quotation)
@require_permissions([Permission.VIEW_QUOTATION])
async def read_quotation(
    *,
    db: Session = Depends(get_db),
    quotation_id: int,
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """견적서 상세 조회"""
    quotation = quotation_service.get_quotation(db, quotation_id=quotation_id)
    if not quotation:
        raise HTTPException(status_code=404, detail="Quotation not found")
    if (current_user.role != "admin" and
        quotation.created_by != current_user.id):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return quotation

@router.put("/{quotation_id}", response_model=Quotation)
@require_permissions([Permission.EDIT_QUOTATION])
async def update_quotation(
    *,
    db: Session = Depends(get_db),
    quotation_id: int,
    quotation_in: QuotationUpdate,
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """견적서 수정"""
    quotation = quotation_service.update_quotation(
        db,
        quotation_id=quotation_id,
        quotation=quotation_in,
        user_id=current_user.id,
        is_admin=(current_user.role == "admin")
    )
    if not quotation:
        raise HTTPException(status_code=404, detail="Quotation not found")
    return quotation

@router.delete("/{quotation_id}")
@require_permissions([Permission.DELETE_QUOTATION])
async def delete_quotation(
    *,
    db: Session = Depends(get_db),
    quotation_id: int,
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """견적서 삭제"""
    if not quotation_service.delete_quotation(
        db,
        quotation_id=quotation_id,
        user_id=current_user.id,
        is_admin=(current_user.role == "admin")
    ):
        raise HTTPException(status_code=404, detail="Quotation not found")
    return {"success": True}

@router.get("/versions/{quote_number}", response_model=List[Quotation])
@require_permissions([Permission.VIEW_QUOTATION])
async def read_quotation_versions(
    *,
    db: Session = Depends(get_db),
    quote_number: str,
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """견적서 버전 이력 조회"""
    versions = quotation_service.get_quotation_versions(
        db,
        quote_number=quote_number,
        user_id=current_user.id,
        is_admin=(current_user.role == "admin")
    )
    if not versions:
        raise HTTPException(status_code=404, detail="Quotation not found")
    return versions

@router.put("/{quotation_id}/status", response_model=Quotation)
@require_permissions([Permission.EDIT_QUOTATION])
async def update_quotation_status(
    *,
    db: Session = Depends(get_db),
    quotation_id: int,
    status: str,
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """견적서 상태 업데이트"""
    if status not in ["draft", "pending", "approved", "rejected"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    quotation = quotation_service.update_quotation_status(
        db,
        quotation_id=quotation_id,
        status=status,
        user_id=current_user.id,
        is_admin=(current_user.role == "admin")
    )
    if not quotation:
        raise HTTPException(status_code=404, detail="Quotation not found")
    return quotation