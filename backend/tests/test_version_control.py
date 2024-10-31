import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from datetime import datetime

from app.main import app
from app.models.models import User, Quotation, QuotationVersion
from app.core.auth import create_access_token

client = TestClient(app)

def create_test_user(db: Session):
    user = User(
        email="test@example.com",
        hashed_password="testpass",
        is_active=True,
        role="admin"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def create_test_quotation(db: Session, user_id: int):
    quotation = Quotation(
        customer_id=1,
        project_description="Test Project",
        created_by=user_id,
        valid_until=datetime.now()
    )
    db.add(quotation)
    db.commit()
    db.refresh(quotation)
    return quotation

def test_create_version(db: Session):
    """버전 생성 테스트"""
    # 테스트 사용자 및 견적서 생성
    user = create_test_user(db)
    quotation = create_test_quotation(db, user.id)
    
    # 액세스 토큰 생성
    access_token = create_access_token({"sub": str(user.id)})
    
    # 버전 생성 요청
    response = client.post(
        f"/api/quotations/{quotation.id}/versions",
        json={
            "changes": {
                "project_description": {
                    "old": "Test Project",
                    "new": "Updated Project"
                }
            }
        },
        headers={"Authorization": f"Bearer {access_token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["quotation_id"] == quotation.id
    assert data["version_number"] == 1
    assert "changes" in data

def test_get_version_history(db: Session):
    """버전 히스토리 조회 테스트"""
    # 테스트 사용자 및 견적서 생성
    user = create_test_user(db)
    quotation = create_test_quotation(db, user.id)
    
    # 여러 버전 생성
    for i in range(3):
        version = QuotationVersion(
            quotation_id=quotation.id,
            version_number=i+1,
            changes={"update": f"change_{i}"},
            created_by=user.id
        )
        db.add(version)
    db.commit()
    
    # 액세스 토큰 생성
    access_token = create_access_token({"sub": str(user.id)})
    
    # 버전 히스토리 조회
    response = client.get(
        f"/api/quotations/{quotation.id}/versions",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3
    assert data[0]["version_number"] == 3  # 최신 버전이 먼저 오는지 확인

def test_version_number_increment(db: Session):
    """버전 번호 자동 증가 테스트"""
    user = create_test_user(db)
    quotation = create_test_quotation(db, user.id)
    access_token = create_access_token({"sub": str(user.id)})
    
    # 연속해서 두 개의 버전 생성
    for i in range(2):
        response = client.post(
            f"/api/quotations/{quotation.id}/versions",
            json={"changes": {"update": f"change_{i}"}},
            headers={"Authorization": f"Bearer {access_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["version_number"] == i + 1

def test_unauthorized_access(db: Session):
    """권한 없는 접근 테스트"""
    quotation_id = 1
    
    # 토큰 없이 접근
    response = client.get(f"/api/quotations/{quotation_id}/versions")
    assert response.status_code == 401
    
    # 잘못된 토큰으로 접근
    response = client.get(
        f"/api/quotations/{quotation_id}/versions",
        headers={"Authorization": "Bearer invalid_token"}
    )
    assert response.status_code == 401