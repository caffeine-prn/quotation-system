from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Numeric, Text, Date, JSON, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    products = relationship("Product", back_populates="company")

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    company = relationship("Company", back_populates="products")

class PriceTable(Base):
    __tablename__ = "price_tables"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    unit = Column(String)
    unit_price = Column(Numeric(10, 2))
    description = Column(Text)
    valid_from = Column(Date)
    valid_until = Column(Date)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Quotation(Base):
    __tablename__ = "quotations"

    id = Column(Integer, primary_key=True, index=True)
    quote_number = Column(String, unique=True)
    version = Column(Integer, default=1)
    customer_id = Column(Integer, ForeignKey("companies.id"))
    project_description = Column(Text)
    created_by = Column(Integer, ForeignKey("users.id"))
    valid_until = Column(Date)
    total_amount = Column(Numeric(10, 2))
    discount_amount = Column(Numeric(10, 2))
    status = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    items = relationship("QuotationItem", back_populates="quotation")
    customer = relationship("Company")
    creator = relationship("User")

class QuotationItem(Base):
    __tablename__ = "quotation_items"

    id = Column(Integer, primary_key=True, index=True)
    quotation_id = Column(Integer, ForeignKey("quotations.id"))
    price_table_id = Column(Integer, ForeignKey("price_tables.id"))
    quantity = Column(Integer)
    unit_price = Column(Numeric(10, 2))
    discount_amount = Column(Numeric(10, 2))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    quotation = relationship("Quotation", back_populates="items")
    price_table = relationship("PriceTable")

class MediaType(Base):
    __tablename__ = "media_types"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class QuotationVersion(Base):
    __tablename__ = "quotation_versions"
    
    id = Column(Integer, primary_key=True)
    quotation_id = Column(Integer, ForeignKey("quotations.id"))
    version_number = Column(Integer)
    changes = Column(JSON)
    created_at = Column(DateTime, default=func.now())
    created_by = Column(Integer, ForeignKey("users.id"))
    
    quotation = relationship("Quotation")
    creator = relationship("User")