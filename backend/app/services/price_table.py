from typing import List, Optional, Dict
from datetime import date
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
import pandas as pd
import io
from app.models.models import PriceTable
from app.schemas.price_table import PriceTableCreate, PriceTableUpdate, PriceTableImport

def get_price_table(db: Session, price_table_id: int) -> Optional[PriceTable]:
    return db.query(PriceTable).filter(PriceTable.id == price_table_id).first()

def get_price_tables(
    db: Session,
    company_id: int,
    skip: int = 0,
    limit: int = 100,
    valid_date: Optional[date] = None
) -> List[PriceTable]:
    query = db.query(PriceTable).filter(PriceTable.company_id == company_id)
    
    if valid_date:
        query = query.filter(
            and_(
                PriceTable.valid_from <= valid_date,
                or_(
                    PriceTable.valid_until.is_(None),
                    PriceTable.valid_until >= valid_date
                )
            )
        )
    
    return query.offset(skip).limit(limit).all()

def create_price_table(
    db: Session,
    price_table: PriceTableCreate
) -> PriceTable:
    db_price_table = PriceTable(**price_table.dict())
    db.add(db_price_table)
    db.commit()
    db.refresh(db_price_table)
    return db_price_table

def update_price_table(
    db: Session,
    price_table_id: int,
    price_table: PriceTableUpdate
) -> Optional[PriceTable]:
    db_price_table = get_price_table(db, price_table_id)
    if not db_price_table:
        return None
    
    update_data = price_table.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_price_table, field, value)
    
    db.commit()
    db.refresh(db_price_table)
    return db_price_table

def delete_price_table(db: Session, price_table_id: int) -> bool:
    db_price_table = get_price_table(db, price_table_id)
    if not db_price_table:
        return False
    
    db.delete(db_price_table)
    db.commit()
    return True

def import_price_tables(
    db: Session,
    import_data: PriceTableImport
) -> List[PriceTable]:
    new_price_tables = []
    
    for row in import_data.file_content:
        price_table_data = PriceTableCreate(
            company_id=import_data.company_id,
            valid_from=import_data.valid_from,
            valid_until=import_data.valid_until,
            name=row["Name"],
            unit=row["Unit"],
            unit_price=row["Unit price"],
            description=row.get("Description"),
            notes=row.get("비고")
        )
        new_price_table = create_price_table(db, price_table_data)
        new_price_tables.append(new_price_table)
    
    return new_price_tables

def export_price_tables(
    db: Session,
    company_id: int,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
) -> bytes:
    query = db.query(PriceTable).filter(PriceTable.company_id == company_id)
    
    if start_date:
        query = query.filter(PriceTable.valid_from >= start_date)
    if end_date:
        query = query.filter(
            or_(
                PriceTable.valid_until.is_(None),
                PriceTable.valid_until <= end_date
            )
        )
    
    price_tables = query.all()
    
    # Convert to DataFrame
    data = []
    for pt in price_tables:
        data.append({
            "Name": pt.name,
            "Unit": pt.unit,
            "Unit price": pt.unit_price,
            "Description": pt.description,
            "비고": pt.notes,
            "Valid From": pt.valid_from,
            "Valid Until": pt.valid_until
        })
    
    df = pd.DataFrame(data)
    
    # Export to Excel
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False)
    
    return output.getvalue()

def parse_excel_file(file_content: bytes) -> List[Dict]:
    """엑셀 파일 파싱"""
    df = pd.read_excel(io.BytesIO(file_content))
    return df.to_dict('records')

def validate_price_table_data(data: List[Dict]) -> bool:
    """단가표 데이터 유효성 검사"""
    required_fields = {"Name", "Unit", "Unit price"}
    
    for row in data:
        if not all(field in row for field in required_fields):
            return False
        
        # 단가가 숫자인지 확인
        try:
            float(row["Unit price"])
        except (ValueError, TypeError):
            return False
    
    return True

def preview_price_table_import(file_content: bytes) -> List[Dict]:
    """단가표 가져오기 미리보기"""
    data = parse_excel_file(file_content)
    
    # 첫 5개 행만 반환
    return data[:5]