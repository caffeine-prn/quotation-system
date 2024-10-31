from typing import List, Optional
from datetime import datetime, date
from decimal import Decimal
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.models import Quotation, QuotationItem
from app.schemas.quotation import QuotationCreate, QuotationUpdate

def generate_quote_number() -> str:
    """견적서 번호 생성 (SO-YYMMDD-XXX 형식)"""
    today = datetime.now()
    return f"SO-{today.strftime('%y%m%d')}-{today.strftime('%H%M%S')}"

def calculate_total_amount(items: List[QuotationItem], discount_amount: Decimal) -> Decimal:
    """견적서 총액 계산"""
    total = sum((item.unit_price * item.quantity - item.discount_amount) for item in items)
    return total - discount_amount

def get_quotation(db: Session, quotation_id: int) -> Optional[Quotation]:
    return db.query(Quotation).filter(Quotation.id == quotation_id).first()

def get_quotations(
    db: Session,
    user_id: int,
    skip: int = 0,
    limit: int = 100,
    is_admin: bool = False
) -> List[Quotation]:
    query = db.query(Quotation)
    if not is_admin:
        query = query.filter(Quotation.created_by == user_id)
    return query.order_by(desc(Quotation.created_at)).offset(skip).limit(limit).all()

def create_quotation(
    db: Session,
    quotation: QuotationCreate,
    user_id: int
) -> Quotation:
    quotation_data = quotation.dict(exclude={'items'})
    db_quotation = Quotation(
        **quotation_data,
        quote_number=generate_quote_number(),
        version=1,
        created_by=user_id,
        status="draft",
        total_amount=Decimal('0')
    )
    db.add(db_quotation)
    db.flush()  # 견적서 ID 생성을 위해 flush

    # 견적서 항목 생성
    items = []
    for item in quotation.items:
        db_item = QuotationItem(
            **item.dict(),
            quotation_id=db_quotation.id
        )
        db.add(db_item)
        items.append(db_item)
    
    db.flush()
    
    # 총액 계산
    db_quotation.total_amount = calculate_total_amount(items, quotation_data['discount_amount'])
    
    db.commit()
    db.refresh(db_quotation)
    return db_quotation

def update_quotation(
    db: Session,
    quotation_id: int,
    quotation: QuotationUpdate,
    user_id: int,
    is_admin: bool = False
) -> Optional[Quotation]:
    db_quotation = get_quotation(db, quotation_id)
    if not db_quotation:
        return None
    
    if not is_admin and db_quotation.created_by != user_id:
        return None

    # 새로운 버전 생성
    new_version = db_quotation.version + 1
    
    # 기존 견적서 업데이트
    update_data = quotation.dict(exclude_unset=True)
    if 'items' in update_data:
        # 기존 항목 삭제
        db.query(QuotationItem).filter(QuotationItem.quotation_id == quotation_id).delete()
        
        # 새로운 항목 추가
        items = []
        for item in update_data['items']:
            db_item = QuotationItem(
                **item.dict(),
                quotation_id=quotation_id
            )
            db.add(db_item)
            items.append(db_item)
        
        db.flush()
        update_data['total_amount'] = calculate_total_amount(
            items,
            update_data.get('discount_amount', db_quotation.discount_amount)
        )
        del update_data['items']
    
    for field, value in update_data.items():
        setattr(db_quotation, field, value)
    
    db_quotation.version = new_version
    db_quotation.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(db_quotation)
    return db_quotation

def delete_quotation(
    db: Session,
    quotation_id: int,
    user_id: int,
    is_admin: bool = False
) -> bool:
    db_quotation = get_quotation(db, quotation_id)
    if not db_quotation:
        return False
    
    if not is_admin and db_quotation.created_by != user_id:
        return False

    db.delete(db_quotation)
    db.commit()
    return True

def get_quotation_versions(
    db: Session,
    quote_number: str,
    user_id: int,
    is_admin: bool = False
) -> List[Quotation]:
    """특정 견적서의 모든 버전 조회"""
    query = db.query(Quotation).filter(Quotation.quote_number == quote_number)
    if not is_admin:
        query = query.filter(Quotation.created_by == user_id)
    return query.order_by(desc(Quotation.version)).all()

def update_quotation_status(
    db: Session,
    quotation_id: int,
    status: str,
    user_id: int,
    is_admin: bool = False
) -> Optional[Quotation]:
    """견적서 상태 업데이트"""
    db_quotation = get_quotation(db, quotation_id)
    if not db_quotation:
        return None
    
    if not is_admin and db_quotation.created_by != user_id:
        return None

    db_quotation.status = status
    db_quotation.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(db_quotation)
    return db_quotation