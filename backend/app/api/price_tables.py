from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from datetime import date
import io

from app.db.base import get_db
from app.core.auth import get_current_active_user, get_current_active_superuser
from app.core.permissions import require_permissions, Permission
from app.services import price_table as price_table_service
from app.schemas.price_table import (
    PriceTable,
    PriceTableCreate,
    PriceTableUpdate,
    PriceTableImport
)
from app.schemas.user import User

router = APIRouter()

@router.get("/{company_id}", response_model=List[PriceTable])
@require_permissions([Permission.VIEW_PRICE_TABLES])
async def read_price_tables(
    company_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    skip: int = 0,
    limit: int = 100,
    valid_date: date = None
) -> Any:
    """단가표 목록 조회"""
    return price_table_service.get_price_tables(
        db,
        company_id=company_id,
        skip=skip,
        limit=limit,
        valid_date=valid_date
    )

@router.post("/{company_id}", response_model=PriceTable)
@require_permissions([Permission.MANAGE_PRICE_TABLES])
async def create_price_table(
    company_id: int,
    price_table_in: PriceTableCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """단가표 항목 생성"""
    return price_table_service.create_price_table(db, price_table_in)

@router.put("/{price_table_id}", response_model=PriceTable)
@require_permissions([Permission.MANAGE_PRICE_TABLES])
async def update_price_table(
    price_table_id: int,
    price_table_in: PriceTableUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """단가표 항목 수정"""
    price_table = price_table_service.update_price_table(
        db, price_table_id, price_table_in
    )
    if not price_table:
        raise HTTPException(status_code=404, detail="Price table not found")
    return price_table

@router.delete("/{price_table_id}")
@require_permissions([Permission.MANAGE_PRICE_TABLES])
async def delete_price_table(
    price_table_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """단가표 항목 삭제"""
    if not price_table_service.delete_price_table(db, price_table_id):
        raise HTTPException(status_code=404, detail="Price table not found")
    return {"success": True}

@router.post("/{company_id}/import")
@require_permissions([Permission.MANAGE_PRICE_TABLES])
async def import_price_tables(
    company_id: int,
    file: UploadFile = File(...),
    valid_from: date = None,
    valid_until: date = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser)
) -> Any:
    """엑셀 파일에서 단가표 가져오기"""
    contents = await file.read()
    
    try:
        # 데이터 파싱
        data = price_table_service.parse_excel_file(contents)
        
        # 데이터 유효성 검사
        if not price_table_service.validate_price_table_data(data):
            raise HTTPException(
                status_code=400,
                detail="Invalid file format or data"
            )
        
        # 데이터 가져오기
        import_data = PriceTableImport(
            company_id=company_id,
            valid_from=valid_from or date.today(),
            valid_until=valid_until,
            file_content=data
        )
        
        price_tables = price_table_service.import_price_tables(db, import_data)
        return {"message": f"Successfully imported {len(price_tables)} price tables"}
        
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to import price tables: {str(e)}"
        )

@router.post("/{company_id}/import/preview")
@require_permissions([Permission.MANAGE_PRICE_TABLES])
async def preview_price_table_import(
    company_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """단가표 가져오기 미리보기"""
    contents = await file.read()
    
    try:
        preview_data = price_table_service.preview_price_table_import(contents)
        return {"preview": preview_data}
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to preview price tables: {str(e)}"
        )

@router.get("/{company_id}/export")
@require_permissions([Permission.VIEW_PRICE_TABLES])
async def export_price_tables(
    company_id: int,
    start_date: date = None,
    end_date: date = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """단가표 내보내기"""
    excel_data = price_table_service.export_price_tables(
        db,
        company_id=company_id,
        start_date=start_date,
        end_date=end_date
    )
    
    return StreamingResponse(
        io.BytesIO(excel_data),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": f"attachment; filename=price_tables_{company_id}.xlsx"
        }
    )