from sqlalchemy.orm import Session
from app.models.models import QuotationVersion
from typing import List

class VersionService:
    def __init__(self, db: Session):
        self.db = db
        
    def create_version(self, quotation_id: int, changes: dict, user_id: int) -> QuotationVersion:
        """새로운 버전 생성"""
        latest_version = self.get_latest_version(quotation_id)
        version_number = (latest_version.version_number + 1) if latest_version else 1
        
        new_version = QuotationVersion(
            quotation_id=quotation_id,
            version_number=version_number,
            changes=changes,
            created_by=user_id
        )
        
        self.db.add(new_version)
        self.db.commit()
        self.db.refresh(new_version)
        return new_version
    
    def get_version_history(self, quotation_id: int) -> List[QuotationVersion]:
        """버전 히스토리 조회"""
        return (
            self.db.query(QuotationVersion)
            .filter(QuotationVersion.quotation_id == quotation_id)
            .order_by(QuotationVersion.version_number.desc())
            .all()
        )
        
    def get_latest_version(self, quotation_id: int) -> QuotationVersion:
        """최신 버전 조회"""
        return (
            self.db.query(QuotationVersion)
            .filter(QuotationVersion.quotation_id == quotation_id)
            .order_by(QuotationVersion.version_number.desc())
            .first()
        )
        
    def get_version(self, quotation_id: int, version_number: int) -> QuotationVersion:
        """특정 버전 조회"""
        return (
            self.db.query(QuotationVersion)
            .filter(
                QuotationVersion.quotation_id == quotation_id,
                QuotationVersion.version_number == version_number
            )
            .first()
        )