from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import os
from tempfile import NamedTemporaryFile

from app.core.auth import get_current_user
from app.core.permissions import require_permissions, Permission
from fastapi.background import BackgroundTasks
from app.db.base import get_db
from app.models.models import User, Quotation
from app.services.quotation import get_quotation
from app.utils.excel_generator import ExcelGenerator
from app.utils.pdf_generator import PDFGenerator

router = APIRouter()

def _prepare_quotation_data(quotation: Quotation) -> dict:
    """견적서 데이터 준비"""
    return {
        "quote_number": quotation.quote_number,
        "date": quotation.created_at.strftime("%Y-%m-%d"),
        "valid_until": quotation.valid_until.strftime("%Y-%m-%d"),
        "customer_name": quotation.customer.name,
        "project_description": quotation.project_description,
        "items": [
            {
                "name": item.price_table.name,
                "quantity": item.quantity,
                "unit_price": item.unit_price,
                "discount_amount": item.discount_amount,
                "remark": item.remark
            }
            for item in quotation.items
        ],
        "total_amount": quotation.total_amount,
    }

@router.get("/quotations/{quotation_id}/export/excel")
@require_permissions([Permission.VIEW_QUOTATION])
async def export_quotation_excel(
    quotation_id: int,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """견적서 Excel 다운로드"""
    quotation = get_quotation(db, quotation_id)
    if not quotation:
        raise HTTPException(status_code=404, detail="Quotation not found")
    
    if not current_user.is_admin and quotation.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Excel 생성
    generator = ExcelGenerator()
    workbook = generator.generate_quotation(_prepare_quotation_data(quotation))
    
    # 임시 파일로 저장
    temp_file = NamedTemporaryFile(delete=False, suffix='.xlsx')
    workbook.save(temp_file.name)
    
    # 파일 응답
    filename = f"quotation_{quotation.quote_number}.xlsx"
    background_tasks.add_task(os.unlink, temp_file.name)
    return FileResponse(
        temp_file.name,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        filename=filename
    )

@router.get("/quotations/{quotation_id}/export/pdf")
@require_permissions([Permission.VIEW_QUOTATION])
async def export_quotation_pdf(
    quotation_id: int,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """견적서 PDF 다운로드"""
    quotation = get_quotation(db, quotation_id)
    if not quotation:
        raise HTTPException(status_code=404, detail="Quotation not found")
    
    if not current_user.is_admin and quotation.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # PDF 생성
    generator = PDFGenerator()
    pdf_path = generator.generate_quotation(_prepare_quotation_data(quotation))
    
    # 파일 응답
    filename = f"quotation_{quotation.quote_number}.pdf"
    background_tasks.add_task(os.unlink, pdf_path)
    return FileResponse(
        pdf_path,
        media_type="application/pdf",
        filename=filename
    )