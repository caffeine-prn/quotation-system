from typing import Optional, List
from datetime import date
from decimal import Decimal
from pydantic import BaseModel

class PriceTableBase(BaseModel):
    name: str
    unit: str
    unit_price: Decimal
    description: Optional[str] = None
    notes: Optional[str] = None
    valid_from: date
    valid_until: Optional[date] = None
    company_id: int

class PriceTableCreate(PriceTableBase):
    pass

class PriceTableUpdate(BaseModel):
    name: Optional[str] = None
    unit: Optional[str] = None
    unit_price: Optional[Decimal] = None
    description: Optional[str] = None
    notes: Optional[str] = None
    valid_from: Optional[date] = None
    valid_until: Optional[date] = None

class PriceTable(PriceTableBase):
    id: int
    created_at: date

    class Config:
        orm_mode = True

class PriceTableImport(BaseModel):
    company_id: int
    valid_from: date
    valid_until: Optional[date] = None
    file_content: List[dict]  # Excel 파일에서 파싱된 데이터

class PriceTableExport(BaseModel):
    company_id: int
    start_date: Optional[date] = None
    end_date: Optional[date] = None