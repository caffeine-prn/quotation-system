from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.models.models import Company, Product, MediaType
from app.schemas.company import CompanyCreate, CompanyUpdate, ProductCreate, ProductUpdate, MediaTypeCreate, MediaTypeUpdate

# Company Services
def get_company(db: Session, company_id: int) -> Optional[Company]:
    return db.query(Company).filter(Company.id == company_id).first()

def get_companies(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    include_inactive: bool = False
) -> List[Company]:
    query = db.query(Company)
    if not include_inactive:
        query = query.filter(Company.is_active == True)
    return query.offset(skip).limit(limit).all()

def create_company(db: Session, company: CompanyCreate) -> Company:
    db_company = Company(**company.dict())
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return db_company

def update_company(
    db: Session,
    company_id: int,
    company: CompanyUpdate
) -> Optional[Company]:
    db_company = get_company(db, company_id)
    if not db_company:
        return None
    
    update_data = company.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_company, field, value)
    
    db.commit()
    db.refresh(db_company)
    return db_company

def delete_company(db: Session, company_id: int) -> bool:
    db_company = get_company(db, company_id)
    if not db_company:
        return False
    
    # Soft delete
    db_company.is_active = False
    db.commit()
    return True

# Product Services
def get_product(db: Session, product_id: int) -> Optional[Product]:
    return db.query(Product).filter(Product.id == product_id).first()

def get_company_products(
    db: Session,
    company_id: int,
    skip: int = 0,
    limit: int = 100,
    include_inactive: bool = False
) -> List[Product]:
    query = db.query(Product).filter(Product.company_id == company_id)
    if not include_inactive:
        query = query.filter(Product.is_active == True)
    return query.offset(skip).limit(limit).all()

def create_product(
    db: Session,
    company_id: int,
    product: ProductCreate
) -> Product:
    db_product = Product(**product.dict(), company_id=company_id)
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def update_product(
    db: Session,
    product_id: int,
    product: ProductUpdate
) -> Optional[Product]:
    db_product = get_product(db, product_id)
    if not db_product:
        return None
    
    update_data = product.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_product, field, value)
    
    db.commit()
    db.refresh(db_product)
    return db_product

def delete_product(db: Session, product_id: int) -> bool:
    db_product = get_product(db, product_id)
    if not db_product:
        return False
    
    # Soft delete
    db_product.is_active = False
    db.commit()
    return True

# Media Type Services
def get_media_type(db: Session, media_type_id: int) -> Optional[MediaType]:
    return db.query(MediaType).filter(MediaType.id == media_type_id).first()

def get_company_media_types(
    db: Session,
    company_id: int,
    skip: int = 0,
    limit: int = 100,
    include_inactive: bool = False
) -> List[MediaType]:
    query = db.query(MediaType).filter(MediaType.company_id == company_id)
    if not include_inactive:
        query = query.filter(MediaType.is_active == True)
    return query.offset(skip).limit(limit).all()

def create_media_type(
    db: Session,
    company_id: int,
    media_type: MediaTypeCreate
) -> MediaType:
    db_media_type = MediaType(**media_type.dict(), company_id=company_id)
    db.add(db_media_type)
    db.commit()
    db.refresh(db_media_type)
    return db_media_type

def update_media_type(
    db: Session,
    media_type_id: int,
    media_type: MediaTypeUpdate
) -> Optional[MediaType]:
    db_media_type = get_media_type(db, media_type_id)
    if not db_media_type:
        return None
    
    update_data = media_type.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_media_type, field, value)
    
    db.commit()
    db.refresh(db_media_type)
    return db_media_type

def delete_media_type(db: Session, media_type_id: int) -> bool:
    db_media_type = get_media_type(db, media_type_id)
    if not db_media_type:
        return False
    
    # Soft delete
    db_media_type.is_active = False
    db.commit()
    return True

# Assignment Services
def assign_products_to_user(
    db: Session,
    user_id: int,
    product_ids: List[int]
) -> bool:
    try:
        # Here we would update a user_products association table
        # Implementation depends on your specific requirements
        pass
        return True
    except Exception:
        return False

def get_user_assigned_products(
    db: Session,
    user_id: int,
    skip: int = 0,
    limit: int = 100
) -> List[Product]:
    # Implementation depends on your specific requirements
    pass