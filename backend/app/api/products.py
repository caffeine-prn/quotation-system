from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.base import get_db
from app.core.auth import get_current_active_user
from app.core.permissions import require_permissions, Permission
from app.services import company as company_service
from app.models.models import User
from app.schemas.company import ProductCreate, Product

router = APIRouter()

@router.get("", response_model=List[Product])
@require_permissions([Permission.VIEW_COMPANIES])
async def read_products(
    company_id: int = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """제품 목록 조회"""
    return company_service.get_products(
        db,
        company_id=company_id,
        skip=skip,
        limit=limit
    )

@router.post("", response_model=Product)
@require_permissions([Permission.MANAGE_PRODUCTS])
async def create_product(
    product_in: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """제품 생성"""
    return company_service.create_product(db, product_in)

@router.put("/{product_id}", response_model=Product)
@require_permissions([Permission.MANAGE_PRODUCTS])
async def update_product(
    product_id: int,
    product_in: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """제품 수정"""
    product = company_service.get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return company_service.update_product(db, product_id, product_in)

@router.delete("/{product_id}")
@require_permissions([Permission.MANAGE_PRODUCTS])
async def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """제품 삭제"""
    product = company_service.get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if not company_service.delete_product(db, product_id):
        raise HTTPException(status_code=400, detail="Failed to delete product")
    return {"success": True}