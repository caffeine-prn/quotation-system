from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.base import get_db
from app.core.auth import get_current_active_user
from app.core.permissions import require_permissions, Permission
from app.services import company as company_service
from app.schemas.company import (
    Company,
    CompanyCreate,
    CompanyUpdate,
    Product,
    ProductCreate,
    ProductUpdate,
    MediaType,
    MediaTypeCreate,
    MediaTypeUpdate,
)
from app.schemas.user import User

router = APIRouter()

# Company endpoints
@router.get("/", response_model=List[Company])
@require_permissions([Permission.VIEW_COMPANIES])
async def read_companies(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    include_inactive: bool = False,
) -> Any:
    """회사 목록 조회"""
    if current_user.role != "admin" and include_inactive:
        include_inactive = False
    return company_service.get_companies(
        db, skip=skip, limit=limit, include_inactive=include_inactive
    )

@router.post("/", response_model=Company)
@require_permissions([Permission.MANAGE_COMPANIES])
async def create_company(
    *,
    db: Session = Depends(get_db),
    company_in: CompanyCreate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """회사 생성"""
    return company_service.create_company(db, company_in)

@router.get("/{company_id}", response_model=Company)
@require_permissions([Permission.VIEW_COMPANIES])
async def read_company(
    company_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """회사 상세 조회"""
    company = company_service.get_company(db, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company

@router.put("/{company_id}", response_model=Company)
@require_permissions([Permission.MANAGE_COMPANIES])
async def update_company(
    *,
    db: Session = Depends(get_db),
    company_id: int,
    company_in: CompanyUpdate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """회사 정보 수정"""
    company = company_service.update_company(db, company_id, company_in)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company

@router.delete("/{company_id}")
@require_permissions([Permission.MANAGE_COMPANIES])
async def delete_company(
    *,
    db: Session = Depends(get_db),
    company_id: int,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """회사 삭제 (비활성화)"""
    if not company_service.delete_company(db, company_id):
        raise HTTPException(status_code=404, detail="Company not found")
    return {"success": True}

# Product endpoints
@router.get("/{company_id}/products", response_model=List[Product])
@require_permissions([Permission.VIEW_COMPANIES])
async def read_products(
    company_id: int,
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    include_inactive: bool = False,
) -> Any:
    """회사의 제품 목록 조회"""
    if current_user.role != "admin" and include_inactive:
        include_inactive = False
    return company_service.get_company_products(
        db, company_id, skip=skip, limit=limit, include_inactive=include_inactive
    )

@router.post("/{company_id}/products", response_model=Product)
@require_permissions([Permission.MANAGE_PRODUCTS])
async def create_product(
    *,
    db: Session = Depends(get_db),
    company_id: int,
    product_in: ProductCreate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """제품 생성"""
    return company_service.create_product(db, company_id, product_in)

@router.put("/products/{product_id}", response_model=Product)
@require_permissions([Permission.MANAGE_PRODUCTS])
async def update_product(
    *,
    db: Session = Depends(get_db),
    product_id: int,
    product_in: ProductUpdate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """제품 정보 수정"""
    product = company_service.update_product(db, product_id, product_in)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.delete("/products/{product_id}")
@require_permissions([Permission.MANAGE_PRODUCTS])
async def delete_product(
    *,
    db: Session = Depends(get_db),
    product_id: int,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """제품 삭제 (비활성화)"""
    if not company_service.delete_product(db, product_id):
        raise HTTPException(status_code=404, detail="Product not found")
    return {"success": True}

# Media Type endpoints
@router.get("/{company_id}/media-types", response_model=List[MediaType])
@require_permissions([Permission.VIEW_MEDIA_TYPES])
async def read_media_types(
    company_id: int,
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    include_inactive: bool = False,
) -> Any:
    """회사의 매체 유형 목록 조회"""
    if current_user.role != "admin" and include_inactive:
        include_inactive = False
    return company_service.get_company_media_types(
        db, company_id, skip=skip, limit=limit, include_inactive=include_inactive
    )

@router.post("/{company_id}/media-types", response_model=MediaType)
@require_permissions([Permission.MANAGE_MEDIA_TYPES])
async def create_media_type(
    *,
    db: Session = Depends(get_db),
    company_id: int,
    media_type_in: MediaTypeCreate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """매체 유형 생성"""
    return company_service.create_media_type(db, company_id, media_type_in)

@router.put("/media-types/{media_type_id}", response_model=MediaType)
@require_permissions([Permission.MANAGE_MEDIA_TYPES])
async def update_media_type(
    *,
    db: Session = Depends(get_db),
    media_type_id: int,
    media_type_in: MediaTypeUpdate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """매체 유형 수정"""
    media_type = company_service.update_media_type(db, media_type_id, media_type_in)
    if not media_type:
        raise HTTPException(status_code=404, detail="Media type not found")
    return media_type

@router.delete("/media-types/{media_type_id}")
@require_permissions([Permission.MANAGE_MEDIA_TYPES])
async def delete_media_type(
    *,
    db: Session = Depends(get_db),
    media_type_id: int,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """매체 유형 삭제 (비활성화)"""
    if not company_service.delete_media_type(db, media_type_id):
        raise HTTPException(status_code=404, detail="Media type not found")
    return {"success": True}

# Product Assignment endpoints
@router.post("/products/assign")
@require_permissions([Permission.ASSIGN_PRODUCTS])
async def assign_products(
    *,
    db: Session = Depends(get_db),
    user_id: int,
    product_ids: List[int],
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """제품을 사용자에게 할당"""
    if not company_service.assign_products_to_user(db, user_id, product_ids):
        raise HTTPException(status_code=400, detail="Failed to assign products")
    return {"success": True}

@router.get("/users/{user_id}/products", response_model=List[Product])
@require_permissions([Permission.VIEW_COMPANIES])
async def read_user_products(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """사용자에게 할당된 제품 목록 조회"""
    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return company_service.get_user_assigned_products(db, user_id, skip, limit)