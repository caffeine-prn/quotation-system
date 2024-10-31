from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    is_active: bool = True

class ProductCreate(ProductBase):
    pass

class ProductUpdate(ProductBase):
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class Product(ProductBase):
    id: int
    company_id: int
    created_at: datetime

    class Config:
        orm_mode = True

class MediaTypeBase(BaseModel):
    name: str
    description: Optional[str] = None
    is_active: bool = True

class MediaTypeCreate(MediaTypeBase):
    pass

class MediaTypeUpdate(MediaTypeBase):
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class MediaType(MediaTypeBase):
    id: int
    company_id: int
    created_at: datetime

    class Config:
        orm_mode = True

class CompanyBase(BaseModel):
    name: str
    description: Optional[str] = None
    contact_person: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    is_active: bool = True

class CompanyCreate(CompanyBase):
    pass

class CompanyUpdate(CompanyBase):
    name: Optional[str] = None
    description: Optional[str] = None
    contact_person: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    is_active: Optional[bool] = None

class Company(CompanyBase):
    id: int
    created_at: datetime
    products: List[Product] = []
    media_types: List[MediaType] = []

    class Config:
        orm_mode = True