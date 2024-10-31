from typing import List, Optional, Dict, Any
from datetime import date, datetime
from decimal import Decimal
from pydantic import BaseModel

class QuotationItemBase(BaseModel):
    price_table_id: int
    quantity: int
    unit_price: Decimal
    discount_amount: Optional[Decimal] = Decimal('0')

class QuotationItemCreate(QuotationItemBase):
    pass

class QuotationItem(QuotationItemBase):
    id: int
    quotation_id: int
    created_at: date

    class Config:
        orm_mode = True

class QuotationBase(BaseModel):
    customer_id: int
    project_description: str
    valid_until: date
    discount_amount: Optional[Decimal] = Decimal('0')

class QuotationCreate(QuotationBase):
    items: List[QuotationItemCreate]

class QuotationUpdate(BaseModel):
    project_description: Optional[str] = None
    valid_until: Optional[date] = None
    discount_amount: Optional[Decimal] = None
    items: Optional[List[QuotationItemCreate]] = None

class Quotation(QuotationBase):
    id: int
    quote_number: str
    version: int
    created_by: int
    total_amount: Decimal
    status: str
    created_at: date
    items: List[QuotationItem]

    class Config:
        orm_mode = True

class VersionBase(BaseModel):
    changes: Dict[str, Any]

class VersionCreate(VersionBase):
    pass

class VersionResponse(VersionBase):
    id: int
    quotation_id: int
    version_number: int
    created_at: datetime
    created_by: int

    class Config:
        orm_mode = True